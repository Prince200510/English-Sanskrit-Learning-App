/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CloudUpload, X, Image as ImageIcon, Loader2, Camera, Sparkles, FileText, Languages } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { recognizeImage } from "@/services/api";

export default function ImageRecognition() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      );
      setFiles(droppedFiles);
    }
  };

  const handleAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResults(null);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', files[0]);
      
      if (prompt) {
        formData.append('prompt', prompt);
      }
      
      const response = await recognizeImage(formData);
      setResults(response);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process the image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickPrompts = [
    "Translate any text in this image to English",
    "What does this Sanskrit text say?",
    "Describe what you see in this image",
    "Extract and translate Hindi text",
    "Convert handwritten text to digital format"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-100">
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Smart Image Recognition
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Upload images to extract text, translate content, and get intelligent analysis
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Upload Image</h3>
                </div>
                
                <div
                  className={cn(
                    "flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer",
                    isDragging 
                      ? "border-orange-500 bg-orange-50 scale-[1.02]" 
                      : "border-gray-300 hover:border-orange-400 hover:bg-orange-50/50",
                  )}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleAreaClick}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                    <CloudUpload className="w-10 h-10 text-orange-600" />
                  </div>
                  
                  <div className="text-center space-y-3">
                    <p className="text-lg font-semibold text-gray-800">Drop your image here or click to browse</p>
                    <p className="text-sm text-gray-500">
                      Supports JPG, PNG, GIF up to 10MB
                    </p>
                    <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl">
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Selected Image
                    </h4>
                    <div className="grid gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video rounded-2xl bg-gray-100 overflow-hidden border-2 border-gray-200">
                            {file.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="text-sm mt-2 text-gray-600 truncate font-medium">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Instructions</h3>
                </div>
                
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Describe what you'd like me to do with this image..." 
                    value={prompt}
                    onChange={handlePromptChange}
                    className="min-h-[120px] border-2 border-gray-200 rounded-2xl p-4 text-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Quick Templates:</p>
                    <div className="grid gap-2">
                      {quickPrompts.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => setPrompt(template)}
                          className="text-left p-3 text-sm bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors duration-200"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-200 p-4 rounded-2xl text-red-700">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {results && (
              <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Analysis Results
                </h4>
                <div className="bg-white rounded-xl p-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {typeof results === 'string' 
                    ? results 
                    : JSON.stringify(results, null, 2)
                  }
                </div>
              </div>
            )}
            {files.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFiles([]);
                    setPrompt("");
                    setResults(null);
                    setError(null);
                  }}
                  className="flex-1 h-12 border-2 border-gray-200 hover:border-gray-300 rounded-xl"
                >
                  Clear All
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="flex-1 h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Analyze Image
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Text Extraction</h3>
            <p className="text-sm text-gray-600">Extract and digitize text from images, handwriting, and documents.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Languages className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Instant Translation</h3>
            <p className="text-sm text-gray-600">Translate text found in images across multiple languages instantly.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Smart Analysis</h3>
            <p className="text-sm text-gray-600">AI-powered analysis to understand context and provide detailed descriptions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}