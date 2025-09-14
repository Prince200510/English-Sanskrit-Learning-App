import { useState, useEffect } from "react";
import { generateFlashcards } from "../services/api";
import { BookOpen, ChevronLeft, ChevronRight, Repeat, Sparkles, Target, Trophy, Shuffle } from "lucide-react";
import type { FlashcardResponse } from "../types/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";

const demoFlashcards: FlashcardResponse[] = [
  {
    front: { English: "Hello", Hindi: "नमस्ते", Sanskrit: null },
    back: { English: null, Hindi: null, Sanskrit: "नमस्कार" },
  },
  {
    front: { English: "Thank you", Hindi: "धन्यवाद", Sanskrit: null },
    back: { English: null, Hindi: null, Sanskrit: "धन्यवादः" },
  },
  {
    front: { English: "Good morning", Hindi: "सुप्रभात", Sanskrit: null },
    back: { English: null, Hindi: null, Sanskrit: "सुप्रभातम्" },
  },
  {
    front: { English: "Welcome", Hindi: "स्वागत", Sanskrit: null },
    back: { English: null, Hindi: null, Sanskrit: "स्वागतम्" },
  },
  {
    front: { English: "How are you?", Hindi: "आप कैसे हैं?", Sanskrit: null },
    back: { English: null, Hindi: null, Sanskrit: "कथमस्ति भवान्?" },
  },
];

export default function Flashcards() {
  const [frontLanguage1, setFrontLanguage1] =
    useState<keyof FlashcardResponse["front"]>("English");
  const [frontLanguage2, setFrontLanguage2] =
    useState<keyof FlashcardResponse["front"]>("Hindi");
  const [backLanguage, setBackLanguage] =
    useState<keyof FlashcardResponse["back"]>("Sanskrit");
  const [cards, setCards] = useState<FlashcardResponse[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    setCards(demoFlashcards);
  }, []);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await generateFlashcards({
        prompt: `5 cards front to be in ${frontLanguage1} and ${frontLanguage2} only and back in ${backLanguage} only`,
      });
      setCards(result);
      setCurrentCard(0);
      setIsFlipped(false);
      setSlideDirection(null);
      setScore(0);
      setTotalAttempts(0);
    } catch (err) {
      setError("Failed to generate flashcards. Please try again.");
      console.log(err);
      setCards(demoFlashcards);
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    if (currentCard < cards.length - 1) {
      setIsFlipped(false);
      setSlideDirection("left");
      setTimeout(() => {
        setCurrentCard((curr) => curr + 1);
        setTimeout(() => {
          setSlideDirection(null);
        }, 10);
      }, 200);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setIsFlipped(false);
      setSlideDirection("right");
      setTimeout(() => {
        setCurrentCard((curr) => curr - 1);
        setTimeout(() => {
          setSlideDirection(null);
        }, 10);
      }, 200);
    }
  };

  const handleCorrect = () => {
    setScore(score + 1);
    setTotalAttempts(totalAttempts + 1);
    nextCard();
  };

  const handleIncorrect = () => {
    setTotalAttempts(totalAttempts + 1);
    nextCard();
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentCard(0);
    setIsFlipped(false);
  };

  const getSlideClass = () => {
    if (!slideDirection) return "";
    return slideDirection === "left"
      ? "-translate-x-full opacity-0"
      : "translate-x-full opacity-0";
  };

  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Interactive Flashcards</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">Master vocabulary through interactive card-based learning with instant feedback</p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {totalAttempts > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Correct</div>
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
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600">{totalAttempts}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Configure Languages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Front Language 1
                </label>
                <Select
                  value={frontLanguage1}
                  onValueChange={(value) =>
                    setFrontLanguage1(value as typeof frontLanguage1)
                  }
                >
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
                <label className="text-sm font-semibold text-gray-700">
                  Front Language 2
                </label>
                <Select
                  value={frontLanguage2}
                  onValueChange={(value) =>
                    setFrontLanguage2(value as typeof frontLanguage2)
                  }
                >
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
                <label className="text-sm font-semibold text-gray-700">
                  Back Language
                </label>
                <Select
                  value={backLanguage}
                  onValueChange={(value) =>
                    setBackLanguage(value as keyof FlashcardResponse["back"])
                  }
                >
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
            </div>

            {error && (
              <div className="mt-6 p-4 text-red-700 bg-red-50 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate New Flashcards
                  </div>
                )}
              </Button>
              {cards.length > 0 && (
                <Button
                  onClick={shuffleCards}
                  variant="outline"
                  className="h-12 px-6 border-2 border-gray-200 hover:border-indigo-300"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Shuffle
                </Button>
              )}
            </div>
          </div>

          {/* Flashcard Display */}
          {cards.length > 0 && (
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-600">
                    {currentCard + 1} of {cards.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCard + 1) / cards.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative w-full h-96 cursor-pointer perspective-1000 mb-8"
              >
                <div
                  className={`absolute w-full h-full transition-all duration-700 transform-style-preserve-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  } ${getSlideClass()} hover:scale-[1.02]`}
                >
                  <div className="absolute w-full h-full bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8 backface-hidden border border-blue-100">
                    <div className="flex flex-col items-center justify-center h-full space-y-6">
                      <div className="text-lg font-semibold text-blue-600 uppercase tracking-wide">
                        {frontLanguage1}
                      </div>
                      <p className="text-3xl font-bold text-gray-900 text-center leading-relaxed">
                        {cards[currentCard].front[frontLanguage1]}
                      </p>
                      <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <div className="text-lg font-semibold text-blue-600 uppercase tracking-wide">
                        {frontLanguage2}
                      </div>
                      <p className="text-3xl font-bold text-gray-900 text-center leading-relaxed">
                        {cards[currentCard].front[frontLanguage2]}
                      </p>
                      <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium">
                        Click to flip
                      </div>
                    </div>
                  </div>
                  <div className="absolute w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-8 backface-hidden rotate-y-180">
                    <div className="flex flex-col items-center justify-center h-full space-y-6">
                      <div className="text-lg font-semibold text-indigo-200 uppercase tracking-wide">
                        {backLanguage}
                      </div>
                      <p className="text-4xl font-bold text-white text-center leading-relaxed">
                        {cards[currentCard].back[backLanguage]}
                      </p>
                      <div className="absolute bottom-4 right-4 text-xs text-indigo-200 font-medium">
                        Click to flip back
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <Button
                  onClick={prevCard}
                  disabled={currentCard === 0}
                  variant="outline"
                  size="lg"
                  className="w-14 h-14 rounded-full border-2 border-gray-200 hover:border-indigo-300 disabled:opacity-30"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsFlipped(!isFlipped)}
                    variant="outline"
                    className="px-6 py-3 border-2 border-gray-200 hover:border-indigo-300 rounded-xl"
                  >
                    <Repeat className="w-4 h-4 mr-2" />
                    Flip Card
                  </Button>
                </div>

                <Button
                  onClick={nextCard}
                  disabled={currentCard === cards.length - 1}
                  variant="outline"
                  size="lg"
                  className="w-14 h-14 rounded-full border-2 border-gray-200 hover:border-indigo-300 disabled:opacity-30"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>

              {isFlipped && (
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleIncorrect}
                    variant="outline"
                    className="px-8 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
                  >
                    ❌ Need Practice
                  </Button>
                  <Button
                    onClick={handleCorrect}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                  >
                    ✅ Got It!
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Study Tips</h3>
            <p className="text-sm text-gray-600">Click cards to flip and reveal answers. Practice regularly for better retention.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Track Progress</h3>
            <p className="text-sm text-gray-600">Mark cards as correct or incorrect to track your learning progress.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Shuffle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Mix It Up</h3>
            <p className="text-sm text-gray-600">Use the shuffle feature to randomize card order for better learning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
