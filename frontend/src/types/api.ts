export interface TranslationRequest {
  prompt: string;
}

export interface FlashcardResponse {
  front: {
    English: string | null;
    Hindi: string | null;
    Sanskrit: string | null;
  };
  back: {
    English: string | null;
    Hindi: string | null;
    Sanskrit: string | null;
  };
}

export interface GrammarQuestion {
  difficulty: string;
  explanation: string;
  grammaticalConcept: string;
  options: {
    isCorrect: boolean;
    text: string;
  }[];
  question: string;
}

export interface GrammarResponse {
  English: GrammarQuestion[];
  Hindi: GrammarQuestion[];
  Sanskrit: GrammarQuestion[];
}