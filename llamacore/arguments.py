from dataclasses import dataclass, field
from typing import List, Optional

import torch
from transformers import TrainingArguments


@dataclass
class HFTrainerArguments(TrainingArguments):
    """Arguments for huggingface/transformers.Trainer"""
    dataloader_num_workers: int = 1
    per_device_train_batch_size: int = 1  # 减小批次大小适应7B模型
    per_device_eval_batch_size: int = 1
    gradient_accumulation_steps: int = 8  # 增加梯度累积
    text_seq_length: int = 2048  # LLaMA的序列长度

    # LLaMA-specific params
    learning_rate: float = 2e-5  # 适合大模型的学习率
    adam_beta1: float = 0.9
    adam_beta2: float = 0.95
    max_grad_norm: float = 1.0
    weight_decay: float = 0.1

    total_steps: int = 100000  # 增加训练步数
    warmup_steps: int = 2000
    adam_epsilon: float = 1e-8
    clamp_value: float = 1000.0

    fp16: bool = True  # 启用混合精度训练
    do_train: bool = True

    logging_steps: int = 50
    max_steps: int = 10 ** 20
    save_steps: int = 1000
    save_total_limit: int = 3

    output_dir: str = "llama2_outputs"

    @property
    def batch_size_per_step(self):
        """Compute the number of training sequences contributed by each .step() from this peer"""
        total_batch_size_per_step = self.per_device_train_batch_size * self.gradient_accumulation_steps
        if torch.cuda.device_count() > 0:
            total_batch_size_per_step *= torch.cuda.device_count()
        return total_batch_size_per_step


@dataclass
class TPUTrainerArguments(HFTrainerArguments):
    num_tpus: int = 8  # the total number of TPU cores in use
    wandb_project: str = "huggingface"

    @property
    def batch_size_per_step(self):
        """Compute the number of training sequences contributed by each .step() from this peer"""
        return self.per_device_train_batch_size * self.gradient_accumulation_steps * self.num_tpus


@dataclass
class CollaborativeArguments:
    """Configuration for CollaborativeOptimzier and its internals"""
    target_batch_size: int = field(
        default=4096,
        metadata={"help": "Perform optimizer step after all peers collectively accumulate this many samples"},
    )
    matchmaking_time: float = field(
        default=15.0, metadata={"help": "Averaging group will wait for stragglers for at most this many seconds"}
    )
    allreduce_timeout: float = field(
        default=60, metadata={"help": "Give up on a given all-reduce round after this many seconds"}
    )
    averaging_timeout: float = field(
        default=180, metadata={"help": "Give up on averaging step after this many seconds"}
    )
    reuse_grad_buffers: bool = field(default=True, metadata={
        "help": "Whether or not to use model's .grad buffers for accumulating gradients across local steps. This "
                "optimization reduces GPU memory consumption but may result in incorrect gradients when using some "
                "advanced techniques (e.g. applying custom loss scaler)"})


@dataclass
class BasePeerArguments:
    """Base arguments that are used for both trainers and for auxiliary peers such as training monitor"""
    experiment_prefix: str = field(default="llama2-7b-collaborative", metadata={"help": "A unique experiment name, used as prefix for all DHT keys"})
    tokenizer_path: Optional[str] = field(default="meta-llama/Llama-2-7b-hf", metadata={"help": "Path to the tokenizer"})
    cache_dir: Optional[str] = field(default="./cache", metadata={"help": "Path to the cache"})

    authorize: bool = field(default=True, metadata={"help": "Whether or not to use HF authorizer"})
    client_mode: bool = field(
        default=True,  # 默认使用客户端模式以隐藏网络信息
        metadata={"help": "Of True, runs training without incoming connections, in a firewall-compatible mode"},
    )
    initial_peers: List[str] = field(
        default_factory=list,
        metadata={
            "help": "Multiaddrs of the peers that will welcome you into the existing collaboration. "
            "Example: /ip4/203.0.113.1/tcp/31337/p2p/XXXX /ip4/203.0.113.2/udp/7777/quic/p2p/YYYY"
        },
    )
    use_ipfs: bool = field(
        default=False,
        metadata={
            "help": "Use IPFS to find initial_peers. If enabled, you only need to provide /p2p/XXXX part of multiaddrs "
            "for the initial_peers (no need to specify a particular IPv4/IPv6 address and port)"
        },
    )
    host_maddrs: List[str] = field(
        default_factory=lambda: ["/ip4/127.0.0.1/tcp/0"],  # 只监听本地地址
        metadata={
            "help": "Multiaddrs to listen for external connections from other p2p instances. "
            "Defaults to localhost only for privacy"
        },
    )
    announce_maddrs: List[str] = field(
        default_factory=list,  # 不公布任何地址
        metadata={"help": "Visible multiaddrs the host announces for external connections from other p2p instances"},
    )
    identity_path: Optional[str] = field(
        default=None,
        metadata={
            "help": "Path to a pre-generated private key file. If defined, makes the peer ID deterministic. "
            "May be generated using ``./p2p-keygen`` from ``go-libp2p-daemon``."
        },
    )


@dataclass
class TrainingPeerArguments(BasePeerArguments):
    statistics_expiration: float = field(
        default=600, metadata={"help": "Statistics will be removed if not updated in this many seconds"}
    )
    backup_every_steps: Optional[int] = field(
        default=None, metadata={"help": "Update training state backup on disk once in this many global steps "
                                        "(default = do not update local state)"}
    )
    state_path: str = field(
        default="state.zip", metadata={"help": "Load this state upon init and when recovering from NaN parameters"})


@dataclass
class AuxiliaryPeerArguments(BasePeerArguments):
    """
    Arguments for run_aux_peer.py that is responsible for connecting peers to one another, tracking
    learning curves, assisting in all-reduce and uploading checkpoints to the hub
    """
    refresh_period: float = field(default=10, metadata={"help": "Period (in seconds) for fetching the keys from DHT"})
    wandb_project: Optional[str] = field(
        default=None, metadata={"help": "Name of Weights & Biases project to report the training progress to"}
    )
    save_checkpoint_step_interval: int = field(
        default=2, metadata={"help": "Frequency (in steps) of fetching and saving state from peers"}
    )
    repo_url: Optional[str] = field(
        default=None, metadata={"help": "URL of Hugging Face Hub repository to upload the model and optimizer states"}
    )
    local_path: Optional[str] = field(
        default="Repo", metadata={"help": "Path to local repository to store the model and optimizer states"}
    )
    upload_interval: Optional[float] = field(
        default=None, metadata={"help": "Frequency (in seconds) of uploading the model to Hub"}
    )
    store_checkpoints: bool = field(default=True, metadata={"help": "If True, enables CheckpointHandler"})
    assist_in_averaging: bool = field(
        default=False, metadata={"help": "If True, this peer will facilitate averaging for other (training) peers"})
    assist_refresh: float = field(default=1.0, metadata={"help": "Period (in seconds) for tryin to assist averaging"})
