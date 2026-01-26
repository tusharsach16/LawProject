import { useState, useEffect } from 'react';
import { Gavel, Scale, Loader2, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { getMockTrialSituationsCat, getMockTrialCategories } from '../services/authService';
import Matchmaking from '../components/MatchMaking';
import { useNavigate } from 'react-router-dom';

interface Situation {
  _id: string;
  title: string;
  description: string;
}

interface Category {
    _id: string;
    title: string;
    slug: string;
}

const MockTrialLobby = () => {
  const [situations, setSituations] = useState<Situation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const data = await getMockTrialCategories();
            setCategories(data || []);
        } catch (err) {
            console.error("Failed to load categories:", err);
            setCategories([]);
        }
    };
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchSituations = async () => {
      try {
        setLoading(true);
        const data = await getMockTrialSituationsCat(selectedCategory || undefined);
        setSituations(data || []);
      } catch (err) {
        console.error(err);
        setSituations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSituations();
  }, [selectedCategory]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg">
            <Gavel size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
              Mock Trials Lobby
              <Sparkles className="h-7 w-7 text-amber-500" />
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Choose a case, select your side, and practice your legal skills.</p>
          </div>
        </div>
      </header>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Filter by Category</h2>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-3 custom-scrollbar">
          <button 
              onClick={() => setSelectedCategory('')}
              className={`px-5 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                selectedCategory === '' 
                  ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg scale-105' 
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-amber-500/30 hover:shadow-md'
              }`}
          >
              <Scale size={16} />
              All Cases
          </button>
          {categories.map((cat, index) => (
              <button 
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-5 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === cat.slug 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg scale-105' 
                      : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-amber-500/30 hover:shadow-md'
                  }`}
                  style={{
                    animation: `slideInCategory 0.3s ease-out ${index * 0.05}s both`
                  }}
              >
                  {cat.title}
              </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <Scale className="h-16 w-16 text-amber-500 animate-pulse" />
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 text-lg font-medium">Loading cases...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {situations.length > 0 ? situations.map((sit, index) => (
            <div 
              key={sit._id} 
              className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex flex-col hover:shadow-xl hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 group"
              style={{
                animation: `slideInCase 0.4s ease-out ${index * 0.05}s both`
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                  <Gavel className="h-5 w-5 text-amber-600" />
                </div>
                <div className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                  Case #{index + 1}
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">
                {sit.title}
              </h2>
              
              <p className="text-sm text-slate-600 leading-relaxed flex-grow line-clamp-4 mb-4">
                {sit.description}
              </p>
              
              <button 
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    alert("Please sign in to participate in a mock trial.");
                    navigate("/signin");
                    return;
                  }
                  setSelectedSituation(sit);
                }}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
              >
                Participate
                <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          )) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-6">
                <Gavel className="h-12 w-12 text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Cases Found</h3>
              <p className="text-slate-600 text-center max-w-md">
                No cases found in this category. Try selecting a different category or check back later.
              </p>
            </div>
          )}
        </div>
      )}

      {selectedSituation && (
        <Matchmaking 
            situation={selectedSituation}
            onClose={() => setSelectedSituation(null)}
        />
      )}
    </div>
  );
};

export default MockTrialLobby;