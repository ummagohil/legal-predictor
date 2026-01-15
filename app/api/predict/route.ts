import { type NextRequest, NextResponse } from "next/server"

const HF_API_URL = process.env.HF_INFERENCE_URL || "https://api-inference.huggingface.co/models"
const HF_MODEL_ID = process.env.HF_MODEL_ID || "your-username/legal-bert-ecthr"
const HF_API_TOKEN = process.env.HF_API_TOKEN

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

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    if (!HF_API_TOKEN) {
      return NextResponse.json({ error: "HF_API_TOKEN not configured" }, { status: 500 })
    }

    const response = await fetch(`${HF_API_URL}/${HF_MODEL_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_API_TOKEN}`,
      },
      body: JSON.stringify({ inputs: text }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Prediction failed: ${response.statusText}`, details: errorText },
        { status: response.status },
      )
    }

    const hfResult = await response.json()

    // Transform HF response
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

    return NextResponse.json({
      predicted_violations: predictions,
      num_violations: predictions.length,
      probabilities,
      top_predictions: sortedPredictions,
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
