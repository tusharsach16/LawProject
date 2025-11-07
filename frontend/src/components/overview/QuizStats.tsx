import React, { useState, useEffect } from 'react';
import { getQuizCount, getDetailedQuizResults } from '../../services/authService';
import { Trophy, BarChart3, Calendar, CheckCircle, XCircle, Loader2, Scale, AlertCircle, ChevronRight, Award } from 'lucide-react';

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
    };
    selectedIndex: number;
    isCorrect: boolean;
    correctAnswer: number;
  }[];
}

interface QuizStatsProps {
  onViewDetails?: (attempt: QuizAttempt) => void;
}

const QuizStats: React.FC<QuizStatsProps> = ({ onViewDetails }) => {
  const [quizCount, setQuizCount] = useState<number>(0);
  const [detailedResults, setDetailedResults] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizData();
  }, []);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch quiz count
      const countResponse = await getQuizCount();
      setQuizCount(countResponse.quizCount);

      // Fetch detailed results
      const resultsResponse = await getDetailedQuizResults();
      setDetailedResults(resultsResponse.attempts);

    } catch (err: any) {
      console.error('Error fetching quiz data:', err);
      setError(err.response?.data?.message || 'Failed to fetch quiz data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
    if (percentage >= 60) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative mb-6">
          <Scale className="h-16 w-16 text-amber-500 animate-pulse" />
          <Loader2 className="h-8 w-8 text-amber-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-slate-600 text-lg font-medium">Loading quiz statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-red-100 rounded-full p-4 mb-6">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
        <button 
          onClick={fetchQuizData}
          className="px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Count Card */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-amber-500/30 transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Trophy className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Quiz Statistics</h2>
            <p className="text-slate-600">You have completed {quizCount} quiz{quizCount !== 1 ? 'es' : ''}</p>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      {detailedResults.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-500" />
            Recent Quiz Results
          </h3>
          
          {detailedResults.map((attempt, index) => (
            <div 
              key={attempt._id} 
              className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 group"
              style={{
                animation: `slideInTrial 0.4s ease-out ${index * 0.05}s both`
              }}
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-amber-100 transition-colors">
                    <Award className="h-5 w-5 text-slate-600 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                      {attempt.category.name}
                    </h4>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(attempt.createdAt)}
                    </p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold text-white shadow-md ${getScoreBgColor(attempt.percentage)}`}>
                  {attempt.percentage}%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{attempt.totalQuestions}</div>
                  <div className="text-sm text-slate-600 font-medium">Total Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle className="h-5 w-5" />
                    {attempt.correctCount}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 flex items-center justify-center gap-1">
                    <XCircle className="h-5 w-5" />
                    {attempt.incorrectCount}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Incorrect</div>
                </div>
              </div>

              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(attempt)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                >
                  View Detailed Results
                  <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-8">
            <Trophy className="h-16 w-16 text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No Quiz Attempts Yet</h3>
          <p className="text-slate-600 text-center max-w-md">
            Start taking quizzes to see your statistics here!
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizStats;