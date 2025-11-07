import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
const API = import.meta.env.VITE_API_URL;

interface Question {
  _id: string;
  ques: string;
  options: string[];
  correctIndex: number;
  categoryId: string;
}

interface QuizProps {
  categorySlug: string;
  limit: number;
  onQuizComplete: (score: { correct: number; incorrect: number; percentage: number }) => void;
}

const Quiz: React.FC<QuizProps> = ({ categorySlug, limit, onQuizComplete }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([]);
  const [quizState, setQuizState] = useState<'loading' | 'active' | 'submitting'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError("You must be logged in to take the quiz.");
        setQuizState('active');
        return;
      }

      try {
        // Fixed: Use the limit prop instead of hardcoded value
        const response = await fetch(`${API}/api/quiz/getQuiz?category=${categorySlug}&limit=${limit}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || 'Failed to fetch questions. Please try again.');
        }

        const data = await response.json();
        if (data && data.quiz) {
          setQuestions(data.quiz);
        } else {
          setQuestions([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setQuizState('active');
      }
    };

    fetchQuestions();
  }, [categorySlug, limit]);

  const handleAnswerSelect = (selectedIndex: number) => {
    const questionId = questions[currentQuestionIndex]._id;
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId);
    if (existingAnswerIndex > -1) {
        const newAnswers = [...answers];
        newAnswers[existingAnswerIndex] = { questionId, selectedIndex };
        setAnswers(newAnswers);
    } else {
        setAnswers([...answers, { questionId, selectedIndex }]);
    }
  };

  const handleSubmit = async () => {
    setQuizState('submitting');
    const token = localStorage.getItem('token');

    if (!token) {
      setError("Authentication error. Please log in again.");
      setQuizState('active');
      return;
    }

    try {
      const response = await fetch(`${API}/api/quiz/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            category: categorySlug,
            answers: answers
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to submit quiz');
      }
      
      const result = await response.json();
      onQuizComplete(result);

    } catch (err: any) {
      setError(err.message);
      setQuizState('active');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  if (quizState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-slate-900 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Loading Questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-slate-900 mx-auto mb-4" />
          <p className="text-xl text-slate-900 font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-xl text-slate-600">No questions found for this category.</p>
          </div>
        </div>
      )
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = answers.find(a => a.questionId === currentQuestion._id)?.selectedIndex;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-semibold text-slate-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-slate-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 leading-relaxed">
            {currentQuestion.ques}
          </h2>
          
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button 
                  key={index} 
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-5 border-2 rounded-xl text-left transition-all duration-200 flex items-start gap-3 group ${
                      selectedOption === index 
                      ? 'bg-slate-50 border-slate-900 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedOption === index
                    ? 'border-slate-900 bg-slate-900'
                    : 'border-slate-300 group-hover:border-slate-400'
                }`}>
                  {selectedOption === index && (
                    <CheckCircle className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </div>
                <span className={`font-medium flex-1 ${
                  selectedOption === index ? 'text-slate-900' : 'text-slate-700'
                }`}>
                  {option}
                </span>
              </button>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleNext}
              disabled={selectedOption === undefined || quizState === 'submitting'}
              className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 group"
            >
              {quizState === 'submitting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  Finish & See Results
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;