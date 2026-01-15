export interface ModelInfo {
  id: string
  name: string
  baseModel: string
  trainedOn: string
  version: string
  lastUpdated: string
  status: "ready" | "training" | "error"
}

export interface ModelMetrics {
  f1Micro: number
  f1Macro: number
  precisionMicro: number
  recallMicro: number
  accuracy: number
  inferenceTime: number
  perLabelMetrics: Record<
    string,
    {
      precision: number
      recall: number
      f1: number
      support: number
    }
  >
}

export interface ComparisonData {
  model: string
  f1Micro: number
  f1Macro: number
  precision: number
  recall: number
}

export interface FairnessMetric {
  article: string
  disparity: number
  groupRates: Record<string, number>
}
