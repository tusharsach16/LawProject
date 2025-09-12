import { useState, useEffect } from 'react';
import { Search, Filter, ArrowDownUp } from 'lucide-react';
import { getAllLawyers } from '../services/authService';
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

// Main Page Component
const ConnectWithLawyers = () => {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        const data = await getAllLawyers();
        setLawyers(data);
      } catch (err) {
        setError('Failed to load lawyers. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <header className="bg-yellow-400 text-black font-bold text-xl p-4 rounded-lg shadow-md mb-6">
        Talk to Lawyer
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black"><Filter size={16} /> Filter</button>
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-black"><ArrowDownUp size={16} /> Sort by</button>
        </div>
        <div className="relative w-full sm:w-64">
          <input type="text" placeholder="Search name..." className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-blue-500" />
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {loading && <p className="text-center text-gray-500 py-10">Loading lawyers...</p>}
      {error && <p className="text-center text-red-500 py-10">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.length > 0 ? lawyers.map(lawyer => (
            <LawyerCard key={lawyer._id} lawyer={lawyer} />
          )) : <p className="col-span-full text-center text-gray-500 py-10">No lawyers available at the moment.</p>}
        </div>
      )}
    </div>
  );
};

export default ConnectWithLawyers;

