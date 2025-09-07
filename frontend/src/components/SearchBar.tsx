import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { searchUsers } from '../services/authService';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  _id: string;
  name: string;
  username: string;
  profileImageUrl?: string;
}

const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // khulte hi input field par focus karein
    if (isOpen) {
      inputRef.current?.focus();
    }
    
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchUsers(query);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms ke baad search karein

    return () => clearTimeout(delayDebounceFn); // Cleanup function
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center z-[100] p-4 pt-[10vh]">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center gap-4 p-4 border-b border-gray-200">
          <Search size={20} className="text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent focus:outline-none text-lg"
          />
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && <p className="p-4 text-center text-gray-500">Searching...</p>}
          
          {!loading && results.length > 0 && (
            results.map((user) => (
              <Link
                to={`/dashboard1/profile/${user.username}`}
                key={user._id}
                onClick={onClose} // Result par click karne par modal band kar dein
                className="flex items-center p-4 hover:bg-gray-50 transition-colors"
              >
                <img 
                  src={user.profileImageUrl || 'https://placehold.co/150x150/a7a7a7/ffffff?text=Avatar'}
                  alt={user.name}
                  className="w-10 h-10 rounded-full mr-4 bg-gray-300"
                />
                <div>
                  <p className="font-bold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </Link>
            ))
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="p-4 text-center text-gray-500">No users found for "{query}"</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
