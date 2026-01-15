/**
 * API client for Legal Decision Predictor
 */

export interface PredictionResult {
  predicted_violations: string[]
  num_violations: number
  probabilities: Record<string, number>
  top_predictions: [string, number][]
}

export interface ModelMetrics {
  model_name: string
  f1_micro: number
  f1_macro: number
  precision_micro: number
  recall_micro: number
  accuracy: number
  per_label_metrics: Record<
    string,
    {
      precision: number
      recall: number
      f1: number
      support: number
    }
  >
}

export interface FairnessReport {
  demographic_parity: Record<
    string,
    {
      group_rates: Record<string, number>
      disparity: number
    }
  >
  equalized_odds: Record<
    string,
    Record<
      string,
      {
        tpr: number
        fpr: number
      }
    >
  >
  summary: {
    mean_demographic_parity_disparity: number
    max_demographic_parity_disparity: number
    labels_with_high_disparity: string[]
  }
}

export async function predictViolations(text: string): Promise<PredictionResult> {
  const response = await fetch("/api/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || `Prediction failed: ${response.statusText}`)
  }

  return response.json()
}
