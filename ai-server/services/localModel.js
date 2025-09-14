import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LocalModelService {
  constructor() {
    this.modelPath = path.join(__dirname, '..', 'modelv2');
    this.isModelLoaded = false;
  }

  async translateText(text, method = 'api') {
    if (method === 'local') {
      return this.translateWithLocalModel(text);
    } else if (method === 'modelv3') {
      return this.translateWithModelV3(text);
    } else {
      return this.translateWithAPI(text);
    }
  }
  async translateWithModelV3(englishText) {
    return new Promise((resolve, reject) => {
      const modelV3Path = path.join(__dirname, '..', 'modelv3');
      if (!fs.existsSync(modelV3Path)) {
        return reject(new Error('Model v3 folder not found: ' + modelV3Path));
      }

      const pythonScript = `
import sys
import torch
import gc
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import os

def translate_text(text, model_path):
    try:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        gc.collect()
        
        # Load tokenizer and model with trust_remote_code for custom models
        tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True, trust_remote_code=True)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_path, local_files_only=True, trust_remote_code=True)
        
        # For IndicTrans models, we need to format the input properly
        src_lang = "eng_Latn"
        tgt_lang = "san_Deva"
        
        # Format input text as expected by IndicTrans tokenizer
        formatted_text = f"{src_lang} {tgt_lang} {text}"
        
        # Tokenize the formatted text
        inputs = tokenizer(formatted_text, return_tensors="pt", padding=True, truncation=True, max_length=256)
        input_ids = inputs["input_ids"]
        
        # Generate translation without forced_bos_token_id since IndicTransTokenizer doesn't support it
        with torch.no_grad():
            generated_tokens = model.generate(
                input_ids,
                num_beams=5,
                max_length=256,
                early_stopping=True,
                do_sample=False,
                use_cache=False
            )
        
        # Decode the generated tokens
        translated = tokenizer.decode(generated_tokens[0], skip_special_tokens=True)
        
        # Clean up the output - remove the language codes from the beginning if present
        if translated.startswith(f"{src_lang} {tgt_lang}"):
            translated = translated[len(f"{src_lang} {tgt_lang}"):].strip()
        
        # Clean up memory
        del model
        del tokenizer
        gc.collect()
        
        return translated
        
    except Exception as e:
        import traceback
        error_msg = "ModelV3 Error: " + str(e) + "\\nTraceback: " + traceback.format_exc()
        return error_msg

if __name__ == "__main__":
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    text = sys.argv[1]
    model_path = sys.argv[2]
    result = translate_text(text, model_path)
    print(result)
`;

      const tempDir = path.join(__dirname, '..', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const scriptPath = path.join(tempDir, 'translate_modelv3_temp.py');
      fs.writeFileSync(scriptPath, pythonScript);
      const pythonProcess = spawn('python', [scriptPath, englishText, modelV3Path], {
        env: {
          ...process.env,
          'PYTHONIOENCODING': 'utf-8'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        try { fs.unlinkSync(scriptPath); } catch (e) {}
        if (code === 0) {
          const translatedText = output.trim();
          if (translatedText.startsWith('ModelV3 Error:')) {
            reject(new Error(translatedText));
          } else {
            resolve({
              translatedText,
              method: 'modelv3',
              sourceLanguage: 'English',
              targetLanguage: 'Sanskrit'
            });
          }
        } else {
          reject(new Error(`ModelV3 translation failed: ${errorOutput || 'Unknown error'}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  async translateWithLocalModel(englishText) {
    return new Promise((resolve, reject) => {
      const pythonScript = `
import sys
import torch
import gc
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast
import os

def translate_text(text, model_path):
    try:
        # Clear GPU cache if available
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        # Force garbage collection
        gc.collect()
        
        # Load model and tokenizer with optimizations
        tokenizer = MBart50TokenizerFast.from_pretrained(model_path)
        
        # Load model with CPU and half precision if possible
        try:
            model = MBartForConditionalGeneration.from_pretrained(
                model_path,
                dtype=torch.float16,
                device_map="cpu"
            )
        except:
            model = MBartForConditionalGeneration.from_pretrained(model_path)
        
        # Set language codes
        tokenizer.src_lang = "en_XX"
        tokenizer.tgt_lang = "hi_IN"  # Use Hindi as it's available and closest to Sanskrit
        target_lang_id = tokenizer.lang_code_to_id["hi_IN"]
        
        print(f"Using target language: {tokenizer.tgt_lang}", file=sys.stderr)
        
        # Tokenize and translate
        inputs = tokenizer(text, return_tensors="pt", max_length=256, truncation=True)
        
        with torch.no_grad():
            generated_tokens = model.generate(
                **inputs,
                forced_bos_token_id=target_lang_id,
                max_length=128,
                num_beams=3,
                no_repeat_ngram_size=2,
                early_stopping=True
            )
        
        # Decode the result
        translated = tokenizer.decode(generated_tokens[0], skip_special_tokens=True)
        
        # Clean up
        del model
        del tokenizer
        gc.collect()
        
        return translated
        
    except Exception as e:
        import traceback
        error_msg = "Model Error: " + str(e) + "\\nTraceback: " + traceback.format_exc()
        return error_msg

if __name__ == "__main__":
    # Set UTF-8 encoding for stdout
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())
    
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
      const pythonProcess = spawn('python', [scriptPath, englishText, this.modelPath], {
        env: {
          ...process.env,
          'PYTORCH_CUDA_ALLOC_CONF': 'expandable_segments:True',
          'PYTHONIOENCODING': 'utf-8'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
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
          if (translatedText.startsWith('Model Error:')) {
            console.error('Model Error Details:', translatedText);
            console.error('Python stderr:', errorOutput);
            reject(new Error(translatedText));
          } else {
            console.log('Python stderr (debug info):', errorOutput);
            resolve({
              translatedText,
              method: 'local',
              sourceLanguage: 'English',
              targetLanguage: 'Sanskrit'
            });
          }
        } else {
          console.error('Python process failed with code:', code);
          console.error('Error output:', errorOutput);
          reject(new Error(`Translation failed: ${errorOutput || 'Unknown error'}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  async translateWithAPI(englishText) {
    const prompt = `Translate the following English text to Sanskrit: "${englishText}"`;
    
    try {
      const { Model } = await import('../config/gemini.config.js');
      const result = await Model().generateContent(prompt);
      const translatedText = result.response.text();
      
      return {
        translatedText,
        method: 'api',
        sourceLanguage: 'English',
        targetLanguage: 'Sanskrit'
      };
    } catch (error) {
      throw new Error(`API translation failed: ${error.message}`);
    }
  }

  checkModelAvailability() {
    try {
      const configPath = path.join(this.modelPath, 'config.json');
      const modelPath = path.join(this.modelPath, 'model.safetensors');
      
      return fs.existsSync(configPath) && fs.existsSync(modelPath);
    } catch (error) {
      console.error('Error in checkModelAvailability:', error);
      return false;
    }
  }

  checkModelV3Availability() {
    try {
      const modelV3Path = path.join(__dirname, '..', 'modelv3');
      const requiredFiles = [
        'config.json',
        'model.safetensors',
        'tokenizer_config.json',
        'special_tokens_map.json'
      ];
      
      return fs.existsSync(modelV3Path) && requiredFiles.every(f => fs.existsSync(path.join(modelV3Path, f)));
    } catch (error) {
      console.error('Error in checkModelV3Availability:', error);
      return false;
    }
  }
}

export default new LocalModelService();