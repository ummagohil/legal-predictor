"""
Fairness evaluation for legal prediction models.
"""
import logging
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.metrics import confusion_matrix

logger = logging.getLogger(__name__)


class FairnessEvaluator:
    """
    Evaluate fairness metrics for legal prediction models.
    
    Measures bias across demographic groups and legal categories.
    """
    
    def __init__(self, label_names: List[str]):
        self.label_names = label_names
        self.num_labels = len(label_names)
    
    def compute_demographic_parity(
        self,
        predictions: np.ndarray,
        group_labels: np.ndarray,
        group_names: List[str],
    ) -> Dict[str, Dict[str, float]]:
        """
        Compute demographic parity: P(Y_hat=1 | G=g) should be similar across groups.
        
        Args:
            predictions: Binary predictions (n_samples, n_labels).
            group_labels: Group membership for each sample (n_samples,).
            group_names: Names of the groups.
            
        Returns:
            Dictionary with demographic parity metrics per label and group.
        """
        results = {}
        
        for label_idx, label_name in enumerate(self.label_names):
            label_preds = predictions[:, label_idx]
            
            group_rates = {}
            for group_idx, group_name in enumerate(group_names):
                group_mask = group_labels == group_idx
                if group_mask.sum() > 0:
                    positive_rate = label_preds[group_mask].mean()
                    group_rates[group_name] = float(positive_rate)
            
            # Calculate disparity (max difference between groups)
            rates = list(group_rates.values())
            disparity = max(rates) - min(rates) if len(rates) > 1 else 0.0
            
            results[label_name] = {
                "group_rates": group_rates,
                "disparity": disparity,
            }
        
        return results
    
    def compute_equalized_odds(
        self,
        predictions: np.ndarray,
        labels: np.ndarray,
        group_labels: np.ndarray,
        group_names: List[str],
    ) -> Dict[str, Dict[str, Dict[str, float]]]:
        """
        Compute equalized odds: TPR and FPR should be similar across groups.
        
        Args:
            predictions: Binary predictions (n_samples, n_labels).
            labels: True labels (n_samples, n_labels).
            group_labels: Group membership for each sample (n_samples,).
            group_names: Names of the groups.
            
        Returns:
            Dictionary with TPR/FPR per label and group.
        """
        results = {}
        
        for label_idx, label_name in enumerate(self.label_names):
            label_preds = predictions[:, label_idx]
            label_true = labels[:, label_idx]
            
            group_metrics = {}
            for group_idx, group_name in enumerate(group_names):
                group_mask = group_labels == group_idx
                
                if group_mask.sum() > 0:
                    g_preds = label_preds[group_mask]
                    g_true = label_true[group_mask]
                    
                    # Calculate TPR (True Positive Rate)
                    positive_mask = g_true == 1
                    tpr = g_preds[positive_mask].mean() if positive_mask.sum() > 0 else 0.0
                    
                    # Calculate FPR (False Positive Rate)
                    negative_mask = g_true == 0
                    fpr = g_preds[negative_mask].mean() if negative_mask.sum() > 0 else 0.0
                    
                    group_metrics[group_name] = {
                        "tpr": float(tpr),
                        "fpr": float(fpr),
                    }
            
            results[label_name] = group_metrics
        
        return results
    
    def compute_calibration_by_group(
        self,
        probabilities: np.ndarray,
        labels: np.ndarray,
        group_labels: np.ndarray,
        group_names: List[str],
        n_bins: int = 10,
    ) -> Dict[str, Dict[str, Dict[str, List[float]]]]:
        """
        Compute calibration curves per group to detect calibration bias.
        
        Args:
            probabilities: Predicted probabilities (n_samples, n_labels).
            labels: True labels (n_samples, n_labels).
            group_labels: Group membership for each sample (n_samples,).
            group_names: Names of the groups.
            n_bins: Number of calibration bins.
            
        Returns:
            Dictionary with calibration curves per label and group.
        """
        results = {}
        bin_edges = np.linspace(0, 1, n_bins + 1)
        
        for label_idx, label_name in enumerate(self.label_names):
            label_probs = probabilities[:, label_idx]
            label_true = labels[:, label_idx]
            
            group_calibration = {}
            for group_idx, group_name in enumerate(group_names):
                group_mask = group_labels == group_idx
                
                if group_mask.sum() > 0:
                    g_probs = label_probs[group_mask]
                    g_true = label_true[group_mask]
                    
                    mean_predicted = []
                    mean_actual = []
                    
                    for i in range(n_bins):
                        bin_mask = (g_probs >= bin_edges[i]) & (g_probs < bin_edges[i + 1])
                        if bin_mask.sum() > 0:
                            mean_predicted.append(float(g_probs[bin_mask].mean()))
                            mean_actual.append(float(g_true[bin_mask].mean()))
                    
                    group_calibration[group_name] = {
                        "mean_predicted": mean_predicted,
                        "mean_actual": mean_actual,
                    }
            
            results[label_name] = group_calibration
        
        return results
    
    def generate_fairness_report(
        self,
        predictions: np.ndarray,
        probabilities: np.ndarray,
        labels: np.ndarray,
        group_labels: np.ndarray,
        group_names: List[str],
    ) -> Dict:
        """
        Generate comprehensive fairness report.
        
        Returns:
            Dictionary containing all fairness metrics.
        """
        report = {
            "demographic_parity": self.compute_demographic_parity(
                predictions, group_labels, group_names
            ),
            "equalized_odds": self.compute_equalized_odds(
                predictions, labels, group_labels, group_names
            ),
            "calibration": self.compute_calibration_by_group(
                probabilities, labels, group_labels, group_names
            ),
        }
        
        # Compute overall fairness scores
        dp_disparities = [
            v["disparity"] 
            for v in report["demographic_parity"].values()
        ]
        report["summary"] = {
            "mean_demographic_parity_disparity": float(np.mean(dp_disparities)),
            "max_demographic_parity_disparity": float(np.max(dp_disparities)),
            "labels_with_high_disparity": [
                name for name, v in report["demographic_parity"].items()
                if v["disparity"] > 0.1
            ],
        }
        
        return report


def evaluate_country_fairness(
    predictions: np.ndarray,
    probabilities: np.ndarray,
    labels: np.ndarray,
    countries: List[str],
) -> Dict:
    """
    Evaluate fairness across respondent countries.
    
    This is particularly relevant for ECtHR cases where we want to ensure
    the model doesn't discriminate based on the country involved.
    """
    unique_countries = sorted(set(countries))
    country_to_idx = {c: i for i, c in enumerate(unique_countries)}
    country_labels = np.array([country_to_idx[c] for c in countries])
    
    label_names = [
        "Art. 2", "Art. 3", "Art. 5", "Art. 6", "Art. 8", 
        "Art. 10", "Art. 11", "Art. 13", "Art. 14", "Art. 34",
        "P1-1", "P1-3", "P4-2", "P7-1"
    ]
    
    evaluator = FairnessEvaluator(label_names)
    return evaluator.generate_fairness_report(
        predictions, probabilities, labels, country_labels, unique_countries
    )
