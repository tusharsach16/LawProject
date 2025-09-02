// src/pages/Quiz.tsx
import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

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

const Quiz: React.FC<QuizProps> = ({ categorySlug, onQuizComplete }) => {
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
        const response = await fetch(`http://localhost:5000/quiz/getQuiz?category=${categorySlug}&limit=10`, {
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
  }, [categorySlug]);

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
      const response = await fetch('http://localhost:5000/quiz/submit', {
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
      <div className="flex items-center justify-center h-full">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
        <p className="ml-4 text-gray-600">Loading Questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    )
  }

  if (questions.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-600">No questions found for this category.</p>
        </div>
      )
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = answers.find(a => a.questionId === currentQuestion._id)?.selectedIndex;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="mb-6">
          <p className="text-lg text-gray-500 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
          <h2 className="text-2xl font-semibold">{currentQuestion.ques}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button 
                key={index} 
                onClick={() => handleAnswerSelect(index)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedOption === index 
                    ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300' 
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
            >
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleNext}
            disabled={selectedOption === undefined || quizState === 'submitting'}
            className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {quizState === 'submitting' 
              ? 'Submitting...' 
              : currentQuestionIndex < questions.length - 1 
              ? 'Next Question' 
              : 'Finish & See Results'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;