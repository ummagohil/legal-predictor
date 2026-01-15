"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, FileText, Loader2, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PredictionResult {
  predicted_violations: string[]
  num_violations: number
  probabilities: Record<string, number>
  top_predictions: [string, number][]
}

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

// Demo prediction function (replace with actual API call)
async function predictViolations(text: string): Promise<PredictionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simulated predictions based on text content
  const probabilities: Record<string, number> = {}
  ARTICLE_LABELS.forEach((label, idx) => {
    // Generate realistic-looking probabilities
    let prob = Math.random() * 0.3
    if (text.toLowerCase().includes("torture") && idx === 1) prob = 0.92
    if (text.toLowerCase().includes("detention") && idx === 2) prob = 0.85
    if (text.toLowerCase().includes("trial") && idx === 3) prob = 0.78
    if (text.toLowerCase().includes("privacy") && idx === 4) prob = 0.71
    if (text.toLowerCase().includes("expression") && idx === 5) prob = 0.83
    probabilities[label] = prob
  })

  const predictions = Object.entries(probabilities)
    .filter(([, score]) => score >= 0.5)
    .map(([label]) => label)

  const topPredictions = Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) as [string, number][]

  return {
    predicted_violations: predictions,
    num_violations: predictions.length,
    probabilities,
    top_predictions: topPredictions,
  }
}

export default function PredictPage() {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const prediction = await predictViolations(text)
      setResult(prediction)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setText(event.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Predict Article Violations</h1>
          <p className="text-muted-foreground">
            Enter case facts or upload a document to predict potential ECHR article violations.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Case Facts Input
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Paste the facts of the case or relevant legal text
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter the facts of the case here... For example: The applicant was detained by police without charge for 48 hours..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[300px] bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />

                <div className="flex items-center gap-4">
                  <Button
                    onClick={handlePredict}
                    disabled={!text.trim() || isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Predict Violations"
                    )}
                  </Button>

                  <label className="cursor-pointer">
                    <input type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                    <Button variant="outline" className="border-border bg-transparent" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </span>
                    </Button>
                  </label>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Prediction Results</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {result
                    ? `${result.num_violations} potential violation${result.num_violations !== 1 ? "s" : ""} detected`
                    : "Results will appear here after analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    {result.predicted_violations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Predicted Violations</p>
                        <div className="flex flex-wrap gap-2">
                          {result.predicted_violations.map((violation) => (
                            <Badge key={violation} className="bg-destructive/20 text-destructive border-destructive/30">
                              {violation.split(" - ")[0]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">Top Predictions</p>
                      {result.top_predictions.map(([label, probability]) => (
                        <div key={label} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="text-foreground font-medium">{(probability * 100).toFixed(1)}%</span>
                          </div>
                          <Progress value={probability * 100} className="h-2 bg-secondary" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <p>Enter case facts and click Predict to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
