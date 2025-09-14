import React, { useState, useEffect } from 'react';
import { translateText, translateEnglishToSanskrit, getTranslationMethods } from '../services/api';
import { Languages, ArrowUpDown, Sparkles, Copy, Volume2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

interface TranslationMethod {
  value: string;
  label: string;
  description: string;
  available: boolean;
}

export default function Translate() {
  const [fromLang, setFromLang] = useState('English');
  const [toLang, setToLang] = useState('Sanskrit');
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [translationMethod, setTranslationMethod] = useState<'api' | 'local' | 'modelv3'>('local');
  const [availableMethods, setAvailableMethods] = useState<TranslationMethod[]>([]);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const loadMethods = async () => {
      try {
        console.log('Loading translation methods...');
        const methodsResponse = await getTranslationMethods();
        console.log('Methods response:', methodsResponse);
        if (methodsResponse.success) {
          setAvailableMethods(methodsResponse.methods);
          console.log('Methods loaded successfully:', methodsResponse.methods);
        }
      } catch (error) {
        console.error('Failed to load translation methods:', error);
        setAvailableMethods([
          { value: 'api', label: 'AI API (Gemini)', description: 'Uses AI API for translation', available: true },
          { value: 'local', label: 'Local Model', description: 'Uses locally trained model', available: false }
        ]);
      }
    };
    loadMethods();
  }, []);

  const handleTranslate = async () => {
    try {
      setIsLoading(true);
      console.log('Starting translation...', { fromLang, toLang, inputText, translationMethod });
      if (fromLang === 'English' && toLang === 'Sanskrit') {
        console.log('Using specialized English to Sanskrit translation');
        const result = await translateEnglishToSanskrit(inputText, translationMethod);
        console.log('Translation result:', result);
        if (result.success) {
          setTranslation(result.translatedText);
        } else {
          throw new Error(result.message || 'Translation failed');
        }
      } else {
        console.log('Using general translation API');
        const result = await translateText({ prompt: `please translate this ${inputText} from ${fromLang} to ${toLang}` });
        console.log('General translation result:', result);
        setTranslation(result);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslation(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    const temp = fromLang;
    setFromLang(toLang);
    setToLang(temp);
    setInputText(translation);
    setTranslation('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslation('');
  };

  const isEnglishToSanskrit = fromLang === 'English' && toLang === 'Sanskrit';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white">
        <div className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-6">
              <Languages className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Universal Translator
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Bridge languages with AI-powered translation. From English to Sanskrit and beyond.
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">From</label>
                <Select value={fromLang} onValueChange={setFromLang}>
                  <SelectTrigger className="h-14 text-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <SelectValue placeholder="Select source language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">🇺🇸 English</SelectItem>
                    <SelectItem value="Hindi">🇮🇳 Hindi</SelectItem>
                    <SelectItem value="Sanskrit">🕉️ Sanskrit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSwapLanguages}
                  className="w-14 h-14 rounded-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <ArrowUpDown className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 w-full">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">To</label>
                <Select value={toLang} onValueChange={setToLang}>
                  <SelectTrigger className="h-14 text-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">🇺🇸 English</SelectItem>
                    <SelectItem value="Hindi">🇮🇳 Hindi</SelectItem>
                    <SelectItem value="Sanskrit">🕉️ Sanskrit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isEnglishToSanskrit && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Translation Method
                </label>
                <Select value={translationMethod} onValueChange={(value: 'api' | 'local' | 'modelv3') => setTranslationMethod(value)}>
                  <SelectTrigger className="h-12 border-2 border-blue-200 hover:border-blue-300 bg-white">
                    <SelectValue placeholder="Select translation method" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMethods.map((method) => (
                      <SelectItem 
                        key={method.value} 
                        value={method.value}
                        disabled={!method.available}
                        className="py-3"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{method.label}</span>
                          <span className="text-xs text-gray-500">{method.description}</span>
                          {!method.available && <span className="text-xs text-red-500">Not Available</span>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Enter Text</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your text here..."
                  className="w-full h-40 p-6 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-gray-50/50"
                />
                <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                  {inputText.length} characters
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Translation</h3>
                {translation && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="relative">
                <div className="w-full h-40 p-6 text-lg border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex items-center gap-3 text-blue-600">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-lg font-medium">Translating...</span>
                      </div>
                    </div>
                  ) : translation ? (
                    <p className="text-gray-900 leading-relaxed">{translation}</p>
                  ) : (
                    <p className="text-gray-400 italic">Translation will appear here...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 pt-0">
            <Button
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Translating...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Languages className="w-5 h-5" />
                  Translate
                </div>
              )}
            </Button>
          </div>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Powered</h3>
            <p className="text-gray-600">Advanced AI models for accurate translations</p>
          </div>
          
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Languages className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Local Model</h3>
            <p className="text-gray-600">Your own trained model for Sanskrit</p>
          </div>
          
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Real Time</h3>
            <p className="text-gray-600">Instant translation results</p>
          </div>
        </div>
      </div>
    </div>
  );
}