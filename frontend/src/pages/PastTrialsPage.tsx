import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPastMockTrials } from '../services/authService';
import { useAppSelector } from '../redux/hooks'; 
import { History, Trophy, TrendingDown, Scale, Loader2, ChevronRight, User, AlertCircle } from 'lucide-react';

interface Trial {
  _id: string;
  situationId: {
    _id: string;
    title: string;
  } | null;
  winnerId?: string;
  plaintiffId: {
    _id: string;
    name: string;
    profileImageUrl?: string;
  } | null;
  defendantId: {
    _id: string;
    name: string;
    profileImageUrl?: string;
  } | null;
}

const PastTrialsPage = () => {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAppSelector(state => state.user);

  useEffect(() => {
    const fetchTrials = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPastMockTrials();
        console.log('Fetched trials data:', data);
        setTrials(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        console.error('Error in fetchTrials:', err);
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrials();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="relative mb-6">
          <Scale className="h-16 w-16 text-amber-500 animate-pulse" />
          <Loader2 className="h-8 w-8 text-amber-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-slate-600 text-lg font-medium">Loading your trial history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-8 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-red-100 rounded-full p-4 mb-6">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <p className="text-red-600 text-lg font-medium text-center">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl shadow-lg">
            <History size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Past Mock Trials</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Review your courtroom performance and case history</p>
          </div>
        </div>
      </header>
      
      {trials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center mb-8">
            <Scale className="h-16 w-16 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No Trial History</h3>
          <p className="text-slate-600 text-center max-w-md mb-6">
            You haven't completed any mock trials yet. Start practicing your legal skills today!
          </p>
          <Link 
            to="/dashboard/mock-trials"
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            Start a Mock Trial
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trials.map((trial, index) => {
            const isWinner = trial.winnerId === user?._id;
            const resultText = isWinner ? "Victory" : "Defeat";
            const resultColor = isWinner 
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white';
            const ResultIcon = isWinner ? Trophy : TrendingDown;

            return (
              <div 
                key={trial._id} 
                className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-200 hover:border-amber-500/30 hover:shadow-xl transition-all duration-300 group"
                style={{
                  animation: `slideInTrial 0.4s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-amber-100 transition-colors">
                        <Scale className="h-5 w-5 text-slate-600 group-hover:text-amber-600 transition-colors" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                          {trial.situationId?.title || 'Untitled Case'}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{trial.plaintiffId?.name || 'Unknown'}</span>
                            <span className="text-xs text-slate-400">(Plaintiff)</span>
                          </div>
                          <span className="hidden sm:inline text-slate-400">vs.</span>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-500" />
                            <span className="font-medium">{trial.defendantId?.name || 'Unknown'}</span>
                            <span className="text-xs text-slate-400">(Defendant)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={`px-4 py-2 rounded-xl font-bold shadow-md flex items-center gap-2 ${resultColor}`}>
                      <ResultIcon className="h-5 w-5" />
                      {resultText}
                    </div>
                    <Link 
                      to={`/dashboard/trial-result/${trial._id}`}
                      className="px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 group/btn"
                    >
                      View Details
                      <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PastTrialsPage;