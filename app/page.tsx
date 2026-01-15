import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, BarChart3, Shield } from "lucide-react"
import Link from "next/link"

const stats = [
  { label: "Cases Analyzed", value: "11,000+", change: "+12%" },
  { label: "Model Accuracy", value: "87.3%", change: "+2.1%" },
  { label: "Articles Covered", value: "14", change: "" },
  { label: "Avg. Inference", value: "120ms", change: "-15%" },
]

const features = [
  {
    title: "Document Analysis",
    description: "Upload legal documents and get instant article violation predictions",
    icon: FileText,
    href: "/predict",
  },
  {
    title: "Model Comparison",
    description: "Compare performance metrics across different model configurations",
    icon: BarChart3,
    href: "/comparison",
  },
  {
    title: "Fairness Analysis",
    description: "Evaluate model bias and fairness across demographic groups",
    icon: Shield,
    href: "/fairness",
  },
]

export default function HomePage() {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground tracking-tight text-balance">Legal Decision Predictor</h1>
          <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
            Predict European Court of Human Rights article violations using fine-tuned LegalBERT models trained on HUDOC
            cases.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
                  {stat.change && <span className="text-xs text-emerald-500">{stat.change}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card border-border group hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={feature.href}>
                  <Button variant="ghost" className="px-0 text-primary hover:text-primary/80">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Supported ECHR Articles</CardTitle>
            <CardDescription className="text-muted-foreground">
              Multi-label classification for the following Convention articles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[2, 3, 5, 6, 8, 10, 11, 13, 14, 34, "P1-1", "P1-3", "P4-2", "P7-1"].map((article) => (
                <div key={article} className="px-4 py-3 rounded-lg bg-secondary text-center">
                  <p className="text-xs text-muted-foreground">Article</p>
                  <p className="text-lg font-semibold text-foreground">{article}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
