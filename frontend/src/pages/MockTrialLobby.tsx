import { useState, useEffect } from 'react';
import { Gavel } from 'lucide-react';
// Dono API functions ko import karein
import { getMockTrialSituationsCat, getMockTrialCategories } from '../services/authService';
import Matchmaking from '../components/MatchMaking';

// Situation ka type
interface Situation {
  _id: string;
  title: string;
  description: string;
}

// Category ka type
interface Category {
    _id: string;
    title: string;
    slug: string;
}

const MockTrialLobby = () => {
  const [situations, setSituations] = useState<Situation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);

  // --- NAYI STATES FILTER KE LIYE ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Slug save karega

  // Pehle saari categories fetch karein
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const data = await getMockTrialCategories();
            setCategories(data);
        } catch (err) {
            console.error("Failed to load categories:", err);
        }
    };
    fetchCategories();
  }, []);

  // Jab bhi category badle, uss category ke situations fetch karein
  useEffect(() => {
    const fetchSituations = async () => {
      try {
        setLoading(true);
        // categorySlug ke aadhar par data fetch karein
        const data = await getMockTrialSituationsCat(selectedCategory || undefined);
        setSituations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSituations();
  }, [selectedCategory]); // Ab yeh selectedCategory par depend karta hai

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Gavel size={32} />
          Mock Trials Lobby
        </h1>
        <p className="text-gray-500 mt-1">Choose a case, select your side, and practice your legal skills.</p>
      </header>

      {/* --- YEH NAYA FILTER TABS SECTION HAI --- */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-2">
        <button 
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${selectedCategory === '' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
            All Cases
        </button>
        {categories.map(cat => (
            <button 
                key={cat._id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${selectedCategory === cat.slug ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            >
                {cat.title}
            </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading cases...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {situations.length > 0 ? situations.map(sit => (
            <div key={sit._id} className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col hover:shadow-md transition-shadow">
              <h2 className="text-lg font-bold text-gray-800">{sit.title}</h2>
              <p className="text-sm text-gray-600 mt-2 flex-grow line-clamp-4">{sit.description}</p>
              <button 
                onClick={() => setSelectedSituation(sit)}
                className="mt-4 w-full bg-black text-white font-semibold py-2 rounded-md hover:bg-gray-800 transition"
              >
                Participate
              </button>
            </div>
          )) : <p className="col-span-full text-center text-gray-500 py-10">No cases found in this category.</p>}
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

