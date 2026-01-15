"""
Dataset loader for ECtHR cases.
"""
import logging
from typing import Dict, List, Optional, Tuple

import numpy as np
import torch
from datasets import Dataset, DatasetDict, load_dataset
from transformers import PreTrainedTokenizer

logger = logging.getLogger(__name__)


class ECtHRDatasetLoader:
    """Loader for European Court of Human Rights cases dataset."""
    
    def __init__(
        self,
        tokenizer: PreTrainedTokenizer,
        max_length: int = 512,
        article_labels: Optional[List[str]] = None,
    ):
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.article_labels = article_labels or [
            "2", "3", "5", "6", "8", "10", "11", "13", "14", "34",
            "P1-1", "P1-3", "P4-2", "P7-1"
        ]
        self.label_to_id = {label: i for i, label in enumerate(self.article_labels)}
        self.id_to_label = {i: label for label, i in self.label_to_id.items()}
        self.num_labels = len(self.article_labels)
        
    def load_ecthr_dataset(self) -> DatasetDict:
        """
        Load ECtHR dataset from Hugging Face Hub.
        
        Returns:
            DatasetDict with train, validation, and test splits.
        """
        logger.info("Loading ECtHR dataset...")
        
        # Load the ECtHR dataset (LexGLUE version)
        dataset = load_dataset("lex_glue", "ecthr_a")
        
        logger.info(f"Dataset loaded: {dataset}")
        return dataset
    
    def preprocess_function(self, examples: Dict) -> Dict:
        """
        Preprocess examples for model input.
        
        Args:
            examples: Batch of examples from the dataset.
            
        Returns:
            Processed examples with input_ids, attention_mask, and labels.
        """
        # Tokenize the text
        # ECtHR dataset has 'text' field containing facts
        texts = examples.get("text", examples.get("facts", []))
        
        if isinstance(texts[0], list):
            # If text is a list of paragraphs, join them
            texts = [" ".join(t) if isinstance(t, list) else t for t in texts]
        
        tokenized = self.tokenizer(
            texts,
            padding="max_length",
            truncation=True,
            max_length=self.max_length,
            return_tensors=None,
        )
        
        # Convert labels to multi-hot encoding
        labels = examples["labels"]
        multi_hot_labels = []
        
        for label_list in labels:
            multi_hot = [0.0] * self.num_labels
            for label in label_list:
                if label < self.num_labels:
                    multi_hot[label] = 1.0
            multi_hot_labels.append(multi_hot)
        
        tokenized["labels"] = multi_hot_labels
        return tokenized
    
    def get_processed_datasets(self) -> DatasetDict:
        """
        Load and preprocess the entire dataset.
        
        Returns:
            Processed DatasetDict ready for training.
        """
        raw_dataset = self.load_ecthr_dataset()
        
        logger.info("Preprocessing dataset...")
        processed_dataset = raw_dataset.map(
            self.preprocess_function,
            batched=True,
            remove_columns=raw_dataset["train"].column_names,
            desc="Tokenizing",
        )
        
        # Set format for PyTorch
        processed_dataset.set_format(
            type="torch",
            columns=["input_ids", "attention_mask", "labels"],
        )
        
        logger.info("Dataset preprocessing complete.")
        return processed_dataset
    
    def get_sample_weights(self, dataset: Dataset) -> torch.Tensor:
        """
        Calculate sample weights for imbalanced dataset.
        
        Args:
            dataset: Training dataset.
            
        Returns:
            Tensor of sample weights.
        """
        labels = np.array([example["labels"].numpy() for example in dataset])
        
        # Calculate class frequencies
        class_counts = labels.sum(axis=0)
        total_samples = len(labels)
        
        # Inverse frequency weighting
        class_weights = total_samples / (self.num_labels * class_counts + 1e-6)
        
        # Calculate sample weights (sum of weights of active labels)
        sample_weights = np.sum(labels * class_weights, axis=1)
        sample_weights = sample_weights / sample_weights.mean()
        
        return torch.tensor(sample_weights, dtype=torch.float32)


def create_data_collator(tokenizer: PreTrainedTokenizer):
    """Create a data collator for the dataset."""
    from transformers import DataCollatorWithPadding
    return DataCollatorWithPadding(tokenizer=tokenizer)
