import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your Legal Decision Predictor application.</p>
        </header>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Hugging Face Integration</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure your Hugging Face API credentials for model inference.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hf-token" className="text-foreground">
                API Token
              </Label>
              <Input
                id="hf-token"
                type="password"
                placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                className="bg-secondary border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Your Hugging Face API token for accessing inference endpoints.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model-id" className="text-foreground">
                Model ID
              </Label>
              <Input
                id="model-id"
                placeholder="your-username/legal-bert-ecthr"
                className="bg-secondary border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">The Hugging Face Hub model ID for your fine-tuned model.</p>
            </div>

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Save Configuration</Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Prediction Settings</CardTitle>
            <CardDescription className="text-muted-foreground">Configure default prediction behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="threshold" className="text-foreground">
                Prediction Threshold
              </Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                max="1"
                step="0.05"
                defaultValue="0.5"
                className="bg-secondary border-border text-foreground w-32"
              />
              <p className="text-xs text-muted-foreground">
                Probability threshold for positive predictions (0.0 - 1.0).
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Show Confidence Scores</Label>
                <p className="text-xs text-muted-foreground">Display probability scores alongside predictions.</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Enable Batch Processing</Label>
                <p className="text-xs text-muted-foreground">Allow processing multiple documents at once.</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Cache Predictions</Label>
                <p className="text-xs text-muted-foreground">Cache prediction results for faster repeat queries.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Fairness Settings</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure fairness evaluation parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="disparity-threshold" className="text-foreground">
                Disparity Alert Threshold
              </Label>
              <Input
                id="disparity-threshold"
                type="number"
                min="0"
                max="1"
                step="0.05"
                defaultValue="0.15"
                className="bg-secondary border-border text-foreground w-32"
              />
              <p className="text-xs text-muted-foreground">
                Trigger alerts when demographic parity disparity exceeds this value.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground">Enable Fairness Monitoring</Label>
                <p className="text-xs text-muted-foreground">Continuously monitor predictions for fairness issues.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
