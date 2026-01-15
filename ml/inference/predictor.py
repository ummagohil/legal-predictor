"""
Inference module for making predictions with trained models.
"""
import logging
from typing import Dict, List, Optional, Tuple, Union

import numpy as np
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

logger = logging.getLogger(__name__)


class LegalPredictor:
    """
    Predictor class for ECHR article violation prediction.
    
    Can load models from Hugging Face Hub or local paths.
    """
    
    ARTICLE_LABELS = [
        "Article 2 - Right to life",
        "Article 3 - Prohibition of torture",
        "Article 5 - Right to liberty",
        "Article 6 - Right to fair trial",
        "Article 8 - Right to private life",
        "Article 10 - Freedom of expression",
        "Article 11 - Freedom of assembly",
        "Article 13 - Right to effective remedy",
        "Article 14 - Prohibition of discrimination",
        "Article 34 - Individual applications",
        "Protocol 1-1 - Protection of property",
        "Protocol 1-3 - Right to free elections",
        "Protocol 4-2 - Freedom of movement",
        "Protocol 7-1 - Procedural safeguards",
    ]
    
    def __init__(
        self,
        model_name_or_path: str,
        device: Optional[str] = None,
        threshold: float = 0.5,
    ):
        """
        Initialize the predictor.
        
        Args:
            model_name_or_path: Hugging Face Hub ID or local path.
            device: Device to run inference on (auto-detected if None).
            threshold: Probability threshold for positive predictions.
        """
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.threshold = threshold
        
        logger.info(f"Loading model from {model_name_or_path}")
        
        self.tokenizer = AutoTokenizer.from_pretrained(model_name_or_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_name_or_path
        ).to(self.device)
        self.model.eval()
        
        logger.info(f"Model loaded on {self.device}")
    
    def predict(
        self,
        text: Union[str, List[str]],
        return_probabilities: bool = True,
    ) -> Dict:
        """
        Predict article violations for given text(s).
        
        Args:
            text: Single text or list of texts to analyze.
            return_probabilities: Whether to return raw probabilities.
            
        Returns:
            Dictionary with predictions and optional probabilities.
        """
        # Handle single text
        if isinstance(text, str):
            text = [text]
            single_input = True
        else:
            single_input = False
        
        # Tokenize
        inputs = self.tokenizer(
            text,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt",
        ).to(self.device)
        
        # Predict
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.sigmoid(logits).cpu().numpy()
        
        # Apply threshold
        predictions = (probabilities >= self.threshold).astype(int)
        
        # Format results
        results = []
        for i in range(len(text)):
            pred_result = {
                "predicted_violations": [
                    self.ARTICLE_LABELS[j]
                    for j in range(len(self.ARTICLE_LABELS))
                    if predictions[i, j] == 1
                ],
                "num_violations": int(predictions[i].sum()),
            }
            
            if return_probabilities:
                pred_result["probabilities"] = {
                    self.ARTICLE_LABELS[j]: float(probabilities[i, j])
                    for j in range(len(self.ARTICLE_LABELS))
                }
                pred_result["top_predictions"] = sorted(
                    pred_result["probabilities"].items(),
                    key=lambda x: x[1],
                    reverse=True,
                )[:5]
            
            results.append(pred_result)
        
        if single_input:
            return results[0]
        return {"predictions": results}
    
    def predict_batch(
        self,
        texts: List[str],
        batch_size: int = 32,
    ) -> List[Dict]:
        """
        Predict on a batch of texts efficiently.
        
        Args:
            texts: List of texts to analyze.
            batch_size: Batch size for inference.
            
        Returns:
            List of prediction dictionaries.
        """
        all_results = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_results = self.predict(batch)
            all_results.extend(batch_results["predictions"])
        
        return all_results


# Hugging Face Inference API integration
class HuggingFaceInferenceClient:
    """
    Client for Hugging Face Inference API.
    
    Use this when the model is hosted on Hugging Face Hub
    and you want to call it via API instead of loading locally.
    """
    
    def __init__(self, model_id: str, api_token: Optional[str] = None):
        """
        Initialize the inference client.
        
        Args:
            model_id: Hugging Face Hub model ID.
            api_token: Hugging Face API token (optional for public models).
        """
        try:
            from huggingface_hub import InferenceClient
        except ImportError:
            raise ImportError("Please install huggingface_hub: pip install huggingface_hub")
        
        self.client = InferenceClient(model=model_id, token=api_token)
        self.model_id = model_id
    
    def predict(self, text: str) -> Dict:
        """
        Make prediction via Inference API.
        
        Args:
            text: Text to analyze.
            
        Returns:
            Prediction results from API.
        """
        result = self.client.text_classification(text)
        return result
