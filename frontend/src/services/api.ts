import axios from 'axios';
import type { TranslationRequest, FlashcardResponse, GrammarResponse } from '../types/api';

// Support both production and development URLs
export const API_BASE_URL =
  typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app')
    ? 'https://english-sanskrit-learning-app.onrender.com'
    : process.env.NODE_ENV === 'production'
      ? 'https://english-sanskrit-learning-app.onrender.com'
      : 'http://localhost:8000';

export const translateText = async (data: TranslationRequest) => {
  const response = await axios.post(`${API_BASE_URL}/translate/file`, data);
  return response.data;
};

export const translateEnglishToSanskrit = async (text: string, method: 'api' | 'local' | 'modelv3' = 'api') => {
  const response = await axios.post(`${API_BASE_URL}/translate/english-to-sanskrit`, {
    text,
    method
  });
  return response.data;
};

export const getTranslationMethods = async () => {
  const response = await axios.get(`${API_BASE_URL}/translate/methods`);
  return response.data;
};

export const generateFlashcards = async (data: TranslationRequest) => {
  const response = await axios.post<FlashcardResponse[]>(`${API_BASE_URL}/flashcards/generate`, data);
  return response.data;
};

export const generateGrammarExercises = async (data: TranslationRequest) => {
  const response = await axios.post<GrammarResponse>(`${API_BASE_URL}/grammar/generate`, data);
  console.log(response.data);
  return response.data;
};

export const recognizeImage = async (data: FormData) => {
  const response = await axios.post(`${API_BASE_URL}/translate/file`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}