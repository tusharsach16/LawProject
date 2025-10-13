import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Scale, Users, Loader2 } from 'lucide-react';
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
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-start z-[100] p-4 pt-[10vh] animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border-2 border-slate-200 animate-slide-down overflow-hidden">
        {/* Search Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-95"></div>
          <div className="relative flex items-center gap-4 p-5 border-b-2 border-amber-500/20">
            <div className="p-2.5 bg-amber-500/20 rounded-xl">
              <Search size={22} className="text-amber-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users by name or username..."
              className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none text-lg font-medium"
            />
            <button 
              onClick={onClose} 
              className="p-2.5 rounded-xl hover:bg-slate-700/50 text-slate-300 hover:text-amber-400 transition-all duration-300 group"
            >
              <X size={22} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <Scale className="h-16 w-16 text-amber-500 animate-pulse" />
                <Loader2 className="h-8 w-8 text-amber-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-slate-600 font-medium">Searching legal network...</p>
            </div>
          )}
          
          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="p-4 space-y-3">
              {results.map((user, index) => (
                <Link
                  to={`/dashboard/profile/${user.username}`}
                  key={user._id}
                  onClick={onClose}
                  className="flex items-center p-4 bg-white rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 border-2 border-slate-200 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300 group"
                  style={{
                    animation: `slideInResult 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  {/* Profile Picture */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={user.profileImageUrl || 'https://placehold.co/150x150/1e293b/f59e0b?text=User'}
                      alt={user.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-200 border-2 border-slate-200 group-hover:border-amber-500 transition-all duration-300"
                    />
                    <div className="absolute inset-0 rounded-xl bg-slate-900/0 group-hover:bg-slate-900/10 transition-all duration-300"></div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 ml-4 min-w-0">
                    <p className="font-bold text-lg text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-sm text-slate-500 truncate">@{user.username}</p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-amber-500 flex items-center justify-center transition-all duration-300">
                      <svg 
                        className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No Results State */}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mb-6">
                <Users className="h-12 w-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Users Found</h3>
              <p className="text-slate-600 text-center max-w-sm">
                No users found for "<span className="font-semibold text-slate-900">{query}</span>". Try a different search term.
              </p>
            </div>
          )}

          {/* Empty State (Initial) */}
          {!loading && query.length < 2 && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Search className="h-12 w-12 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Search Legal Network</h3>
              <p className="text-slate-600 text-center max-w-sm">
                Enter at least 2 characters to search for lawyers, law students, and legal professionals.
              </p>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        {query.length > 0 && query.length < 2 && (
          <div className="px-5 py-3 bg-amber-50 border-t-2 border-amber-200">
            <p className="text-sm text-amber-800 text-center">
              💡 <span className="font-semibold">Tip:</span> Enter at least 2 characters to start searching
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;