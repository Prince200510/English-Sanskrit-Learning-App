import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PythonModelService {
  constructor() {
    this.modelPath = path.join(__dirname, '..', 'modelv2');
  }

  async translateWithPythonModel(englishText) {
    return new Promise((resolve, reject) => {
      const pythonScript = `
import sys
import torch
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast
import os

def translate_text(text, model_path):
    try:
        # Load model and tokenizer
        tokenizer = MBart50TokenizerFast.from_pretrained(model_path)
        model = MBartForConditionalGeneration.from_pretrained(model_path)
        
        # Set language codes
        tokenizer.src_lang = "en_XX"
        tokenizer.tgt_lang = "sa_IN"
        
        # Tokenize and translate
        inputs = tokenizer(text, return_tensors="pt", max_length=512, truncation=True)
        
        with torch.no_grad():
            generated_tokens = model.generate(
                **inputs,
                forced_bos_token_id=tokenizer.lang_code_to_id["sa_IN"],
                max_length=200,
                num_beams=5,
                no_repeat_ngram_size=2,
                early_stopping=True
            )
        
        # Decode the result
        translated = tokenizer.decode(generated_tokens[0], skip_special_tokens=True)
        return translated
        
    except Exception as e:
        error_msg = "Error: " + str(e)
        return error_msg

if __name__ == "__main__":
    text = sys.argv[1]
    model_path = sys.argv[2]
    result = translate_text(text, model_path)
    print(result)
`;

      const tempDir = path.join(__dirname, '..', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const scriptPath = path.join(tempDir, 'translate_temp.py');
      fs.writeFileSync(scriptPath, pythonScript);
      const pythonProcess = spawn('python', [scriptPath, englishText, this.modelPath]);
      
      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        try {
          fs.unlinkSync(scriptPath);
        } catch (e) {
          console.log('Could not delete temp file:', e.message);
        }

        if (code === 0) {
          const translatedText = output.trim();
          resolve({
            translatedText,
            method: 'local',
            sourceLanguage: 'English',
            targetLanguage: 'Sanskrit'
          });
        } else {
          console.error('Python script error:', errorOutput);
          reject(new Error(`Translation failed: ${errorOutput}`));
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        reject(new Error(`Failed to start translation process: ${error.message}`));
      });
    });
  }
}

export default PythonModelService;