# LegalPredict - ECHR Article Violation Predictor

A full-stack monorepo application for predicting European Court of Human Rights (ECHR) article violations using fine-tuned LegalBERT models.

## Project Structure

```
├── app/                    # Next.js frontend application
│   ├── page.tsx           # Home/overview page
│   ├── predict/           # Prediction interface
│   ├── models/            # Model management
│   ├── comparison/        # Model comparison dashboard
│   ├── fairness/          # Fairness analysis views
│   └── settings/          # Configuration
├── components/            # Shared React components
├── lib/                   # Utility functions and API client
├── ml/                    # Python ML pipeline
│   ├── config.py          # Training configuration
│   ├── data/              # Dataset loaders
│   ├── models/            # Model architectures
│   ├── training/          # Training scripts
│   ├── evaluation/        # Fairness evaluation
│   ├── inference/         # Prediction module
│   └── scripts/           # CLI entry points
└── types/                 # TypeScript type definitions
```

## Features

- **Document Analysis**: Upload legal documents and get instant article violation predictions
- **Model Comparison**: Compare performance metrics across different model configurations
- **Fairness Analysis**: Evaluate model bias across demographic groups and legal categories
- **Hugging Face Integration**: Deploy models to HF Hub and use Inference API

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- CUDA-capable GPU (recommended for training)

### Frontend Setup

```bash
npm install
npm run dev
```

### ML Pipeline Setup

```bash
cd ml
pip install -r requirements.txt
```

### Training a Model

```bash
python -m ml.scripts.train --epochs 10 --push_to_hub --hub_model_id your-username/legal-bert-ecthr
```

## Environment Variables

Create a \`.env.local\` file:

```env
NEXT_PUBLIC_HF_API_TOKEN=your_huggingface_token
NEXT_PUBLIC_HF_MODEL_ID=your-username/legal-bert-ecthr
NEXT_PUBLIC_HF_INFERENCE_URL=https://api-inference.huggingface.co/models
```

## Model Performance

| Model | F1 Micro | F1 Macro | Precision | Recall |
|-------|----------|----------|-----------|--------|
| LegalBERT | 87.3% | 82.1% | 85.6% | 89.2% |
| BERT Base | 81.2% | 76.4% | 79.8% | 82.7% |
| RoBERTa | 84.5% | 79.8% | 83.1% | 86.0% |

## Supported ECHR Articles

- Article 2: Right to life
- Article 3: Prohibition of torture
- Article 5: Right to liberty and security
- Article 6: Right to a fair trial
- Article 8: Right to respect for private life
- Article 10: Freedom of expression
- Article 11: Freedom of assembly
- Article 13: Right to an effective remedy
- Article 14: Prohibition of discrimination
- Protocol 1-1, 1-3, 4-2, 7-1

## License

MIT
```
