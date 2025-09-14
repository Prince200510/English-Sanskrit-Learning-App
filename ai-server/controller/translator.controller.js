import { Model } from '../config/gemini.config.js';
import fs from 'fs';
import path from 'path';
import { defaultHistory } from '../constants/history.js';
import LocalModelService from '../services/localModel.js';

export async function geminiTextStream(req, res) {
  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    });
    const { prompt } = req.body;
    if (!prompt) {
      return res.json({
        error: 'no prompt',
      });
    }

    const geminiResult = await Model().generateContentStream(prompt);

    if (geminiResult && geminiResult.stream) {
      await streamToStdout(geminiResult.stream, res);
    } else {
      res.end();
    }
  } catch (err) {
    console.log('error in Gemini chat: ', err);
    res.write('data: [DONE]\n\n');
    res.end();
  }
}

export async function geminiChatText(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        error: 'no prompt',
      });
    }

    let message = [prompt];
    console.log('file:', req.file);

    let filePath;
    if (req.file) {
      console.log('file path:', req.file.path, path.resolve(req.file.path));
      filePath = path.resolve(req.file.path);
      const fileBuffer = fs.readFileSync(filePath);
      const fileBase64 = fileBuffer.toString('base64');
      const fileMimeType = req.file.mimetype;

      const file = {
        inlineData: {
          data: fileBase64,
          mimeType: fileMimeType,
        },
      };
      message.push(file);
    }

    const chat = Model().startChat({
      history: defaultHistory,
    });
    let result = await chat.sendMessage(message);
    // chat.getHistory().then((history) => {
    //     res.json({ ans: result.response.text(), history: history });
    // })
    filePath && fs.unlinkSync(filePath);
    res.json(result.response.text());
  } catch (err) {
    console.log('error in Gemini chat: ', err);
    res.status(500).json({
      error: 'internal server error',
    });
  }
}

export async function streamToStdout(stream, res) {
  for await (const chunk of stream) {
    const chunkText = chunk.text();
    res.write(`data: ${JSON.stringify(chunkText)}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

export async function translateEnglishToSanskrit(req, res) {
  try {
    const { text, method = 'api' } = req.body;
    if (!text) {
      return res.status(400).json({
        error: 'No text provided for translation'
      });
    }
    if (!['api', 'local', 'modelv3'].includes(method)) {
      return res.status(400).json({
        error: 'Invalid translation method. Use "api", "local", or "modelv3"'
      });
    }
    if (method === 'local' && !LocalModelService.checkModelAvailability()) {
      return res.status(400).json({
        error: 'Local model (modelv2) not available. Please check if modelv2 is properly installed.'
      });
    }
    if (method === 'modelv3' && !LocalModelService.checkModelV3Availability()) {
      return res.status(400).json({
        error: 'Model v3 (aiIndicTrans2) not available. Please check if modelv3 is properly installed.'
      });
    }

    const result = await LocalModelService.translateText(text, method);

    res.json({
      success: true,
      originalText: text,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: error.message
    });
  }
}

export async function getTranslationMethods(req, res) {
  try {
    let isLocalModelAvailable = false;
    try {
      isLocalModelAvailable = LocalModelService.checkModelAvailability();
    } catch (error) {
      console.error('Error checking model availability:', error);
      isLocalModelAvailable = false;
    }

    let isModelV3Available = false;
    try {
      isModelV3Available = LocalModelService.checkModelV3Availability();
    } catch (error) {
      console.error('Error checking modelv3 availability:', error);
      isModelV3Available = false;
    }

    const methods = [
      {
        value: 'api',
        label: 'AI API (Gemini)',
        description: 'Uses AI API for translation',
        available: true
      },
      {
        value: 'local',
        label: 'Local Model v2',
        description: 'Uses locally trained mBART model (modelv2)',
        available: isLocalModelAvailable
      },
      {
        value: 'modelv3',
        label: 'Local Model v3 (aiIndicTrans2)',
        description: 'Uses aiIndicTrans2 Hugging Face model (modelv3)',
        available: isModelV3Available
      }
    ];

    res.json({
      success: true,
      methods,
      supportedLanguages: {
        source: 'English',
        target: 'Sanskrit'
      }
    });
  } catch (error) {
    console.error('Error getting translation methods:', error);
    res.status(500).json({
      error: 'Failed to get translation methods',
      message: error.message
    });
  }
}
