import {useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserCheck, UserMinus, Scale, AlertCircle } from 'lucide-react';
import { getConnections, removeFriend } from '../services/authService';
import UnfollowModal from '../components/UnfollowModal';

interface Connection {
  _id: string;
  name: string;
  username: string;
  profileImageUrl?: string;
  bio?: string;
}

const ConnectionsPage = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(null);
  const [userToUnfollow, setUserToUnfollow] = useState<Connection | null>(null);
  const [isProcessingUnfollow, setIsProcessingUnfollow] = useState(false);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const response = await getConnections();
        if (response && Array.isArray(response.friends)) {
          setConnections(response.friends);
        } else if (Array.isArray(response)) {
          setConnections(response);
        } else {
          setError('Received invalid data from the server.');
        }
      } catch (err) {
        setError('Failed to load connections.');
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);
  
  const handleUnfollowConfirm = async () => {
    if (!userToUnfollow) return;

    setIsProcessingUnfollow(true);
    try {
      await removeFriend(userToUnfollow._id);
      setConnections(prev => prev.filter(c => c._id !== userToUnfollow._id));
    } catch (err) {
      console.error("Failed to unfollow:", err);
      alert("Could not unfollow user. Please try again.");
    } finally {
      setIsProcessingUnfollow(false);
      setUserToUnfollow(null); 
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Scale className="h-16 w-16 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Loading connections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center p-4 bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur-sm border-b-2 border-amber-500/20 shadow-lg">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 rounded-xl hover:bg-slate-700/50 text-slate-300 hover:text-amber-400 transition-all duration-300 group"
          >
            <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="ml-4 flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Users size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">Connections</h2>
              <p className="text-xs text-slate-400">{connections.length} {connections.length === 1 ? 'connection' : 'connections'}</p>
            </div>
          </div>
        </header>

        {/* Connections List */}
        <div className="p-4 sm:p-6">
          {connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md border-2 border-slate-200">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Connections Yet</h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  Start building your legal network by connecting with lawyers and law students.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 max-w-4xl mx-auto">
              {connections.map((conn) => (
                <div 
                  key={conn._id} 
                  className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 hover:border-amber-500/30 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="flex p-5">
                    {/* Profile Picture */}
                    <Link 
                      to={`/dashboard/profile/${conn.username}`} 
                      className="flex-shrink-0 relative group/avatar"
                    >
                      <div className="relative">
                        <img 
                          src={conn.profileImageUrl || 'https://placehold.co/150x150/1e293b/f59e0b?text=Avatar'} 
                          alt={conn.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-200 border-2 border-slate-200 group-hover/avatar:border-amber-500 transition-all duration-300"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-slate-900/0 group-hover/avatar:bg-slate-900/20 transition-all duration-300"></div>
                      </div>
                    </Link>

                    {/* Connection Info */}
                    <div className="flex-1 min-w-0 ml-4">
                      <div className="flex justify-between items-start gap-3">
                        <Link 
                          to={`/dashboard/profile/${conn.username}`} 
                          className="flex-1 min-w-0"
                        >
                          <p className="font-bold text-lg text-slate-900 truncate hover:text-amber-600 transition-colors">
                            {conn.name}
                          </p>
                          <p className="text-sm text-slate-500 truncate">@{conn.username}</p>
                        </Link>

                        {/* Following/Unfollow Button */}
                        <button 
                          onMouseEnter={() => setHoveredConnectionId(conn._id)}
                          onMouseLeave={() => setHoveredConnectionId(null)}
                          onClick={() => setUserToUnfollow(conn)}
                          className={`px-5 py-2 font-semibold text-sm rounded-xl flex-shrink-0 transition-all duration-300 flex items-center gap-2 border-2 ${
                            hoveredConnectionId === conn._id
                              ? 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100 scale-105'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-600 hover:shadow-lg hover:scale-105'
                          }`}
                        >
                          {hoveredConnectionId === conn._id ? (
                            <>
                              <UserMinus size={16} />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserCheck size={16} />
                              Following
                            </>
                          )}
                        </button>
                      </div>

                      {/* Bio */}
                      {conn.bio && (
                        <p className="mt-3 text-sm text-slate-700 leading-relaxed line-clamp-2">
                          {conn.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Decorative bottom border on hover */}
                  <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Unfollow Modal */}
      {userToUnfollow && (
        <UnfollowModal
          username={userToUnfollow.username}
          onConfirm={handleUnfollowConfirm}
          onCancel={() => setUserToUnfollow(null)}
          isProcessing={isProcessingUnfollow}
        />
      )}
    </>
  );
};

export default ConnectionsPage;