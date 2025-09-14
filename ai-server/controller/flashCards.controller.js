import { Model } from '../config/gemini.config.js';
import { flashCardSchema } from '../constants/history.js';

export async function flashCardsGen(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        error: 'no prompt',
      });
    }

    let result = await Model({
      responseMimeType: 'application/json',
      responseSchema: flashCardSchema,
    }).generateContent(prompt);

    console.log(JSON.parse(result.response.text()).length);
    res.json(JSON.parse(result.response.text()));
  } catch (err) {
    console.log('error in Gemini chat: ', err);
    res.status(500).json({
      error: 'internal server error',
    });
  }
}
