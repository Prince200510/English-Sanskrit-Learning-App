import { useState, useEffect } from 'react';
import { generateGrammarExercises } from '../services/api';
import { GraduationCap, Check, X, BookOpen, Target, Award, ArrowRight, Sparkles, BarChart3 } from 'lucide-react';
import type { GrammarQuestion } from '../types/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

const demoQuestions: GrammarQuestion[] = [
  {
    difficulty: "beginner",
    explanation: "In Sanskrit, the verb agrees with the subject in person and number. 'पठति' is the correct form for 'he/she reads'.",
    grammaticalConcept: "Subject-Verb Agreement",
    options: [
      { isCorrect: true, text: "पठति" },
      { isCorrect: false, text: "पठामि" },
      { isCorrect: false, text: "पठन्ति" },
      { isCorrect: false, text: "पठसि" }
    ],
    question: "बालकः पुस्तकं _____। (The boy ___ a book.)"
  },
  {
    difficulty: "beginner",
    explanation: "The instrumental case (तृतीया विभक्ति) is used to show the instrument with which an action is performed.",
    grammaticalConcept: "Case Usage",
    options: [
      { isCorrect: false, text: "लेखनी" },
      { isCorrect: true, text: "लेखन्या" },
      { isCorrect: false, text: "लेखनीम्" },
      { isCorrect: false, text: "लेखन्याः" }
    ],
    question: "छात्रः _____ लिखति। (The student writes with a pen.)"
  },
  {
    difficulty: "beginner",
    explanation: "When two nouns are in apposition, they must agree in case. Here, 'नगरी' (city) and 'अयोध्या' must be in the same case.",
    grammaticalConcept: "Case Agreement",
    options: [
      { isCorrect: false, text: "अयोध्यायाः" },
      { isCorrect: false, text: "अयोध्यायाम्" },
      { isCorrect: true, text: "अयोध्या" },
      { isCorrect: false, text: "अयोध्याम्" }
    ],
    question: "_____ नगरी रामस्य जन्मभूमिः। (Ayodhya city is Ram's birthplace.)"
  }
];

export default function Grammar() {
  const [language, setLanguage] = useState('English');
  const [difficulty, setDifficulty] = useState('Easy');
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    setQuestions(demoQuestions);
  }, []);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await generateGrammarExercises({
        prompt: `Generate 5 ${difficulty} grammar questions in ${language}`,
      });
      setQuestions(result[language as keyof typeof result]);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTotalAttempts(0);
    } catch (err) {
      setError('Failed to generate grammar exercises. Please try again.');
      console.log(err);
      setQuestions(demoQuestions); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);
    setTotalAttempts(prev => prev + 1);
    const isCorrect = questions[currentQuestion].options.find(
      (opt) => opt.text === answer
    )?.isCorrect;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setIsAnimating(false);
      }, 300);
    }
  };

  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;
  const isQuizComplete = currentQuestion === questions.length - 1 && selectedAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100">
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Grammar Mastery
            </h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Perfect your grammar skills with interactive exercises and instant feedback
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {totalAttempts > 0 && (
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600">{totalAttempts}</div>
              <div className="text-sm text-gray-600">Questions Attempted</div>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Exercise Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-indigo-300">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">🇺🇸 English</SelectItem>
                    <SelectItem value="Hindi">🇮🇳 Hindi</SelectItem>
                    <SelectItem value="Sanskrit">🕉️ Sanskrit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-indigo-300">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">🟢 Easy</SelectItem>
                    <SelectItem value="Intermediate">🟡 Intermediate</SelectItem>
                    <SelectItem value="Advanced">🔴 Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 text-red-700 bg-red-50 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full mt-6 h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate New Exercises
                </div>
              )}
            </Button>
          </div>
          {questions.length > 0 && (
            <div className="p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-600">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion + (selectedAnswer ? 1 : 0)) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-100">
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {questions[currentQuestion].grammaticalConcept}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
                    {questions[currentQuestion].question}
                  </h3>
                </div>
                <div className="grid gap-4 mb-8">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={option.text}
                      onClick={() => handleAnswer(option.text)}
                      disabled={selectedAnswer !== null}
                      className={`group w-full p-6 text-left rounded-2xl transition-all duration-300 transform ${
                        selectedAnswer === option.text
                          ? option.isCorrect
                            ? 'bg-green-50 border-2 border-green-500 scale-[1.02]'
                            : 'bg-red-50 border-2 border-red-500 scale-[1.02]'
                          : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-300 hover:scale-[1.01]'
                        } ${selectedAnswer === null ? 'hover:shadow-lg' : ''} 
                        ${selectedAnswer && option.isCorrect && selectedAnswer !== option.text ? 'bg-green-50 border-2 border-green-300' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-lg font-medium text-gray-900">{option.text}</span>
                        </div>
                        {selectedAnswer === option.text && (
                          <div className="flex items-center gap-2">
                            {option.isCorrect ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <Check className="w-6 h-6" />
                                <span className="font-medium">Correct!</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-600">
                                <X className="w-6 h-6" />
                                <span className="font-medium">Incorrect</span>
                              </div>
                            )}
                          </div>
                        )}
                        {selectedAnswer && option.isCorrect && selectedAnswer !== option.text && (
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="w-6 h-6" />
                            <span className="font-medium">Correct Answer</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {showExplanation && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200 animate-fade-in">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Explanation</h4>
                        <p className="text-blue-800 leading-relaxed">
                          {questions[currentQuestion].explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {selectedAnswer && !isQuizComplete && (
                  <Button
                    onClick={nextQuestion}
                    className="w-full h-14 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-2xl text-lg animate-fade-in"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
                {isQuizComplete && (
                  <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 animate-fade-in">
                    <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-900 mb-2">Quiz Complete!</h3>
                    <p className="text-green-700 text-lg mb-4">
                      You scored {score} out of {questions.length} ({accuracy}% accuracy)
                    </p>
                    <Button
                      onClick={handleGenerate}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl"
                    >
                      Try Another Quiz
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Study Strategy</h3>
            <p className="text-sm text-gray-600">Read each question carefully and think about the grammatical concept being tested.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Practice Makes Perfect</h3>
            <p className="text-sm text-gray-600">Regular practice with different difficulty levels improves understanding.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Learn from Mistakes</h3>
            <p className="text-sm text-gray-600">Read explanations carefully to understand why answers are correct or incorrect.</p>
          </div>
        </div>
      </div>
    </div>
  );
}