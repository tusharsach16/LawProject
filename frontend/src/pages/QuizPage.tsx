import React, { useState } from 'react';
import Quiz from './Quiz';
import { Scale, BookOpen, Shield, Gavel, FileText, Sparkles, Target } from 'lucide-react';

const OptionsSelector = ({ onStartQuiz }: { onStartQuiz: (limit: number) => void }) => {
    const limits = [5, 10, 20];

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                        <Target size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
                            Choose Quiz Length
                            <Sparkles className="h-7 w-7 text-amber-500" />
                        </h1>
                        <p className="text-slate-600 mt-1 text-sm sm:text-base">How many questions would you like to attempt?</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {limits.map((limit, index) => (
                    <button
                        key={limit}
                        onClick={() => onStartQuiz(limit)}
                        className="bg-white border-2 border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:shadow-xl hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 group"
                        style={{
                            animation: `slideInOption 0.4s ease-out ${index * 0.1}s both`
                        }}
                    >
                        <div className="p-4 bg-amber-100 rounded-xl group-hover:bg-amber-200 transition-colors mb-4">
                            <span className="text-5xl font-bold text-slate-900">{limit}</span>
                        </div>
                        <span className="text-sm text-slate-600 font-semibold">Questions</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const CategorySelector = ({ onSelectCategory }: { onSelectCategory: (slug: string) => void }) => {
    const categories = [
        { name: 'Criminal Law', slug: 'criminal', icon: Gavel },
        { name: 'Civil Law', slug: 'civil', icon: FileText },
        { name: 'Constitutional Law', slug: 'constitutional', icon: BookOpen },
        { name: 'Indian Penal Code', slug: 'ipc', icon: Shield },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                        <Scale size={32} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
                            Legal Quiz
                            <Sparkles className="h-7 w-7 text-amber-500" />
                        </h1>
                        <p className="text-slate-600 mt-1 text-sm sm:text-base">Choose a topic to test your knowledge</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {categories.map((cat, index) => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.slug}
                            onClick={() => onSelectCategory(cat.slug)}
                            className="bg-white border-2 border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 text-left group"
                            style={{
                                animation: `slideInCategory 0.4s ease-out ${index * 0.1}s both`
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                                    <Icon className="h-6 w-6 text-amber-600" strokeWidth={1.5} />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{cat.name}</h2>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const QuizPage: React.FC = () => {
    const [view, setView] = useState<'category' | 'options' | 'quiz' | 'result'>('category');
    const [category, setCategory] = useState<string | null>(null);
    const [limit, setLimit] = useState<number>(10);
    const [finalScore, setFinalScore] = useState<{ correct: number; incorrect: number; percentage: number } | null>(null);

    const handleSelectCategory = (slug: string) => {
        setCategory(slug);
        setView('options');
    };

    const handleStartQuiz = (selectedLimit: number) => {
        setLimit(selectedLimit);
        setView('quiz');
    };

    const handleQuizComplete = (score: { correct: number; incorrect: number; percentage: number }) => {
        setFinalScore(score);
        setView('result');
    };

    const handleRestart = () => {
        setView('category');
        setCategory(null);
        setFinalScore(null);
    };

    switch (view) {
        case 'category':
            return <CategorySelector onSelectCategory={handleSelectCategory} />;
        case 'options':
            return <OptionsSelector onStartQuiz={handleStartQuiz} />;
        case 'quiz':
            if (!category) return <div className="p-8 text-center text-slate-600">Error: Category not selected.</div>;
            return <Quiz categorySlug={category} limit={limit} onQuizComplete={handleQuizComplete} />;
        case 'result':
            if (!finalScore) return <div className="p-8 text-center text-slate-600">Error: Score not available.</div>;
            return (
                <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full flex items-center justify-center">
                    <div className="max-w-2xl w-full">
                        <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xl animate-scale-in">
                            <div className="text-center space-y-8">
                                <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg inline-block">
                                    <Scale className="h-16 w-16 text-white" strokeWidth={1.5} />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl font-bold text-slate-900">Quiz Completed</h2>
                                    <div className="border-t border-b border-slate-200 py-8">
                                        <p className="text-sm text-slate-500 uppercase tracking-wider mb-3">Your Score</p>
                                        <p className="text-7xl font-bold text-slate-900">{finalScore.percentage}%</p>
                                    </div>
                                    <div className="flex justify-center gap-12 text-sm">
                                        <div className="text-center">
                                            <p className="text-slate-500 mb-2">Correct</p>
                                            <p className="text-3xl font-bold text-slate-900">{finalScore.correct}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-slate-500 mb-2">Incorrect</p>
                                            <p className="text-3xl font-bold text-slate-900">{finalScore.incorrect}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleRestart}
                                    className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
                                >
                                    Take Another Quiz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        default:
            return <CategorySelector onSelectCategory={handleSelectCategory} />;
    }
};

export default QuizPage;