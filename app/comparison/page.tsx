"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const comparisonData = [
  { model: "LegalBERT", f1Micro: 87.3, f1Macro: 82.1, precision: 85.6, recall: 89.2 },
  { model: "BERT Base", f1Micro: 81.2, f1Macro: 76.4, precision: 79.8, recall: 82.7 },
  { model: "RoBERTa", f1Micro: 84.5, f1Macro: 79.8, precision: 83.1, recall: 86.0 },
  { model: "DistilBERT", f1Micro: 78.9, f1Macro: 73.2, precision: 77.4, recall: 80.5 },
]

const perArticleData = [
  { article: "Art. 2", legalBert: 0.91, bertBase: 0.85, roberta: 0.88 },
  { article: "Art. 3", legalBert: 0.94, bertBase: 0.89, roberta: 0.92 },
  { article: "Art. 5", legalBert: 0.88, bertBase: 0.82, roberta: 0.85 },
  { article: "Art. 6", legalBert: 0.92, bertBase: 0.87, roberta: 0.9 },
  { article: "Art. 8", legalBert: 0.86, bertBase: 0.79, roberta: 0.83 },
  { article: "Art. 10", legalBert: 0.89, bertBase: 0.83, roberta: 0.86 },
  { article: "Art. 13", legalBert: 0.84, bertBase: 0.77, roberta: 0.81 },
  { article: "Art. 14", legalBert: 0.82, bertBase: 0.74, roberta: 0.79 },
]

const radarData = [
  { metric: "F1 Micro", legalBert: 87, bertBase: 81, roberta: 85 },
  { metric: "F1 Macro", legalBert: 82, bertBase: 76, roberta: 80 },
  { metric: "Precision", legalBert: 86, bertBase: 80, roberta: 83 },
  { metric: "Recall", legalBert: 89, bertBase: 83, roberta: 86 },
  { metric: "Accuracy", legalBert: 86, bertBase: 80, roberta: 83 },
]

const detailedMetrics = [
  {
    model: "LegalBERT",
    f1Micro: 0.873,
    f1Macro: 0.821,
    precision: 0.856,
    recall: 0.892,
    accuracy: 0.856,
    inferenceMs: 120,
    params: "110M",
    best: true,
  },
  {
    model: "BERT Base",
    f1Micro: 0.812,
    f1Macro: 0.764,
    precision: 0.798,
    recall: 0.827,
    accuracy: 0.798,
    inferenceMs: 115,
    params: "110M",
    best: false,
  },
  {
    model: "RoBERTa",
    f1Micro: 0.845,
    f1Macro: 0.798,
    precision: 0.831,
    recall: 0.86,
    accuracy: 0.831,
    inferenceMs: 125,
    params: "125M",
    best: false,
  },
  {
    model: "DistilBERT",
    f1Micro: 0.789,
    f1Macro: 0.732,
    precision: 0.774,
    recall: 0.805,
    accuracy: 0.774,
    inferenceMs: 65,
    params: "66M",
    best: false,
  },
]

export default function ComparisonPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Model Comparison</h1>
          <p className="text-muted-foreground">
            Compare performance metrics across different model architectures trained on ECtHR cases.
          </p>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="per-article">Per-Article</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Overall Performance</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    F1 scores and precision/recall comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      f1Micro: { label: "F1 Micro", color: "hsl(var(--chart-1))" },
                      f1Macro: { label: "F1 Macro", color: "hsl(var(--chart-2))" },
                      precision: { label: "Precision", color: "hsl(var(--chart-3))" },
                      recall: { label: "Recall", color: "hsl(var(--chart-4))" },
                    }}
                    className="h-[350px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="model" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[70, 95]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar dataKey="f1Micro" name="F1 Micro" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="f1Macro" name="F1 Macro" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="precision" name="Precision" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="recall" name="Recall" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Performance Radar</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Multi-dimensional metric comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      legalBert: { label: "LegalBERT", color: "hsl(var(--chart-1))" },
                      bertBase: { label: "BERT Base", color: "hsl(var(--chart-2))" },
                      roberta: { label: "RoBERTa", color: "hsl(var(--chart-3))" },
                    }}
                    className="h-[350px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[70, 100]}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={10}
                        />
                        <Radar
                          name="LegalBERT"
                          dataKey="legalBert"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="BERT Base"
                          dataKey="bertBase"
                          stroke="hsl(var(--chart-2))"
                          fill="hsl(var(--chart-2))"
                          fillOpacity={0.3}
                        />
                        <Radar
                          name="RoBERTa"
                          dataKey="roberta"
                          stroke="hsl(var(--chart-3))"
                          fill="hsl(var(--chart-3))"
                          fillOpacity={0.3}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="per-article" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Per-Article F1 Scores</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Model performance breakdown by ECHR article
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    legalBert: { label: "LegalBERT", color: "hsl(var(--chart-1))" },
                    bertBase: { label: "BERT Base", color: "hsl(var(--chart-2))" },
                    roberta: { label: "RoBERTa", color: "hsl(var(--chart-3))" },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={perArticleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="article" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0.7, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="legalBert"
                        name="LegalBERT"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-1))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bertBase"
                        name="BERT Base"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-2))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="roberta"
                        name="RoBERTa"
                        stroke="hsl(var(--chart-3))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-3))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Detailed Metrics Table</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Complete performance metrics for all trained models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Model</TableHead>
                      <TableHead className="text-muted-foreground">F1 Micro</TableHead>
                      <TableHead className="text-muted-foreground">F1 Macro</TableHead>
                      <TableHead className="text-muted-foreground">Precision</TableHead>
                      <TableHead className="text-muted-foreground">Recall</TableHead>
                      <TableHead className="text-muted-foreground">Accuracy</TableHead>
                      <TableHead className="text-muted-foreground">Inference</TableHead>
                      <TableHead className="text-muted-foreground">Params</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedMetrics.map((metric) => (
                      <TableRow key={metric.model} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            {metric.model}
                            {metric.best && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                Best
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{(metric.f1Micro * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-foreground">{(metric.f1Macro * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-foreground">{(metric.precision * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-foreground">{(metric.recall * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-foreground">{(metric.accuracy * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-muted-foreground">{metric.inferenceMs}ms</TableCell>
                        <TableCell className="text-muted-foreground">{metric.params}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
