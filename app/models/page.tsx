import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, ExternalLink, Clock, Cpu } from "lucide-react"

const models = [
  {
    id: "legalbert-ecthr-v1",
    name: "LegalBERT ECtHR v1",
    baseModel: "nlpaueb/legal-bert-base-uncased",
    trainedOn: "11,000 ECtHR cases",
    version: "1.0.0",
    lastUpdated: "2024-01-15",
    status: "ready" as const,
    metrics: {
      f1Micro: 0.873,
      accuracy: 0.856,
      inferenceTime: 120,
    },
  },
  {
    id: "bert-base-ecthr",
    name: "BERT Base ECtHR",
    baseModel: "bert-base-uncased",
    trainedOn: "11,000 ECtHR cases",
    version: "1.0.0",
    lastUpdated: "2024-01-10",
    status: "ready" as const,
    metrics: {
      f1Micro: 0.812,
      accuracy: 0.798,
      inferenceTime: 115,
    },
  },
  {
    id: "roberta-ecthr",
    name: "RoBERTa ECtHR",
    baseModel: "roberta-base",
    trainedOn: "11,000 ECtHR cases",
    version: "0.9.0",
    lastUpdated: "2024-01-08",
    status: "ready" as const,
    metrics: {
      f1Micro: 0.845,
      accuracy: 0.831,
      inferenceTime: 125,
    },
  },
]

export default function ModelsPage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Trained Models</h1>
          <p className="text-muted-foreground">
            View and manage your fine-tuned models for ECHR article violation prediction.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card key={model.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <Badge
                    variant={model.status === "ready" ? "default" : "secondary"}
                    className={
                      model.status === "ready" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""
                    }
                  >
                    {model.status}
                  </Badge>
                </div>
                <CardTitle className="text-foreground mt-4">{model.name}</CardTitle>
                <CardDescription className="text-muted-foreground">Based on {model.baseModel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">F1 Score</p>
                    <p className="text-foreground font-semibold">{(model.metrics.f1Micro * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Accuracy</p>
                    <p className="text-foreground font-semibold">{(model.metrics.accuracy * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{model.metrics.inferenceTime}ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{model.trainedOn}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>v{model.version}</span>
                    <span>Updated {model.lastUpdated}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-border bg-transparent" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Hugging Face
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
