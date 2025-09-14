import { useState, useEffect } from 'react';
import { Search, Filter, ArrowDownUp } from 'lucide-react';
import { getAllLawyers } from '../services/authService';
import LawyerCard from '@/components/LawyerCard';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

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

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300); 

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

  const specializations = ["Criminal", "Civil", "Corporate Law", "Family Law", "Intellectual Property"];

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <header className="bg-yellow-400 text-black font-bold text-xl p-4 rounded-lg shadow-md mb-6">
        Talk to Lawyer
      </header>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={filterSpec}
              onChange={(e) => setFilterSpec(e.target.value)}
              className="appearance-none bg-white border rounded-lg pl-3 pr-8 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
            </select>
            <Filter size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border rounded-lg pl-3 pr-8 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="ratings">Sort by Rating</option>
              <option value="experience">Sort by Experience</option>
              <option value="price">Sort by Price</option>
            </select>
            <ArrowDownUp size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search name or specialty..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" 
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Lawyers Grid */}
      {loading && <p className="text-center text-gray-500 py-10">Loading lawyers...</p>}
      {error && <p className="text-center text-red-500 py-10">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.length > 0 ? lawyers.map(lawyer => (
            <LawyerCard key={lawyer._id} lawyer={lawyer} />
          )) : <p className="col-span-full text-center text-gray-500 py-10">No lawyers found matching your criteria.</p>}
        </div>
      )}
    </div>
  );
};

export default ConnectWithLawyers;

