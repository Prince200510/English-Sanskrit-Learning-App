import torch
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast
import time
import json
import os
from pathlib import Path
from collections import Counter

class FastEnglishTranslator:
    def __init__(self, model_path: str = None):
        base = Path.cwd()
        candidates = []
        if model_path:
            candidates.append(Path(model_path))
        env_path = os.environ.get("MODEL_DIR")
        if env_path:
            candidates.append(Path(env_path))
        candidates.extend([
            base / "modelv2",
            base / "modelv1",
            base / "fine_tuned_mbart_English_Sankrit",
        ])
        modelv_dirs = sorted(
            [p for p in base.glob("modelv*") if p.is_dir()],
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        candidates.extend(modelv_dirs)
        resolved = None
        for c in candidates:
            if c and c.exists() and c.is_dir():
                resolved = c
                break
        if resolved is None:
            resolved = Path(model_path) if model_path else base / "fine_tuned_mbart_English_Sankrit"
        self.model_path = resolved
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.tokenizer = None
        self.load_time = 0
        
    def load_model(self):
        start_time = time.time()
        print(f"Loading fine-tuned mBART model from {self.model_path}...")
        
        if not self.model_path.exists():
            print(f"Error: Model directory {self.model_path} not found!")
            print("Please run mbart_fine_tune.py first to create the fine-tuned model.")
            return False
        
        try:
            self.tokenizer = MBart50TokenizerFast.from_pretrained(self.model_path)
            self.model = MBartForConditionalGeneration.from_pretrained(self.model_path)
            
            self.model.to(self.device)
            self.model.eval()
            
            self.load_time = time.time() - start_time
            
            print(f"Model loaded successfully in {self.load_time:.2f}s")
            print(f"Device: {self.device}")
            print(f"Parameters: {sum(p.numel() for p in self.model.parameters())/1e6:.1f}M")
            
            return True
            
        except Exception as e:
            print("")
            return False
    
    def _is_single_word(self, text: str) -> bool:
        t = text.strip()
        if not t:
            return False
        parts = t.split()
        return len(parts) == 1 and len(t) <= 40

    def _postprocess_single_word(self, raw: str) -> str:
        r = raw.strip()
        if not r:
            return r
        r = r.replace("।।", "।").strip()
        tokens = r.split()
        collapsed = []
        for tok in tokens:
            if not collapsed or collapsed[-1] != tok:
                collapsed.append(tok)
        if len(collapsed) > 3:
            dev = [w for w in collapsed if any('\u0900' <= ch <= '\u097F' for ch in w)]
            pool = dev if dev else collapsed
            cnt = Counter(pool)
            top = sorted(cnt.items(), key=lambda x: (-x[1], len(x[0])))[0][0]
            return top
        return " ".join(collapsed)

    def translate(self, English_text, max_length=128, num_beams=3, temperature=0.8, optimize_single=True):
        if self.model is None:
            return ""

        single = optimize_single and self._is_single_word(English_text)
        start_time = time.time()

        if hasattr(self.tokenizer, 'src_lang'):
            self.tokenizer.src_lang = "en_XX"
        forced_bos_token_id = None
        if hasattr(self.tokenizer, 'lang_code_to_id'):
            forced_bos_token_id = self.tokenizer.lang_code_to_id.get("sa_IN")

        if single:
            effective_max = min(max_length, 16)
            beams = max(num_beams, 4)
            temp = 0.0  
            do_sample = False
            no_repeat = 2
            repetition_penalty = 1.15
            top_p = None
        else:
            effective_max = max_length
            beams = num_beams
            temp = temperature
            do_sample = temperature > 0
            no_repeat = None
            repetition_penalty = None
            top_p = 0.9 if do_sample else None

        input_text = f"English: {English_text}" if not single else English_text.strip()
        inputs = self.tokenizer(
            input_text,
            return_tensors="pt",
            max_length=64 if single else effective_max,
            truncation=True,
            padding=True
        ).to(self.device)

        gen_kwargs = dict(
            max_length=effective_max,
            num_beams=beams,
            early_stopping=True,
            pad_token_id=self.tokenizer.pad_token_id,
            eos_token_id=self.tokenizer.eos_token_id,
            do_sample=do_sample,
            temperature=temp if do_sample else None,
            top_p=top_p,
            forced_bos_token_id=forced_bos_token_id,
        )
        if no_repeat:
            gen_kwargs['no_repeat_ngram_size'] = no_repeat
        if repetition_penalty:
            gen_kwargs['repetition_penalty'] = repetition_penalty

        with torch.no_grad():
            outputs = self.model.generate(**inputs, **{k: v for k, v in gen_kwargs.items() if v is not None})

        translation = self.tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
        if single:
            translation = self._postprocess_single_word(translation)
        translation_time = time.time() - start_time

        return {
            'translation': translation,
            'time': translation_time,
            'source': English_text,
            'single_word_mode': single
        }
    
    def interactive_mode(self):
        print("\n" + "=" * 60)
        print("Real-time English to Sankrit Translation")
        print("=" * 60)
        print("Commands: 'quit', 'stats', 'help', 'settings'")
        print("-" * 60)

        translation_count = 0
        total_time = 0
        settings = {'max_length': 128, 'num_beams': 3, 'temperature': 0.8}

        while True:
            try:
                user_input = input("\nEnglish: ").strip()

                if user_input.lower() in ['quit', 'exit', 'q']:
                    break

                elif user_input.lower() == 'stats':
                    avg_time = total_time / translation_count if translation_count > 0 else 0
                    print(f"\n Translation Statistics:")
                    print(f"   Total translations: {translation_count}")
                    print(f"   Average time: {avg_time:.3f}s")
                    print(f"   Total time: {total_time:.2f}s")
                    print(f"   Model load time: {self.load_time:.2f}s")
                    continue

                elif user_input.lower() == 'help':
                    print("\n Commands:")
                    print("   'quit' - Exit the translator")
                    print("   'stats' - Show translation statistics")
                    print("   'settings' - Adjust translation parameters")
                    print("   'help' - Show this help message")
                    continue

                elif user_input.lower() == 'settings':
                    print(f"\n Current Settings:")
                    print(f"   Max length: {settings['max_length']}")
                    print(f"   Num beams: {settings['num_beams']}")
                    print(f"   Temperature: {settings['temperature']}")

                    try:
                        new_beams = input("Enter new num_beams (1-5, current: {}): ".format(settings['num_beams']))
                        if new_beams.strip():
                            settings['num_beams'] = max(1, min(5, int(new_beams)))

                        new_temp = input("Enter new temperature (0.1-2.0, current: {}): ".format(settings['temperature']))
                        if new_temp.strip():
                            settings['temperature'] = max(0.1, min(2.0, float(new_temp)))

                        print("Settings updated!")
                    except ValueError:
                        print("Invalid input. Settings unchanged.")
                    continue

                if user_input:
                    result = self.translate(
                        user_input,
                        max_length=settings['max_length'],
                        num_beams=settings['num_beams'],
                        temperature=settings['temperature']
                    )

                    total_time += result['time']
                    translation_count += 1

                    print(f"Sankrit: {result['translation']}{' (word)' if result.get('single_word_mode') else ''}")
                    print(f"Time: {result['time']:.3f}s")

            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error: {e}")

        print(f"\nSession Summary:")
        print(f"   Translations: {translation_count}")
        if translation_count > 0:
            print(f"   Average time: {total_time / translation_count:.3f}s")
        print("Thank you for using the translator!")

def batch_translate_file(input_file, output_file, model_path=None):
    translator = FastEnglishTranslator(model_path)
    
    if not translator.load_model():
        return False
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = [line.strip() for line in f if line.strip()]

        print(f"Translating {len(lines)} lines from {input_file}...")

        results = []
        total_time = 0

        for i, line in enumerate(lines, 1):
            result = translator.translate(line)
            results.append({
                'source_English': line,
                'translation_Sankrit': result['translation'],
                'time': result['time']
            })
            total_time += result['time']

            if i % 10 == 0:
                print(f"   Processed {i}/{len(lines)} lines...")

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"Batch translation completed!")
        print(f"   Output saved to: {output_file}")
        print(f"   Total time: {total_time:.2f}s")
        print(f"   Average time per translation: {total_time/len(lines):.3f}s")

        return True

    except Exception as e:
        print(f"Error during batch translation: {e}")
        return False

def test_model_performance(model_path=None):
    print("Testing Fine-tuned mBART Model Performance")
    print("=" * 50)
    translator = FastEnglishTranslator(model_path)
    if not translator.load_model():
        print("Cannot test - model not found or failed to load")
        return
    test_sentences = [
        "Knowledge is the light of life.",
        "Truth is greater than wealth.",
        "King",
        "Queen",
        "Prince",
        "Learning brings wisdom.",
        "Unity is strength.",
    ]
    print(f"Testing {len(test_sentences)} sample translations:")
    print("-" * 50)
    total_time = 0
    for i, sentence in enumerate(test_sentences, 1):
        result = translator.translate(sentence)
        total_time += result['time']
        print(f"{i:2d}. English: {sentence}")
        print(f"    Sankrit:  {result['translation']} {'(word)' if result.get('single_word_mode') else ''}")
        print(f"    Time:  {result['time']:.3f}s")
        print()
    if test_sentences:
        avg_time = total_time / len(test_sentences)
        print("Performance Summary:")
        print(f"Total test time: {total_time:.2f}s")
        print(f"Average per translation: {avg_time:.3f}s")
        print(f"Model load time: {translator.load_time:.2f}s")
        print(f"Translations per second: {1/avg_time:.1f}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Fine-tuned mBART English-to-Sankrit Translator")
    parser.add_argument('--model-path', default=None, help='Path to fine-tuned model directory (auto-detect if omitted)')
    parser.add_argument('--interactive', action='store_true', default=True,
                       help='Start interactive translation mode')
    parser.add_argument('--test', action='store_true',
                       help='Run performance test')
    parser.add_argument('--batch', nargs=2, metavar=('INPUT', 'OUTPUT'),
                       help='Batch translate file: INPUT OUTPUT')
    parser.add_argument('--translate', help='Translate single sentence')
    
    args = parser.parse_args()
    
    if args.test:
        test_model_performance(args.model_path)
    elif args.batch:
        batch_translate_file(args.batch[0], args.batch[1], args.model_path)
    elif args.translate:
        translator = FastEnglishTranslator(args.model_path)
        if translator.load_model():
            result = translator.translate(args.translate)
            print(f"Input: {args.translate}")
            print(f"Output: {result['translation']}")
    else:
        translator = FastEnglishTranslator(args.model_path)
        if translator.load_model():
            translator.interactive_mode()

if __name__ == "__main__":
    main()
