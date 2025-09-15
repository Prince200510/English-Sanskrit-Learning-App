#!/usr/bin/env python3
"""
BLEU Score Calculator for English-Sanskrit-Hindi Translation Models
Compares modelv2 and modelv3 performance using BLEU scores
"""

import os
import json
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from datasets import load_dataset
import evaluate
import pandas as pd
from pathlib import Path
import argparse
from typing import List, Dict, Tuple
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BLEUCalculator:
    def __init__(self, model_paths: Dict[str, str]):
        """
        Initialize BLEU calculator with model paths
        
        Args:
            model_paths: Dictionary with model names as keys and paths as values
        """
        self.model_paths = model_paths
        self.models = {}
        self.tokenizers = {}
        self.bleu_metric = evaluate.load("bleu")
        
    def load_models(self):
        """Load all models and tokenizers"""
        for model_name, model_path in self.model_paths.items():
            try:
                logger.info(f"Loading {model_name} from {model_path}")
                
                # Check if model files exist
                if not os.path.exists(model_path):
                    logger.error(f"Model path does not exist: {model_path}")
                    continue
                
                # Load tokenizer
                self.tokenizers[model_name] = AutoTokenizer.from_pretrained(model_path)
                
                # Load model
                self.models[model_name] = AutoModelForSeq2SeqLM.from_pretrained(
                    model_path,
                    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                    device_map="auto" if torch.cuda.is_available() else None
                )
                
                logger.info(f"Successfully loaded {model_name}")
                
            except Exception as e:
                logger.error(f"Error loading {model_name}: {str(e)}")
    
    def generate_translations(self, model_name: str, source_texts: List[str], 
                            max_length: int = 512, num_beams: int = 4) -> List[str]:
        """
        Generate translations for a list of source texts
        
        Args:
            model_name: Name of the model to use
            source_texts: List of source texts to translate
            max_length: Maximum length of generated translation
            num_beams: Number of beams for beam search
            
        Returns:
            List of translated texts
        """
        if model_name not in self.models:
            logger.error(f"Model {model_name} not loaded")
            return []
        
        model = self.models[model_name]
        tokenizer = self.tokenizers[model_name]
        translations = []
        
        logger.info(f"Generating translations with {model_name} for {len(source_texts)} texts")
        
        for i, text in enumerate(source_texts):
            try:
                # Tokenize input
                inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
                
                # Move to same device as model
                if torch.cuda.is_available():
                    inputs = {k: v.cuda() for k, v in inputs.items()}
                
                # Generate translation
                with torch.no_grad():
                    outputs = model.generate(
                        **inputs,
                        max_length=max_length,
                        num_beams=num_beams,
                        early_stopping=True,
                        do_sample=False
                    )
                
                # Decode translation
                translation = tokenizer.decode(outputs[0], skip_special_tokens=True)
                translations.append(translation)
                
                if (i + 1) % 10 == 0:
                    logger.info(f"Translated {i + 1}/{len(source_texts)} texts")
                    
            except Exception as e:
                logger.error(f"Error translating text {i}: {str(e)}")
                translations.append("")
        
        return translations
    
    def calculate_bleu_score(self, predictions: List[str], references: List[str]) -> Dict[str, float]:
        """
        Calculate BLEU score between predictions and references
        
        Args:
            predictions: List of predicted translations
            references: List of reference translations
            
        Returns:
            Dictionary containing BLEU scores
        """
        # Clean empty predictions and references
        cleaned_predictions = []
        cleaned_references = []
        
        for pred, ref in zip(predictions, references):
            if pred.strip() and ref.strip():
                cleaned_predictions.append(pred.strip())
                cleaned_references.append([ref.strip()])  # BLEU expects list of references
        
        if not cleaned_predictions:
            logger.warning("No valid prediction-reference pairs found")
            return {"bleu": 0.0}
        
        # Calculate BLEU score
        bleu_score = self.bleu_metric.compute(
            predictions=cleaned_predictions,
            references=cleaned_references
        )
        
        return bleu_score
    
    def load_test_data(self, test_file_path: str = None) -> Tuple[List[str], List[str]]:
        """
        Load test data for evaluation
        
        Args:
            test_file_path: Path to test data file (JSON/CSV)
            
        Returns:
            Tuple of (source_texts, reference_translations)
        """
        if test_file_path and os.path.exists(test_file_path):
            logger.info(f"Loading test data from {test_file_path}")
            
            if test_file_path.endswith('.json'):
                with open(test_file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                source_texts = data.get('source', [])
                references = data.get('target', [])
                
            elif test_file_path.endswith('.csv'):
                df = pd.read_csv(test_file_path)
                source_texts = df['source'].tolist() if 'source' in df.columns else df.iloc[:, 0].tolist()
                references = df['target'].tolist() if 'target' in df.columns else df.iloc[:, 1].tolist()
                
            else:
                logger.error("Unsupported file format. Use JSON or CSV.")
                return [], []
                
        else:
            # Sample test data for demonstration
            logger.info("Using sample test data")
            source_texts = [
                "Hello, how are you?",
                "What is your name?",
                "I am learning Sanskrit and Hindi.",
                "Thank you very much.",
                "Good morning, have a nice day!"
            ]
            
            # Sample reference translations (you should replace with actual references)
            references = [
                "नमस्ते, आप कैसे हैं?",
                "आपका नाम क्या है?",
                "मैं संस्कृत और हिंदी सीख रहा हूँ।",
                "बहुत धन्यवाद।",
                "सुप्रभात, आपका दिन अच्छा बीते!"
            ]
        
        return source_texts, references
    
    def evaluate_models(self, test_file_path: str = None, output_file: str = "bleu_results.json"):
        """
        Evaluate all loaded models and calculate BLEU scores
        
        Args:
            test_file_path: Path to test data file
            output_file: Path to save results
        """
        # Load test data
        source_texts, references = self.load_test_data(test_file_path)
        
        if not source_texts or not references:
            logger.error("No test data available")
            return
        
        results = {}
        detailed_results = {}
        
        for model_name in self.models.keys():
            logger.info(f"Evaluating {model_name}")
            
            # Generate translations
            predictions = self.generate_translations(model_name, source_texts)
            
            # Calculate BLEU score
            bleu_scores = self.calculate_bleu_score(predictions, references)
            
            # Store results
            results[model_name] = {
                "bleu_score": bleu_scores["bleu"],
                "num_samples": len(predictions)
            }
            
            detailed_results[model_name] = {
                "predictions": predictions,
                "references": references,
                "bleu_scores": bleu_scores
            }
            
            logger.info(f"{model_name} - BLEU Score: {bleu_scores['bleu']:.4f}")
        
        # Save results
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                "summary": results,
                "detailed": detailed_results
            }, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved to {output_file}")
        
        # Print comparison
        self.print_comparison(results)
    
    def print_comparison(self, results: Dict):
        """Print model comparison"""
        print("\n" + "="*50)
        print("MODEL COMPARISON RESULTS")
        print("="*50)
        
        for model_name, scores in results.items():
            print(f"{model_name:15} | BLEU: {scores['bleu_score']:.4f} | Samples: {scores['num_samples']}")
        
        # Find best model
        best_model = max(results.items(), key=lambda x: x[1]['bleu_score'])
        print(f"\nBest Model: {best_model[0]} (BLEU: {best_model[1]['bleu_score']:.4f})")


def main():
    parser = argparse.ArgumentParser(description="Calculate BLEU scores for translation models")
    parser.add_argument("--modelv2_path", default=r"P:\react js project\English-Sanskrit-Hindi\Final\ai-server\modelv2",
                       help="Path to modelv2 directory")
    parser.add_argument("--modelv3_path", default=r"P:\react js project\English-Sanskrit-Hindi\Final\ai-server\modelv3",
                       help="Path to modelv3 directory")
    parser.add_argument("--test_data", help="Path to test data file (JSON/CSV)")
    parser.add_argument("--output", default="bleu_results.json", help="Output file for results")
    
    args = parser.parse_args()
    
    # Model paths
    model_paths = {
        "modelv2": args.modelv2_path,
        "modelv3": args.modelv3_path
    }
    
    # Initialize calculator
    calculator = BLEUCalculator(model_paths)
    
    # Load models
    calculator.load_models()
    
    # Check if any models were loaded
    if not calculator.models:
        logger.error("No models were successfully loaded. Please check your model paths.")
        return
    
    # Evaluate models
    calculator.evaluate_models(args.test_data, args.output)


if __name__ == "__main__":
    main()