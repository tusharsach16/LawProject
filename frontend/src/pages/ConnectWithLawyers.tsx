import { useState, useEffect } from 'react';
import { Search, Filter, ArrowDownUp, Scale, Sparkles, Loader2, Users } from 'lucide-react';
import { getAllLawyers, getSpecializations } from '../services/authService';
import LawyerCard from '../components/LawyerCard';

interface LawyerProfile {
  _id: string;
  name: string;
  profileImageUrl?: string;
  experience: number;
  specialization: string[];
  ratings: number;
  price: number;
}

const ConnectWithLawyers = () => {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [sortBy, setSortBy] = useState('ratings');
  const [filterSpec, setFilterSpec] = useState('');

  const [specializations, setSpecializations] = useState<string[]>([]);

  // Debouncing effect for search
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        const params = {
          q: debouncedTerm || undefined,
          sortBy: sortBy || undefined,
          specialization: filterSpec || undefined,
        };
        const data = await getAllLawyers(params);
        setLawyers(data);
      } catch (err) {
        setError('Failed to load lawyers. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, [debouncedTerm, sortBy, filterSpec]);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const data = await getSpecializations();
        setSpecializations(data);
      } catch (err) {
        console.error("Failed to load specializations:", err);
      }
    };
    fetchSpecializations();
  }, []); 

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-full">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg">
            <Scale size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
              Talk to Lawyer
              <Sparkles className="h-7 w-7 text-amber-500" />
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Connect with experienced legal professionals for expert advice.</p>
          </div>
        </div>
      </header>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Search & Filter</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search name or specialty..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 font-medium text-slate-700 bg-white hover:border-amber-500/30" 
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Filter by Specialization */}
          <div className="relative">
            <select
              value={filterSpec}
              onChange={(e) => setFilterSpec(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 hover:border-amber-500/30 cursor-pointer"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
            </select>
            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 hover:border-amber-500/30 cursor-pointer"
            >
              <option value="ratings">Sort by Rating</option>
              <option value="experience">Sort by Experience</option>
              <option value="price">Sort by Price</option>
            </select>
            <ArrowDownUp size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-6">
            <Scale className="h-16 w-16 text-amber-500 animate-pulse" />
            <Loader2 className="h-8 w-8 text-amber-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 text-lg font-medium">Loading lawyers...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-full flex items-center justify-center mb-6">
            <Scale className="h-12 w-12 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Lawyers</h3>
          <p className="text-slate-600 text-center max-w-md">{error}</p>
        </div>
      )}

      {/* Lawyers Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.length > 0 ? lawyers.map((lawyer, index) => (
            <div key={lawyer._id} style={{ animation: `slideInCase 0.4s ease-out ${index * 0.05}s both` }}>
              <LawyerCard lawyer={lawyer} />
            </div>
          )) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-6">
                <Users className="h-12 w-12 text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Lawyers Found</h3>
              <p className="text-slate-600 text-center max-w-md">
                No lawyers found matching your criteria. Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectWithLawyers;