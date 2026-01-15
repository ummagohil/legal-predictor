"""
Training script for LegalBERT on ECtHR cases.
"""
import logging
import os
from typing import Dict, Optional

import numpy as np
import torch
from datasets import DatasetDict
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    classification_report,
)
from transformers import (
    AutoTokenizer,
    EarlyStoppingCallback,
    Trainer,
    TrainingArguments,
)

from ml.config import DataConfig, ModelConfig, TrainingConfig, HuggingFaceConfig
from ml.data.dataset_loader import ECtHRDatasetLoader
from ml.models.legal_bert_classifier import load_hf_classifier

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def compute_metrics(eval_pred) -> Dict[str, float]:
    """
    Compute metrics for multi-label classification.
    
    Args:
        eval_pred: EvalPrediction with predictions and label_ids.
        
    Returns:
        Dictionary of metric names to values.
    """
    predictions, labels = eval_pred
    
    # Apply sigmoid and threshold
    predictions = torch.sigmoid(torch.tensor(predictions)).numpy()
    predictions = (predictions >= 0.5).astype(int)
    labels = labels.astype(int)
    
    # Compute metrics
    metrics = {
        "f1_micro": f1_score(labels, predictions, average="micro", zero_division=0),
        "f1_macro": f1_score(labels, predictions, average="macro", zero_division=0),
        "f1_weighted": f1_score(labels, predictions, average="weighted", zero_division=0),
        "precision_micro": precision_score(labels, predictions, average="micro", zero_division=0),
        "recall_micro": recall_score(labels, predictions, average="micro", zero_division=0),
        "precision_macro": precision_score(labels, predictions, average="macro", zero_division=0),
        "recall_macro": recall_score(labels, predictions, average="macro", zero_division=0),
    }
    
    # Per-label accuracy
    for i in range(labels.shape[1]):
        label_acc = accuracy_score(labels[:, i], predictions[:, i])
        metrics[f"accuracy_label_{i}"] = label_acc
    
    return metrics


class LegalBERTTrainer:
    """Trainer for LegalBERT on ECtHR dataset."""
    
    def __init__(
        self,
        model_config: ModelConfig,
        training_config: TrainingConfig,
        data_config: DataConfig,
        hub_config: HuggingFaceConfig,
    ):
        self.model_config = model_config
        self.training_config = training_config
        self.data_config = data_config
        self.hub_config = hub_config
        
        # Initialize tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(model_config.model_name)
        
        # Initialize data loader
        self.data_loader = ECtHRDatasetLoader(
            tokenizer=self.tokenizer,
            max_length=model_config.max_length,
            article_labels=data_config.article_labels,
        )
        
        # Initialize model
        self.model = load_hf_classifier(
            model_name=model_config.model_name,
            num_labels=model_config.num_labels,
        )
        
        logger.info(f"Initialized trainer with model: {model_config.model_name}")
    
    def prepare_data(self) -> DatasetDict:
        """Load and preprocess data."""
        return self.data_loader.get_processed_datasets()
    
    def get_training_args(self) -> TrainingArguments:
        """Create training arguments."""
        return TrainingArguments(
            output_dir=self.training_config.output_dir,
            num_train_epochs=self.training_config.num_train_epochs,
            per_device_train_batch_size=self.training_config.per_device_train_batch_size,
            per_device_eval_batch_size=self.training_config.per_device_eval_batch_size,
            learning_rate=self.training_config.learning_rate,
            weight_decay=self.training_config.weight_decay,
            warmup_ratio=self.training_config.warmup_ratio,
            logging_steps=self.training_config.logging_steps,
            eval_strategy="steps",
            eval_steps=self.training_config.eval_steps,
            save_strategy="steps",
            save_steps=self.training_config.save_steps,
            load_best_model_at_end=self.training_config.load_best_model_at_end,
            metric_for_best_model=self.training_config.metric_for_best_model,
            greater_is_better=self.training_config.greater_is_better,
            fp16=self.training_config.fp16,
            gradient_accumulation_steps=self.training_config.gradient_accumulation_steps,
            seed=self.training_config.seed,
            report_to=["tensorboard", "wandb"],
            push_to_hub=self.hub_config.push_to_hub,
            hub_model_id=self.hub_config.hub_model_id,
            hub_strategy=self.hub_config.hub_strategy,
            hub_private_repo=self.hub_config.private,
        )
    
    def train(self) -> Dict:
        """Run training."""
        logger.info("Starting training...")
        
        # Prepare data
        datasets = self.prepare_data()
        
        # Create trainer
        training_args = self.get_training_args()
        
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=datasets["train"],
            eval_dataset=datasets["validation"],
            tokenizer=self.tokenizer,
            compute_metrics=compute_metrics,
            callbacks=[EarlyStoppingCallback(early_stopping_patience=3)],
        )
        
        # Train
        train_result = trainer.train()
        
        # Save final model
        trainer.save_model()
        
        # Evaluate on test set
        logger.info("Evaluating on test set...")
        test_results = trainer.evaluate(datasets["test"])
        
        # Save metrics
        metrics = {
            "train": train_result.metrics,
            "test": test_results,
        }
        
        logger.info(f"Training complete. Test F1 (micro): {test_results.get('eval_f1_micro', 'N/A')}")
        
        return metrics


def main():
    """Main training entry point."""
    from ml.config import get_config
    
    config = get_config()
    
    trainer = LegalBERTTrainer(
        model_config=config["model"],
        training_config=config["training"],
        data_config=config["data"],
        hub_config=config["hub"],
    )
    
    metrics = trainer.train()
    print(f"\nFinal metrics: {metrics}")


if __name__ == "__main__":
    main()
