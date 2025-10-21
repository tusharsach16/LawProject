import React, { useState } from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import QuizStats from '../components/overview/QuizStats';
import DetailedQuizResults from '../components/DetailedQuizResults';

interface QuizAttempt {
  _id: string;
  category: {
    name: string;
    slug: string;
  };
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  percentage: number;
  createdAt: string;
  answers: {
    question: {
      ques: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    };
    selectedIndex: number;
    isCorrect: boolean;
    correctAnswer: number;
  }[];
}

const QuizHistoryPage: React.FC = () => {
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  const handleViewDetails = (attempt: QuizAttempt) => {
    setSelectedAttempt(attempt);
  };

  const handleCloseDetails = () => {
    setSelectedAttempt(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg">
            <BarChart3 size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
              Quiz History
              <Sparkles className="h-7 w-7 text-amber-500" />
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">View your quiz statistics and detailed results</p>
          </div>
        </div>
      </header>

      <QuizStats onViewDetails={handleViewDetails} />

      {selectedAttempt && (
        <DetailedQuizResults 
          attempt={selectedAttempt} 
          onClose={handleCloseDetails} 
        />
      )}
    </div>
  );
};

export default QuizHistoryPage;