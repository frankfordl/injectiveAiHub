import itertools
from typing import Optional

import hivemind
import numpy as np
from datasets import load_dataset

logger = hivemind.get_logger(__name__)

def preprocess_batch(batch, tokenizer, max_sequence_length: int):
    """预处理文本数据批次"""
    texts = batch['text']
    
    # 过滤空文本和过短文本
    mask = [text is not None and len(text.strip()) >= 10 for text in texts]
    logger.debug(f'{np.mean(mask) * 100:.1f}% of examples left after filtering')
    
    if any(mask):
        filtered_texts = list(itertools.compress(texts, mask))
        # 对文本进行tokenization
        result = tokenizer(
            filtered_texts,
            add_special_tokens=True,
            max_length=max_sequence_length,
            truncation=True,
            padding=False,
            return_attention_mask=True
        )
        # 为因果语言建模设置labels
        result['labels'] = result['input_ids'].copy()
    else:
        # 处理空批次的情况
        result = {'input_ids': [], 'attention_mask': [], 'labels': []}
    
    return result

def make_dataset(
    tokenizer,
    *,
    shuffle_buffer_size: int = 8192,
    shuffle_seed: Optional[int],
    preprocessing_batch_size: int = 256,
    max_sequence_length: int,
):
    """创建用于LLaMA训练的文本数据集"""
    # 使用 OpenWebText 数据集替代图像数据集
    ds = load_dataset('openwebtext', split='train', streaming=True)
    ds = ds.shuffle(shuffle_buffer_size, seed=shuffle_seed)
    ds = ds.map(
        lambda batch: preprocess_batch(batch, tokenizer, max_sequence_length),
        batched=True, 
        batch_size=preprocessing_batch_size,
        remove_columns=['text']  # 移除原始文本列
    )
    ds = ds.with_format('torch')
    return ds
