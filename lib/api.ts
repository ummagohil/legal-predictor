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

const HF_API_URL = process.env.NEXT_PUBLIC_HF_INFERENCE_URL || "https://api-inference.huggingface.co/models"
const HF_MODEL_ID = process.env.NEXT_PUBLIC_HF_MODEL_ID || "your-username/legal-bert-ecthr"

export async function predictViolations(text: string): Promise<PredictionResult> {
  const response = await fetch(`${HF_API_URL}/${HF_MODEL_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_HF_API_TOKEN}`,
    },
    body: JSON.stringify({ inputs: text }),
  })

  if (!response.ok) {
    throw new Error(`Prediction failed: ${response.statusText}`)
  }

  const result = await response.json()
  return transformHFResponse(result)
}

function transformHFResponse(hfResult: any[]): PredictionResult {
  const ARTICLE_LABELS = [
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

  const probabilities: Record<string, number> = {}
  const predictions: string[] = []

  hfResult.forEach((item: { label: string; score: number }, index: number) => {
    const label = ARTICLE_LABELS[index] || item.label
    probabilities[label] = item.score
    if (item.score >= 0.5) {
      predictions.push(label)
    }
  })

  const sortedPredictions = Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) as [string, number][]

  return {
    predicted_violations: predictions,
    num_violations: predictions.length,
    probabilities,
    top_predictions: sortedPredictions,
  }
}
