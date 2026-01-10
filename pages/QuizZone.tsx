
import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { BrainCircuit, Loader2, CheckCircle2, XCircle, ChevronRight, RefreshCcw } from 'lucide-react';

interface QuizZoneProps {
  onApiError?: (err: any) => void;
}

const QuizZone: React.FC<QuizZoneProps> = ({ onApiError }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setQuestions([]);
    setCurrentIdx(0);
    setUserAnswers([]);
    setIsFinished(false);
    setShowExplanation(false);
    try {
      const qs = await generateQuiz(topic, difficulty);
      setQuestions(qs);
      setUserAnswers(new Array(qs.length).fill(null));
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("403") || err.message?.includes("permission") || err.message?.includes("not found")) {
        onApiError?.(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    if (userAnswers[currentIdx] !== null) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = optionIdx;
    setUserAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    if (!questions.length || !userAnswers.length) return 0;
    return userAnswers.reduce((acc, ans, i) => {
      if (questions[i] && ans === questions[i].correctAnswer) {
        return (acc as number) + 1;
      }
      return acc;
    }, 0) as number;
  };

  const resetAll = () => {
    setQuestions([]);
    setTopic('');
    setIsFinished(false);
    setUserAnswers([]);
    setCurrentIdx(0);
    setShowExplanation(false);
  };

  if (isFinished) {
    const score = calculateScore();
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-xl text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-gray-500 mb-8">Great job practicing your concepts on {topic}.</p>
        <div className="bg-gray-50 rounded-xl p-6 mb-8 inline-block min-w-[200px]">
          <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Your Score</p>
          <p className="text-5xl font-black text-blue-600">{score} / {questions.length}</p>
        </div>
        <div className="flex space-x-4 justify-center">
          <button onClick={startQuiz} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center hover:bg-blue-700 transition-all">
            <RefreshCcw size={18} className="mr-2" /> Try Again
          </button>
          <button onClick={resetAll} className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all">
            New Topic
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {questions.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BrainCircuit size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Practice Makes Perfect</h2>
          <p className="text-gray-500 mb-8">Generate a custom quiz to test your exam preparedness.</p>
          
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Subject/Topic</label>
              <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Chemical Bonding, Newton's Laws"
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Difficulty</label>
              <div className="flex space-x-2">
                {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-lg border transition-all ${difficulty === d ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={startQuiz}
              disabled={isLoading || !topic.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : <BrainCircuit className="mr-2" />}
              Generate Quiz
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-blue-600 h-2">
            <div 
              className="bg-green-400 h-full transition-all duration-500" 
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Question {currentIdx + 1} of {questions.length}</span>
              <span className="text-xs font-medium text-gray-500">Topic: {topic}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-8">{questions[currentIdx]?.question}</h3>
            
            <div className="space-y-3">
              {questions[currentIdx]?.options.map((opt, i) => {
                const isSelected = userAnswers[currentIdx] === i;
                const isCorrect = questions[currentIdx]?.correctAnswer === i;
                const showResult = userAnswers[currentIdx] !== null;
                
                let btnStyle = 'border-gray-200 hover:border-blue-300 hover:bg-blue-50';
                if (showResult) {
                  if (isCorrect) btnStyle = 'border-green-500 bg-green-50 text-green-700';
                  else if (isSelected) btnStyle = 'border-red-500 bg-red-50 text-red-700';
                  else btnStyle = 'border-gray-100 opacity-60';
                }

                return (
                  <button
                    key={i}
                    disabled={showResult}
                    onClick={() => handleAnswer(i)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold mr-4 text-gray-500">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-medium">{opt}</span>
                    </div>
                    {showResult && isCorrect && <CheckCircle2 size={20} className="text-green-600" />}
                    {showResult && isSelected && !isCorrect && <XCircle size={20} className="text-red-600" />}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-xl animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                    <CheckCircle2 size={16} />
                  </div>
                  <h4 className="font-bold text-blue-800">Explanation</h4>
                </div>
                <p className="text-sm text-blue-700 leading-relaxed">{questions[currentIdx]?.explanation}</p>
                <button 
                  onClick={nextQuestion}
                  className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center hover:bg-blue-700"
                >
                  {currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ChevronRight size={18} className="ml-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizZone;
