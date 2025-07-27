import os
from dataclasses import asdict
from itertools import cycle, islice
from pathlib import Path

import hivemind
import torch
import torch.nn as nn
import transformers
from transformers import (
    LlamaForCausalLM, 
    LlamaTokenizer, 
    DataCollatorForLanguageModeling,
    get_linear_schedule_with_warmup
)
from hivemind import SizeAdaptiveCompression, Float16Compression, Uniform8BitQuantization

import utils
from arguments import HFTrainerArguments, BasePeerArguments, CollaborativeArguments
from data import make_dataset
from huggingface_auth import authorize_with_huggingface
from lib.training.lamb_8bit import CPULAMB8Bit

logger = hivemind.get_logger(__name__)

class ModelWrapper(nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, input_ids, attention_mask, labels=None):
        outputs = self.model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
        return {'loss': outputs.loss}

class TrainingTask:
    """A container that defines the training config, model, tokenizer, optimizer and other local training utilities"""
    _authorizer = _dht = _collaborative_optimizer = _training_dataset = None

    def __init__(
            self, peer_args: BasePeerArguments, trainer_args: HFTrainerArguments, collab_args: CollaborativeArguments):
        self.peer_args, self.trainer_args, self.collab_args = peer_args, trainer_args, collab_args
        self.trainer_args.run_name = "llama2-7b-training"  # 隐藏用户信息

        self.validators, self.local_public_key = utils.make_validators(self.peer_args.experiment_prefix)
        transformers.set_seed(trainer_args.seed)  # seed used for initialization

        # 使用 LLaMA tokenizer
        self.tokenizer = LlamaTokenizer.from_pretrained(
            "meta-llama/Llama-2-7b-hf",
            cache_dir=peer_args.cache_dir,
            use_auth_token=True
        )
        self.tokenizer.pad_token = self.tokenizer.eos_token
        self.tokenizer.padding_side = "right"

        logger.info(f"Creating LLaMA 2 7B model")
        # 加载 LLaMA 2 7B 模型
        self.base_model = LlamaForCausalLM.from_pretrained(
            "meta-llama/Llama-2-7b-hf",
            cache_dir=peer_args.cache_dir,
            use_auth_token=True,
            torch_dtype=torch.float16 if trainer_args.fp16 else torch.float32,
            device_map="auto" if torch.cuda.is_available() else None
        )
        
        logger.info(f"Trainable parameters: "
                    f"{sum(param.numel() for param in self.base_model.parameters() if param.requires_grad)}")
        self.model = ModelWrapper(self.base_model)

        output_dir = Path(trainer_args.output_dir)
        logger.info(f'Checkpoint dir {output_dir}, contents {list(output_dir.glob("checkpoint*"))}')
        latest_checkpoint_dir = max(output_dir.glob("checkpoint*"), default=None, key=os.path.getctime)
        if latest_checkpoint_dir is not None:
            logger.info(f"Loading model from {latest_checkpoint_dir}")
            self.model.load_state_dict(torch.load(f"{latest_checkpoint_dir}/model_state.pt"))

    @property
    def authorizer(self):
        if self._authorizer is None and self.peer_args.authorize:
            self._authorizer = authorize_with_huggingface()
        return self._authorizer

    @property
    def dht(self):
        if self._dht is None:
            # 隐藏 IP 信息的配置
            self._dht = hivemind.DHT(
                start=True,
                initial_peers=self.peer_args.initial_peers,
                client_mode=self.peer_args.client_mode,
                host_maddrs=["/ip4/127.0.0.1/tcp/0"],  # 只监听本地
                announce_maddrs=[],  # 不公布地址
                use_ipfs=self.peer_args.use_ipfs,
                record_validators=self.validators,
                identity_path=self.peer_args.identity_path,
                authorizer=self.authorizer,
            )
            if self.peer_args.client_mode:
                logger.info(f"Created client mode peer with anonymized peer_id")
            else:
                logger.info(f"Created server mode peer with hidden network info")
        return self._dht

    @property
    def collaborative_optimizer(self):
        if self._collaborative_optimizer is None:
            params, opt, scheduler = self._get_local_optimizer_and_scheduler(self.trainer_args)
            averaging_compression = SizeAdaptiveCompression(
                threshold=2 ** 16 + 1, less=Float16Compression(), greater_equal=Uniform8BitQuantization())
            self._collaborative_optimizer = hivemind.Optimizer(
                dht=self.dht, run_id=self.peer_args.experiment_prefix,
                params=params, optimizer=opt, scheduler=scheduler,
                offload_optimizer=True, delay_grad_averaging=False, delay_optimizer_step=True,
                batch_size_per_step=self.trainer_args.batch_size_per_step,
                grad_compression=averaging_compression, state_averaging_compression=averaging_compression,
                client_mode=self.peer_args.client_mode, verbose=False,  # 减少日志输出
                **asdict(self.collab_args))
        return self._collaborative_optimizer

    def _get_local_optimizer_and_scheduler(self, training_args: HFTrainerArguments):
        no_decay = ["bias", "LayerNorm.weight"]
        params = [
            {
                "params": [p for n, p in self.model.named_parameters()
                           if not any(nd in n for nd in no_decay) and p.requires_grad],
                "weight_decay": training_args.weight_decay,
            },
            {
                "params": [p for n, p in self.model.named_parameters()
                           if any(nd in n for nd in no_decay) and p.requires_grad],
                "weight_decay": 0.0,
            },
        ]

        opt = lambda params: CPULAMB8Bit(
            params,
            lr=training_args.learning_rate,
            betas=(training_args.adam_beta1, training_args.adam_beta2),
            eps=training_args.adam_epsilon,
            weight_decay=training_args.weight_decay,
            max_grad_norm=training_args.max_grad_norm,
            clamp_value=training_args.clamp_value,
            reuse_grad_buffers=True,
        )

        scheduler = lambda opt: get_linear_schedule_with_warmup(
            opt, num_warmup_steps=training_args.warmup_steps, num_training_steps=training_args.total_steps
        )

        return params, opt, scheduler

    @property
    def training_dataset(self):
        if self._training_dataset is None:
            self._training_dataset = make_dataset(
                self.tokenizer, shuffle_seed=hash(self.local_public_key) % 2 ** 31,
                max_sequence_length=self.trainer_args.text_seq_length
            )
        return self._training_dataset

    @property
    def data_collator(self):
        return DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False,  # 因果语言建模
            pad_to_multiple_of=8 if self.trainer_args.fp16 else None
        )
