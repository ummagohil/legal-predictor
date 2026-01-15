"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Line,
  LineChart,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

// Sample fairness data by respondent country
const demographicParityData = [
  { country: "Turkey", positiveRate: 0.72, cases: 2341 },
  { country: "Russia", positiveRate: 0.68, cases: 1892 },
  { country: "Romania", positiveRate: 0.61, cases: 1123 },
  { country: "Ukraine", positiveRate: 0.58, cases: 987 },
  { country: "Poland", positiveRate: 0.52, cases: 756 },
  { country: "Italy", positiveRate: 0.48, cases: 654 },
  { country: "France", positiveRate: 0.45, cases: 543 },
  { country: "UK", positiveRate: 0.41, cases: 432 },
]

const equalizedOddsData = [
  { country: "Turkey", tpr: 0.89, fpr: 0.15 },
  { country: "Russia", tpr: 0.85, fpr: 0.18 },
  { country: "Romania", tpr: 0.82, fpr: 0.12 },
  { country: "Ukraine", tpr: 0.79, fpr: 0.14 },
  { country: "Poland", tpr: 0.76, fpr: 0.11 },
  { country: "Italy", tpr: 0.74, fpr: 0.09 },
  { country: "France", tpr: 0.72, fpr: 0.08 },
  { country: "UK", tpr: 0.71, fpr: 0.07 },
]

const calibrationData = [
  { bin: "0.0-0.1", predicted: 0.05, actual: 0.04 },
  { bin: "0.1-0.2", predicted: 0.15, actual: 0.14 },
  { bin: "0.2-0.3", predicted: 0.25, actual: 0.23 },
  { bin: "0.3-0.4", predicted: 0.35, actual: 0.36 },
  { bin: "0.4-0.5", predicted: 0.45, actual: 0.48 },
  { bin: "0.5-0.6", predicted: 0.55, actual: 0.54 },
  { bin: "0.6-0.7", predicted: 0.65, actual: 0.62 },
  { bin: "0.7-0.8", predicted: 0.75, actual: 0.78 },
  { bin: "0.8-0.9", predicted: 0.85, actual: 0.83 },
  { bin: "0.9-1.0", predicted: 0.95, actual: 0.94 },
]

const articleFairnessData = [
  { article: "Art. 2", disparity: 0.08, status: "low" },
  { article: "Art. 3", disparity: 0.12, status: "medium" },
  { article: "Art. 5", disparity: 0.15, status: "medium" },
  { article: "Art. 6", disparity: 0.09, status: "low" },
  { article: "Art. 8", disparity: 0.18, status: "high" },
  { article: "Art. 10", disparity: 0.11, status: "medium" },
  { article: "Art. 13", disparity: 0.22, status: "high" },
  { article: "Art. 14", disparity: 0.25, status: "high" },
]

export default function FairnessPage() {
  const [selectedModel, setSelectedModel] = useState("legalbert-ecthr-v1")
  const [selectedArticle, setSelectedArticle] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "bg-emerald-500"
      case "medium":
        return "bg-amber-500"
      case "high":
        return "bg-destructive"
      default:
        return "bg-muted"
    }
  }

  const getBarColor = (disparity: number) => {
    if (disparity < 0.1) return "#10b981" // emerald
    if (disparity < 0.15) return "#f59e0b" // amber
    return "#ef4444" // red
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Fairness Analysis</h1>
          <p className="text-muted-foreground">
            Evaluate model bias and fairness across demographic groups and legal categories.
          </p>
        </header>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Model:</span>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px] bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="legalbert-ecthr-v1">LegalBERT ECtHR v1</SelectItem>
                <SelectItem value="bert-base-ecthr">BERT Base ECtHR</SelectItem>
                <SelectItem value="roberta-ecthr">RoBERTa ECtHR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Article:</span>
            <Select value={selectedArticle} onValueChange={setSelectedArticle}>
              <SelectTrigger className="w-[150px] bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Articles</SelectItem>
                <SelectItem value="art2">Article 2</SelectItem>
                <SelectItem value="art3">Article 3</SelectItem>
                <SelectItem value="art5">Article 5</SelectItem>
                <SelectItem value="art6">Article 6</SelectItem>
                <SelectItem value="art8">Article 8</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mean Disparity</p>
                  <p className="text-2xl font-semibold text-foreground">0.15</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Disparity</p>
                  <p className="text-2xl font-semibold text-foreground">0.31</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Info className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Disparity Labels</p>
                  <p className="text-2xl font-semibold text-foreground">3 / 14</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="bg-amber-500/10 border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-foreground">Fairness Concern Detected</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Articles 8, 13, and 14 show demographic parity disparity above 0.15 threshold across respondent countries.
            Consider rebalancing training data or applying fairness constraints.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="demographic" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="demographic">Demographic Parity</TabsTrigger>
            <TabsTrigger value="equalized">Equalized Odds</TabsTrigger>
            <TabsTrigger value="calibration">Calibration</TabsTrigger>
            <TabsTrigger value="per-article">Per-Article Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="demographic" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Demographic Parity by Country</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Positive prediction rates across respondent countries (should be similar if model is fair)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    positiveRate: { label: "Positive Rate", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicParityData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        type="number"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <YAxis type="category" dataKey="country" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="positiveRate" name="Positive Rate" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]}>
                        {demographicParityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.positiveRate > 0.6 ? "#f59e0b" : "#6366f1"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equalized" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Equalized Odds Analysis</CardTitle>
                <CardDescription className="text-muted-foreground">
                  True Positive Rate (TPR) and False Positive Rate (FPR) by country
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    tpr: { label: "True Positive Rate", color: "hsl(var(--chart-1))" },
                    fpr: { label: "False Positive Rate", color: "hsl(var(--chart-4))" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={equalizedOddsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="country" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="tpr" name="True Positive Rate" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fpr" name="False Positive Rate" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calibration" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Calibration Curve</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Predicted probability vs actual outcome rate (perfect calibration = diagonal line)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    predicted: { label: "Predicted", color: "hsl(var(--chart-1))" },
                    actual: { label: "Actual", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={calibrationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="bin" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        name="Predicted"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        name="Actual"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-2))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="per-article" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Per-Article Disparity</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Demographic parity disparity for each ECHR article
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articleFairnessData.map((item) => (
                    <div key={item.article} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground w-16">{item.article}</span>
                          <Badge
                            className={`${
                              item.status === "low"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : item.status === "medium"
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : "bg-destructive/20 text-destructive border-destructive/30"
                            }`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{(item.disparity * 100).toFixed(1)}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={item.disparity * 100} className="h-2 bg-secondary" />
                        <div
                          className={`absolute top-0 left-0 h-2 rounded-full ${getStatusColor(item.status)}`}
                          style={{ width: `${item.disparity * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Disparity by Article</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Visual comparison of fairness metrics across articles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    disparity: { label: "Disparity", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={articleFairnessData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="article" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 0.3]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="disparity" name="Disparity" radius={[4, 4, 0, 0]}>
                        {articleFairnessData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry.disparity)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
