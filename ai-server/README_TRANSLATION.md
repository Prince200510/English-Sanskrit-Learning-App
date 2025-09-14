# English to Sanskrit Translation App

This application provides dual translation modes for English to Sanskrit translation:

## Translation Methods

### 1. AI API Method (Gemini)

- Uses Google's Gemini AI API
- Requires internet connection and API key
- General purpose translation

### 2. Local Model Method

- Uses locally trained mBART model (modelv2)
- Runs offline once model is loaded
- Specialized for English→Sanskrit translation
- Higher accuracy for Sanskrit translation

## Setup Instructions

### Backend Setup (ai-server)

1. Install dependencies:

```bash
cd ai-server
npm install
```

2. For local model support, install Python dependencies:

```bash
pip install torch transformers
```

3. Start the server:

```bash
npm start
```

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

## API Endpoints

### GET /translate/methods

Returns available translation methods and their status.

### POST /translate/english-to-sanskrit

Translate English text to Sanskrit using specified method.

**Request Body:**

```json
{
  "text": "Hello world",
  "method": "api" // or "local"
}
```

**Response:**

```json
{
  "success": true,
  "originalText": "Hello world",
  "translatedText": "नमस्कार विश्व",
  "method": "local",
  "sourceLanguage": "English",
  "targetLanguage": "Sanskrit",
  "timestamp": "2025-09-13T..."
}
```

## Model Files

The `modelv2` folder contains the trained mBART model:

- `config.json` - Model configuration
- `model.safetensors` - Model weights
- `tokenizer.json` - Tokenizer configuration
- Other supporting files

## Features

- **Dropdown Selection**: Choose between AI API and Local Model
- **Method Availability Check**: Automatically detects if local model is available
- **Fallback Support**: Falls back to AI API if local model fails
- **Sanskrit Focus**: Optimized specifically for English to Sanskrit translation
- **Real-time Translation**: Fast translation with both methods

## Usage

1. Open the translation page
2. Set "From" language to English and "To" language to Sanskrit
3. A dropdown will appear to select translation method:
   - **AI API (Gemini)**: General AI-powered translation
   - **Local Model**: Specialized Sanskrit translation model
4. Enter your English text
5. Click "Translate" to get Sanskrit output

## Notes

- Local model requires Python environment with transformers library
- Local model provides more accurate Sanskrit translations
- AI API method works for all language pairs
- Model files are copied to ai-server for deployment
