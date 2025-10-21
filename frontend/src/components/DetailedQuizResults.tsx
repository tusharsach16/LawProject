import React from 'react';
import { X, CheckCircle, XCircle, ArrowLeft, Award, Target, TrendingUp, BookOpen } from 'lucide-react';

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

interface DetailedQuizResultsProps {
  attempt: QuizAttempt;
  onClose: () => void;
}

const DetailedQuizResults: React.FC<DetailedQuizResultsProps> = ({ attempt, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreGradient = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-green-600';
    if (percentage >= 60) return 'from-amber-500 to-amber-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8">
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-gradient-to-br ${getScoreGradient(attempt.percentage)} rounded-2xl shadow-lg`}>
                  <Award size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                    {attempt.category.name}
                  </h1>
                  <p className="text-slate-600 mt-1 text-sm sm:text-base">{formatDate(attempt.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <Target className="h-6 w-6 text-slate-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900">{attempt.totalQuestions}</div>
              <div className="text-sm text-slate-600 font-medium">Total</div>
            </div>
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900">{attempt.correctCount}</div>
              <div className="text-sm text-slate-600 font-medium">Correct</div>
            </div>
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900">{attempt.incorrectCount}</div>
              <div className="text-sm text-slate-600 font-medium">Incorrect</div>
            </div>
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <TrendingUp className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-slate-900">{attempt.percentage}%</div>
              <div className="text-sm text-slate-600 font-medium">Score</div>
            </div>
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6 overflow-y-auto max-h-[50vh]">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">Detailed Review</h2>
          </div>
          
          <div className="space-y-6">
            {attempt.answers.map((answer, index) => (
              <div 
                key={index} 
                className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300"
                style={{
                  animation: `slideInCase 0.4s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${answer.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                      {answer.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                        Question #{index + 1}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-4 leading-relaxed">
                      {answer.question.ques}
                    </h3>
                    
                    <div className="space-y-3">
                      {answer.question.options.map((option, optionIndex) => {
                        const isSelected = optionIndex === answer.selectedIndex;
                        const isCorrect = optionIndex === answer.correctAnswer;
                        
                        return (
                          <div
                            key={optionIndex}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                              isCorrect
                                ? 'border-green-500 bg-green-50'
                                : isSelected
                                ? 'border-red-500 bg-red-50'
                                : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                                isCorrect
                                  ? 'bg-green-200 text-green-700'
                                  : isSelected
                                  ? 'bg-red-200 text-red-700'
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="text-slate-900 font-medium flex-1">{option}</span>
                              {isCorrect && (
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" strokeWidth={2.5} />
                              )}
                              {isSelected && !isCorrect && (
                                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" strokeWidth={2.5} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 p-3 bg-slate-100 rounded-xl text-sm">
                      <span className="font-bold text-slate-700">Your Answer:</span>{' '}
                      <span className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        Option {String.fromCharCode(65 + answer.selectedIndex)}
                      </span>
                      {!answer.isCorrect && (
                        <>
                          <span className="mx-2 text-slate-400">•</span>
                          <span className="font-bold text-slate-700">Correct Answer:</span>{' '}
                          <span className="font-medium text-green-600">
                            Option {String.fromCharCode(65 + answer.correctAnswer)}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {answer.question.explanation && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-500 rounded-xl">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-amber-700 flex-shrink-0">💡 Explanation:</span>
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {answer.question.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t-2 border-slate-200 px-6 sm:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Results
          </button>
          
          <div className="text-sm text-slate-600 font-medium">
            📅 {formatDate(attempt.createdAt)}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInCase {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DetailedQuizResults;