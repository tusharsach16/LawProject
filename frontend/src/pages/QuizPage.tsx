import React, { useState } from 'react';
import Quiz from './Quiz';

const OptionsSelector = ({ onStartQuiz }: { onStartQuiz: (limit: number) => void }) => {
    const limits = [5, 10, 20]; // Aap yahan options badal sakte hain

    return (
        <div className="p-8 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Choose Quiz Length</h1>
            <p className="text-lg text-gray-600 mb-10">How many questions would you like to attempt?</p>
            <div className="flex justify-center gap-6">
                {limits.map(limit => (
                    <button
                        key={limit}
                        onClick={() => onStartQuiz(limit)}
                        className="w-32 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform"
                    >
                        <span className="text-3xl font-bold text-gray-800">{limit}</span>
                        <span className="text-sm text-gray-500 ml-2">Questions</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

const CategorySelector = ({ onSelectCategory }: { onSelectCategory: (slug: string) => void }) => {
    const categories = [
        { name: 'Criminal Law', slug: 'criminal' },
        { name: 'Civil Law', slug: 'civil' },
        { name: 'Constitutional Law', slug: 'constitutional' },
        { name: 'Indian Penal Code', slug: 'ipc' },
    ];
    return (
         <div className="p-8 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Select a Quiz Category</h1>
            <p className="text-lg text-gray-600 mb-10">Choose a topic to test your knowledge.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                    <button key={cat.slug} onClick={() => onSelectCategory(cat.slug)}
                        className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform">
                        <h2 className="text-xl font-semibold text-gray-800">{cat.name}</h2>
                    </button>
                ))}
            </div>
        </div>
    );
};


const QuizPage: React.FC = () => {
    const [view, setView] = useState<'category' | 'options' | 'quiz' | 'result'>('category');
    
    const [category, setCategory] = useState<string | null>(null);
    const [limit, setLimit] = useState<number>(10); // Default limit
    const [finalScore, setFinalScore] = useState<{ correct: number; incorrect: number; percentage: number } | null>(null);

    const handleSelectCategory = (slug: string) => {
        setCategory(slug);
        setView('options'); // Category ke baad options screen
    };

    const handleStartQuiz = (selectedLimit: number) => {
        setLimit(selectedLimit);
        setView('quiz'); // Options ke baad quiz start 
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
            if (!category) return <div>Error: Category not selected.</div>;
            return <Quiz categorySlug={category} limit={limit} onQuizComplete={handleQuizComplete} />;
        case 'result':
            if (!finalScore) return <div>Error: Score not available.</div>;
            return (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-lg shadow-xl">
                    <h2 className="text-4xl font-bold mb-4">Quiz Completed!</h2>
                    <p className="text-2xl mb-6">Your Score: <span className="font-bold text-blue-600">{finalScore.percentage}%</span></p>
                    <button onClick={handleRestart}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        Choose Another Category
                    </button>
                </div>
            );
        default:
             return <CategorySelector onSelectCategory={handleSelectCategory} />;
    }
};

export default QuizPage;