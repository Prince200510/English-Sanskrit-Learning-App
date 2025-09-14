import { SchemaType } from '@google/generative-ai';

const rules = `Follow these rules:
1. Vyakaran (Grammar): Sanskrit and Hindi rely on precise grammar for meaning, with Sanskrit featuring complex rules for noun declension (विभक्ति), verb conjugation (धातु रूप), and sandhi (word joining). Incorrect usage of cases or tenses can significantly alter a sentence's meaning.
2. Matras (मात्राएँ) and Phonetics: In Hindi, the correct use of matras (vowel symbols like आ, इ, ई) is essential, as even a small change can drastically alter a word's meaning. Similarly, Sanskrit's phonetic nature means that slight pronunciation differences, particularly between long (दीर्घ) and short (ह्रस्व) vowels, can significantly change meaning.
3. Sandhi and Samasa (Compound Words): Sanskrit employs sandhi (joining of words or sounds) and samasa (compound words) to convey meaning, where incorrect joining or breaking can completely alter the meaning. Hindi also uses samasa, but in a more simplified form compared to Sanskrit.
4. Word Order: Unlike English's strict SVO (Subject-Verb-Object) structure, Hindi and Sanskrit allow for more flexibility in word order due to case markings. However, in Sanskrit, maintaining the SOV (Subject-Object-Verb) structure is important for clarity, even though it offers greater flexibility than English.
5. Gender Agreement: In Hindi, nouns are either masculine or feminine, and adjectives and verbs must agree with the noun's gender, which is crucial for grammatical accuracy. Sanskrit features a three-gender system (masculine, feminine, and neuter), requiring verb conjugations and adjectives to match the gender and number of the noun.
6. Sentence Endings and Verb Conjugations: In Sanskrit, sentence endings are crucial, with verbs typically placed at the end to conclude the action. Correct verb conjugation for tense, mood, and number is essential for clarity. Similarly, in Hindi, the verb at the end of the sentence indicates the tense and signals the completion of the action.
7. Respect and Formality: Hindi incorporates multiple levels of formality and respect through pronouns like तू, तुम, and आप, making correct usage essential for conveying respect in social contexts. In contrast, Sanskrit does not differentiate pronouns but expresses respect through sentence structure and verb forms.`;

export const defaultHistory = [
  {
    role: 'user',
    parts: [
      {
        text: `You are a Sanskrit-Hindi-English trilingual translator. You will convert any language into these three only. 
If I mistakenly ask you to convert into some other language, you will show a nice warning/error saying "I can translate only in Sanskrit-Hindi-English" in these three languages.
Also, if you think I ask something unrelated to translation, throw a nice warning/error of "Please ask about translation" in all three languages. Also if I ask you to translate something that is not a language, you will show a nice warning/error of "Please provide a language to translate" in all three languages. Also, respect punctuation and capitalization. For audio input, you will give the output in the specified language only (strictly) and if language is not specified, you will give the output in same language as input only (strictly).
${rules}`,
      },
    ],
  },
  {
    role: 'model',
    parts: [
      {
        text: `Understood\nमुझे समझ आ गया।\nअहं अवगतम्।`,
      },
    ],
  },
];

export const flashCardSchema = {
  description: `Create exactly 10 flashCards based on the provided prompt. The output should be a JSON array of objects, each with a "front" and "back" key.

- "front" should contain a word in one language (choose from English, Hindi, or Sanskrit).
- "back" should contain the meanings of the word in the other two languages. Specifically, it should include meanings in English, Hindi, and Sanskrit.  

The flashcards should follow the schema:
decide the front and back language from the prompt. Else, if not specified, default to Sanskrit as front and Hindi and English as back.

If the prompt does not comply, return an error message as follows: "Invalid input format. Please provide the content in the specified format.`,
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      front: {
        type: SchemaType.OBJECT,
        properties: {
          English: {
            type: SchemaType.STRING,
            description: 'Meaning in English',
            nullable: true,
          },
          Hindi: {
            type: SchemaType.STRING,
            description: 'Meaning in Hindi',
            nullable: true,
          },
          Sanskrit: {
            type: SchemaType.STRING,
            description: 'Meaning in Sanskrit',
            nullable: true,
          },
        },
      },
      back: {
        type: SchemaType.OBJECT,
        properties: {
          English: {
            type: SchemaType.STRING,
            description: 'Meaning in English',
            nullable: true,
          },
          Hindi: {
            type: SchemaType.STRING,
            description: 'Meaning in Hindi',
            nullable: true,
          },
          Sanskrit: {
            type: SchemaType.STRING,
            description: 'Meaning in Sanskrit',
            nullable: true,
          },
        },
        required: ['English', 'Hindi', 'Sanskrit'],
      },
    },
    required: ['front', 'back'],
  },
};

export const grammarExerciseSchema = {
  description: `Generate a grammar exercise based on the provided language and difficulty level(strictly adhere with this provision do no under any circumstance generate mcq of other lanuage if not asked). If the language is not specified, default to **English**. If the difficulty level is not provided, default to **beginner**. 

### Requirements:
1. Create a **multiple-choice question (MCQ)** that tests the specified grammatical concept at the given difficulty level.
2. Provide **4 options**:
   - One correct answer.
   - Three plausible but incorrect distractors.
3. Ensure:
   - The **correct answer** is grammatically sound and adheres to the rules of the specified grammatical concept.
   - Distractors are realistic but demonstrably incorrect.
4. Write a **clear explanation** of why the correct answer is right and why the distractors are incorrect.
5. Ensure:
   - Questions, options, and explanations are written **entirely in the specified language**.
   - If no language is provided, use English.
   - If translations are required (e.g., in Hindi or Sanskrit), ensure they adhere to the grammar of the translated language.
6. Maintain the tone and structure appropriate for the chosen difficulty level:
   - Beginner: Basic grammatical concepts.
   - Intermediate: Slightly complex structures.
   - Advanced: Nuanced or intricate grammar rules.

### Error Prevention:
- Validate grammatical correctness in all provided content.
- Avoid ambiguities in phrasing questions or explanations.
- Ensure distractors are neither too obvious nor implausible.
- Keep explanations concise and focused on the grammatical concept.

Example Context: 

"English": [
        {
          "difficulty": "beginner",
          "grammaticalConcept": "Pronoun Agreement",
          "question": "Choose the correct pronoun to replace 'the children' in: The children are playing in the park.",
          "options": [
            {"text": "They", "isCorrect": true},
            {"text": "He", "isCorrect": false},
            {"text": "She", "isCorrect": false},
            {"text": "It", "isCorrect": false}
          ],
          "explanation": "The word 'they' is a plural pronoun that correctly refers to multiple children, matching the plural subject and verb 'are playing'."
        }
      ],
      "Hindi": [
        {
          "difficulty": "beginner",
          "grammaticalConcept": "सर्वनाम समझ (Pronoun Understanding)",
          "question": "वाक्य में बच्चों के लिए सही सर्वनाम चुनें: बच्चे बगीचे में खेल रहे हैं।",
          "options": [
            {"text": "वे", "isCorrect": true},
            {"text": "वह", "isCorrect": false},
            {"text": "यह", "isCorrect": false},
            {"text": "ये", "isCorrect": false}
          ],
          "explanation": "बहुवचन विषय 'बच्चे' के लिए 'वे' सही सर्वनाम है, जो बहुवचन क्रिया 'खेल रहे हैं' के साथ मेल खाता है।"
        }
      ],
      "Sanskrit": [
        {
          "difficulty": "beginner",
          "grammaticalConcept": "सर्वनाम समीक्षा (Pronoun Analysis)",
          "question": "वाक्ये बालकानां कृते योग्यं सर्वनामं चिनुत: बालकाः उद्याने क्रीडन्ति।",
          "options": [
            {"text": "ते", "isCorrect": true},
            {"text": "सः", "isCorrect": false},
            {"text": "सा", "isCorrect": false},
            {"text": "तत्", "isCorrect": false}
          ],
          "explanation": "बहुवचन विषय 'बालकाः' के लिए 'ते' सही सर्वनाम है, जो बहुवचन क्रिया 'क्रीडन्ति' के साथ मेल खाता है।"
        }
      ]`,
  type: SchemaType.OBJECT,
  properties: {
    English: {
      type: SchemaType.ARRAY,
      description:
        'Array of questions in English with grammar concepts and options',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          difficulty: {
            type: SchemaType.STRING,
            description: 'Difficulty level of the question',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
          grammaticalConcept: {
            type: SchemaType.STRING,
            description: 'Grammatical concept related to the question',
          },
          question: {
            type: SchemaType.STRING,
            description: 'The question text',
          },
          options: {
            type: SchemaType.ARRAY,
            description: 'List of answer options',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                text: {
                  type: SchemaType.STRING,
                  description: 'The option text',
                },
                isCorrect: {
                  type: SchemaType.BOOLEAN,
                  description: 'Indicates if the option is the correct answer',
                },
              },
              required: ['text', 'isCorrect'],
            },
          },
          explanation: {
            type: SchemaType.STRING,
            description: 'Explanation for the correct answer',
          },
        },
        required: [
          'difficulty',
          'grammaticalConcept',
          'question',
          'options',
          'explanation',
        ],
      },
    },
    Hindi: {
      type: SchemaType.ARRAY,
      description:
        'Array of questions in Hindi with grammar concepts and options',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          difficulty: {
            type: SchemaType.STRING,
            description: 'प्रश्न का कठिनाई स्तर',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
          grammaticalConcept: {
            type: SchemaType.STRING,
            description: 'प्रश्न से संबंधित व्याकरणीय अवधारणा',
          },
          question: {
            type: SchemaType.STRING,
            description: 'प्रश्न का पाठ',
          },
          options: {
            type: SchemaType.ARRAY,
            description: 'उत्तर विकल्पों की सूची',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                text: {
                  type: SchemaType.STRING,
                  description: 'विकल्प का पाठ',
                },
                isCorrect: {
                  type: SchemaType.BOOLEAN,
                  description:
                    'निर्धारित करता है कि यह विकल्प सही उत्तर है या नहीं',
                },
              },
              required: ['text', 'isCorrect'],
            },
          },
          explanation: {
            type: SchemaType.STRING,
            description: 'सही उत्तर का स्पष्टीकरण',
          },
        },
        required: [
          'difficulty',
          'grammaticalConcept',
          'question',
          'options',
          'explanation',
        ],
      },
    },
    Sanskrit: {
      type: SchemaType.ARRAY,
      description:
        'प्रश्नानां सूची संस्कृतभाषायां व्याकरणसिद्धान्तैः सहितम्। (प्रश्नः,विकल्पः व्याख्या च कठोररूपेण संस्कृतेन दत्तानि भवन्तु)',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          difficulty: {
            type: SchemaType.STRING,
            description: 'प्रश्नस्य कठिनता स्तरः',
            enum: ['beginner', 'intermediate', 'advanced'],
          },
          grammaticalConcept: {
            type: SchemaType.STRING,
            description: 'प्रश्नस्य व्याकरणीय सिद्धांतः',
          },
          question: {
            type: SchemaType.STRING,
            description: 'प्रश्न पाठः',
          },
          options: {
            type: SchemaType.ARRAY,
            description: 'उत्तर विकल्पानां सूची',
            items: {
              type: SchemaType.OBJECT,
              properties: {
                text: {
                  type: SchemaType.STRING,
                  description: 'विकल्पस्य पाठः',
                },
                isCorrect: {
                  type: SchemaType.BOOLEAN,
                  description: 'सत्यं किमर्थं विकल्पः',
                },
              },
              required: ['text', 'isCorrect'],
            },
          },
          explanation: {
            type: SchemaType.STRING,
            description: 'सत्य उत्तरस्य स्पष्टीकरणम् (संस्कृते)',
          },
        },
        required: [
          'difficulty',
          'grammaticalConcept',
          'question',
          'options',
          'explanation',
        ],
      },
    },
  },
  required: ['English', 'Hindi', 'Sanskrit'],
};
