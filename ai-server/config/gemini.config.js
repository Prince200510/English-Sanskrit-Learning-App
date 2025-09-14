import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// const genAIInit = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAIInit = new GoogleGenerativeAI("");
// export const model = genAIInit.getGenerativeModel({
//   model: "gemini-1.5-flash",
//     generationConfig: {
//     responseMimeType: "application/json",
//     responseSchema: schema,
//   },
// });

export const Model = (generationConfig) => {
  return genAIInit.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: generationConfig,
  });
};
