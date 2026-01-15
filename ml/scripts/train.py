#!/usr/bin/env python3
"""
Training script entry point for LegalBERT fine-tuning.

Usage:
    python -m ml.scripts.train
    
Or with custom config:
    python -m ml.scripts.train --output_dir ./my_outputs --epochs 5
"""
import argparse
import logging
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from ml.config import get_config, ModelConfig, TrainingConfig, DataConfig, HuggingFaceConfig
from ml.training.trainer import LegalBERTTrainer

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Fine-tune LegalBERT on ECtHR cases")
    
    # Model arguments
    parser.add_argument(
        "--model_name",
        type=str,
        default="nlpaueb/legal-bert-base-uncased",
        help="Base model name from Hugging Face Hub"
    )
    
    # Training arguments
    parser.add_argument(
        "--output_dir",
        type=str,
        default="./outputs",
        help="Output directory for model checkpoints"
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=10,
        help="Number of training epochs"
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=8,
        help="Training batch size"
    )
    parser.add_argument(
        "--learning_rate",
        type=float,
        default=2e-5,
        help="Learning rate"
    )
    
    # Hub arguments
    parser.add_argument(
        "--push_to_hub",
        action="store_true",
        help="Push trained model to Hugging Face Hub"
    )
    parser.add_argument(
        "--hub_model_id",
        type=str,
        default=None,
        help="Model ID for Hugging Face Hub"
    )
    
    return parser.parse_args()


def main():
    """Main entry point for training."""
    args = parse_args()
    
    logger.info("Starting LegalBERT training pipeline...")
    logger.info(f"Arguments: {args}")
    
    # Create configs from arguments
    model_config = ModelConfig(
        model_name=args.model_name,
    )
    
    training_config = TrainingConfig(
        output_dir=args.output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        learning_rate=args.learning_rate,
    )
    
    data_config = DataConfig()
    
    hub_config = HuggingFaceConfig(
        push_to_hub=args.push_to_hub,
        hub_model_id=args.hub_model_id,
    )
    
    # Initialize trainer
    trainer = LegalBERTTrainer(
        model_config=model_config,
        training_config=training_config,
        data_config=data_config,
        hub_config=hub_config,
    )
    
    # Run training
    metrics = trainer.train()
    
    logger.info("Training complete!")
    logger.info(f"Final metrics: {metrics}")
    
    return metrics


if __name__ == "__main__":
    main()
