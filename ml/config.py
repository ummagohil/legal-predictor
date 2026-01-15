"""
Configuration for LegalBERT fine-tuning on ECtHR cases.
"""
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ModelConfig:
    """Model configuration."""
    model_name: str = "nlpaueb/legal-bert-base-uncased"
    num_labels: int = 14  # Number of ECHR articles to predict
    max_length: int = 512
    hidden_dropout_prob: float = 0.1
    attention_probs_dropout_prob: float = 0.1


@dataclass
class TrainingConfig:
    """Training configuration."""
    output_dir: str = "./outputs"
    num_train_epochs: int = 10
    per_device_train_batch_size: int = 8
    per_device_eval_batch_size: int = 16
    learning_rate: float = 2e-5
    weight_decay: float = 0.01
    warmup_ratio: float = 0.1
    logging_steps: int = 100
    eval_steps: int = 500
    save_steps: int = 500
    load_best_model_at_end: bool = True
    metric_for_best_model: str = "f1_micro"
    greater_is_better: bool = True
    fp16: bool = True
    gradient_accumulation_steps: int = 2
    seed: int = 42


@dataclass
class DataConfig:
    """Data configuration."""
    dataset_name: str = "ecthr_cases"
    train_split: str = "train"
    validation_split: str = "validation"
    test_split: str = "test"
    text_column: str = "facts"
    label_column: str = "violated_articles"
    
    # ECHR article mapping
    article_labels: List[str] = field(default_factory=lambda: [
        "Article 2",   # Right to life
        "Article 3",   # Prohibition of torture
        "Article 5",   # Right to liberty and security
        "Article 6",   # Right to a fair trial
        "Article 8",   # Right to respect for private life
        "Article 10",  # Freedom of expression
        "Article 11",  # Freedom of assembly
        "Article 13",  # Right to an effective remedy
        "Article 14",  # Prohibition of discrimination
        "Article 34",  # Individual applications
        "P1-1",        # Protection of property
        "P1-3",        # Right to free elections
        "P4-2",        # Freedom of movement
        "P7-1",        # Procedural safeguards relating to expulsion
    ])


@dataclass
class HuggingFaceConfig:
    """Hugging Face Hub configuration."""
    push_to_hub: bool = True
    hub_model_id: Optional[str] = None
    hub_strategy: str = "every_save"
    private: bool = False


def get_config():
    """Get complete configuration."""
    return {
        "model": ModelConfig(),
        "training": TrainingConfig(),
        "data": DataConfig(),
        "hub": HuggingFaceConfig(),
    }
