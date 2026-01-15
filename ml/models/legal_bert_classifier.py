"""
LegalBERT classifier for multi-label ECHR article violation prediction.
"""
import logging
from typing import Dict, List, Optional, Tuple, Union

import torch
import torch.nn as nn
from transformers import (
    AutoConfig,
    AutoModel,
    AutoModelForSequenceClassification,
    PreTrainedModel,
)

logger = logging.getLogger(__name__)


class LegalBERTForMultiLabelClassification(PreTrainedModel):
    """
    LegalBERT model for multi-label classification of ECHR article violations.
    """
    
    def __init__(self, config):
        super().__init__(config)
        self.num_labels = config.num_labels
        
        # Load base LegalBERT model
        self.bert = AutoModel.from_config(config)
        
        # Classification head
        classifier_dropout = getattr(config, "classifier_dropout", config.hidden_dropout_prob)
        self.dropout = nn.Dropout(classifier_dropout)
        self.classifier = nn.Linear(config.hidden_size, config.num_labels)
        
        # Initialize weights
        self.post_init()
    
    def forward(
        self,
        input_ids: Optional[torch.Tensor] = None,
        attention_mask: Optional[torch.Tensor] = None,
        token_type_ids: Optional[torch.Tensor] = None,
        position_ids: Optional[torch.Tensor] = None,
        head_mask: Optional[torch.Tensor] = None,
        inputs_embeds: Optional[torch.Tensor] = None,
        labels: Optional[torch.Tensor] = None,
        output_attentions: Optional[bool] = None,
        output_hidden_states: Optional[bool] = None,
        return_dict: Optional[bool] = None,
    ) -> Dict[str, torch.Tensor]:
        """
        Forward pass with optional label loss computation.
        """
        return_dict = return_dict if return_dict is not None else self.config.use_return_dict
        
        outputs = self.bert(
            input_ids,
            attention_mask=attention_mask,
            token_type_ids=token_type_ids,
            position_ids=position_ids,
            head_mask=head_mask,
            inputs_embeds=inputs_embeds,
            output_attentions=output_attentions,
            output_hidden_states=output_hidden_states,
            return_dict=return_dict,
        )
        
        # Use [CLS] token representation
        pooled_output = outputs.last_hidden_state[:, 0, :]
        pooled_output = self.dropout(pooled_output)
        logits = self.classifier(pooled_output)
        
        loss = None
        if labels is not None:
            # Binary cross-entropy for multi-label classification
            loss_fct = nn.BCEWithLogitsLoss()
            loss = loss_fct(logits, labels.float())
        
        return {
            "loss": loss,
            "logits": logits,
            "hidden_states": outputs.hidden_states if output_hidden_states else None,
            "attentions": outputs.attentions if output_attentions else None,
        }
    
    def predict(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
        threshold: float = 0.5,
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Make predictions with probability threshold.
        
        Args:
            input_ids: Input token IDs.
            attention_mask: Attention mask.
            threshold: Probability threshold for positive prediction.
            
        Returns:
            Tuple of (predictions, probabilities).
        """
        self.eval()
        with torch.no_grad():
            outputs = self.forward(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs["logits"]
            probabilities = torch.sigmoid(logits)
            predictions = (probabilities >= threshold).int()
        
        return predictions, probabilities


def load_legal_bert_classifier(
    model_name: str = "nlpaueb/legal-bert-base-uncased",
    num_labels: int = 14,
    from_pretrained: Optional[str] = None,
) -> LegalBERTForMultiLabelClassification:
    """
    Load LegalBERT classifier, either fresh or from checkpoint.
    
    Args:
        model_name: Base model name from Hugging Face Hub.
        num_labels: Number of classification labels.
        from_pretrained: Path or Hub ID to load fine-tuned model from.
        
    Returns:
        Initialized LegalBERT classifier.
    """
    if from_pretrained:
        logger.info(f"Loading fine-tuned model from {from_pretrained}")
        config = AutoConfig.from_pretrained(from_pretrained)
        model = LegalBERTForMultiLabelClassification.from_pretrained(
            from_pretrained,
            config=config,
        )
    else:
        logger.info(f"Initializing new model from {model_name}")
        config = AutoConfig.from_pretrained(model_name)
        config.num_labels = num_labels
        
        # Load base weights and create custom model
        model = LegalBERTForMultiLabelClassification(config)
        
        # Load pretrained BERT weights
        base_model = AutoModel.from_pretrained(model_name)
        model.bert.load_state_dict(base_model.state_dict())
    
    return model


# Alternative: Use HuggingFace's built-in multi-label classification
def load_hf_classifier(
    model_name: str = "nlpaueb/legal-bert-base-uncased",
    num_labels: int = 14,
) -> AutoModelForSequenceClassification:
    """
    Load using Hugging Face's AutoModelForSequenceClassification.
    Configure for multi-label classification.
    """
    config = AutoConfig.from_pretrained(
        model_name,
        num_labels=num_labels,
        problem_type="multi_label_classification",
    )
    
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        config=config,
    )
    
    return model
