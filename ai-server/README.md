# AI Server for Language Learning 🚀

A robust Node.js/Express server leveraging Google's Gemini AI for advanced language learning features. This server powers translation, flash card generation, and grammar exercises for Sanskrit, Hindi, and English languages.

## Features 🌟

- **Translation Service**: Three-way translation between Sanskrit, Hindi, and English
- **Flash Cards**: AI-powered flash card generation for vocabulary learning
- **Grammar Exercises**: Dynamic generation of grammar exercises with multiple difficulty levels
- **Streaming Support**: Real-time text processing capabilities

## Getting Started 🏁

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

### Installation 🔧

1. **Clone the repository:**

   ```sh
   git clone https://github.com/rbl-project-ADD/ai-server.git
   ```

2. **Set up environment:**

   ```sh
   cd ai-server
   npm install
   cp .env.example .env
   ```

3. **Configure environment:**
   Add your Gemini API key to `.env`:

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the server:**
   ```sh
   npm start
   ```

## API Endpoints 🛣️

### Translation Service

| Endpoint            | Method | Description                                                           |
| ------------------- | ------ | --------------------------------------------------------------------- |
| `/translate/stream` | POST   | Stream translation results (not to be used)                           |
| `/translate/file`   | POST   | Process file for translation (if no file the text will be translated) |

### Flash Cards

| Endpoint               | Method | Description                     |
| ---------------------- | ------ | ------------------------------- |
| `/flashcards/generate` | POST   | Generate vocabulary flash cards |

### Grammar Exercises

| Endpoint            | Method | Description                |
| ------------------- | ------ | -------------------------- |
| `/grammar/generate` | POST   | Generate grammar exercises |

### Usage Examples 📝

#### **1. Translation Endpoint**

**API Endpoint:**  
**URL:** `http://127.0.0.1:8000/translate/file`  
**Method:** `POST`

**Request Structure:**

```json
{
  "prompt": "प्रश्नानां सूची संस्कृतभाषायां व्याकरणसिद्धान्तैः सहितम्। (प्रश्नः,विकल्पः व्याख्या च कठोररूपेण संस्कृतेन दत्तानि भवन्तु)"
}
```

**Expected Response:**

**Success:**

```json
{
   "A list of questions in Sanskrit with grammatical principles. (Questions, options, and explanations are given strictly in Sanskrit)"
}
```

---

#### **2. Flashcards Generation Endpoint**

**API Endpoint:**  
**URL:** `http://127.0.0.1:8000/flashcards/generate`  
**Method:** `POST`

**Request Structure:**

```json
{
  "prompt": "5 cards front to be in English and Hindi only and back in Sanskrit only"
}
```

**Expected Response:**

**Success:**

```json
[
    {
        "back": {
            "English": null,
            "Hindi": null,
            "Sanskrit": "अहम्"
        },
        "front": {
            "English": "I",
            "Hindi": "मैं",
            "Sanskrit": null
        }
    },
    {
        "back": {
            "English": null,
            "Hindi": null,
            "Sanskrit": "त्वम्"
        },
        "front": {
            "English": "You",
            "Hindi": "आप",
            "Sanskrit": null
        }
    },
    {...}
]
```

---

#### **3. Grammar Cards Generation Endpoint**

**API Endpoint:**  
**URL:** `http://127.0.0.1:8000/grammar/generate`  
**Method:** `POST`

**Request Structure:**

```json
{
  "prompt": "5 cards front to be in English and Hindi only and back in Sanskrit only"
}
```

**Expected Response:**

**Success:**

```json
{
    "English": [
        {
            "difficulty": "intermediate",
            "explanation": "The correct option is 'had been playing'. The past perfect continuous tense indicates an action that started before another action in the past and continued up to that time.",
            "grammaticalConcept": "Past Perfect Continuous Tense",
            "options": [
                {
                    "isCorrect": false,
                    "text": "was playing"
                },
                {
                    "isCorrect": true,
                    "text": "had been playing"
                },
                {
                    "isCorrect": false,
                    "text": "have been playing"
                },
                {
                    "isCorrect": false,
                    "text": "has been playing"
                }
            ],
            "question": "I ______ football for two hours before I went home. "
        },
        {...}
    ],
    "Hindi": [
        {
            "difficulty": "intermediate",
            "explanation": "सही उत्तर 'खेल रहा था' है। भूतकालिक पूर्ण निरंतर काल एक ऐसे कार्य को इंगित करता है जो किसी अन्य अतीत कार्य से पहले शुरू हुआ था और उस समय तक जारी रहा।",
            "grammaticalConcept": "भूतकालिक पूर्ण निरंतर काल",
            "options": [
                {
                    "isCorrect": false,
                    "text": "खेल रहा था"
                },
                {
                    "isCorrect": true,
                    "text": "खेल रहा था"
                },
                {
                    "isCorrect": false,
                    "text": "खेल रहा हूँ"
                },
                {
                    "isCorrect": false,
                    "text": "खेल रहा है"
                }
            ],
            "question": "घर जाने से पहले मैं दो घंटे तक फ़ुटबॉल ______ था।"
        },
        {...}
    ],
    "Sanskrit": [
        {
            "difficulty": "intermediate",
            "explanation": "सम्पूर्णवाक्ये कर्मधारयसमासः अस्ति।",
            "grammaticalConcept": "समास",
            "options": [
                {
                    "isCorrect": false,
                    "text": "द्वन्द्वसमासः"
                },
                {
                    "isCorrect": true,
                    "text": "कर्मधारयसमासः"
                },
                {
                    "isCorrect": false,
                    "text": "तत्पुरुषसमासः"
                },
                {
                    "isCorrect": false,
                    "text": "अव्ययीभावसमासः"
                }
            ],
            "question": "नीलोत्पलं इत्यत्र कः समासः?"
        },
        {...}
    ]
}
```
