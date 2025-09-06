import {useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getConnections } from '../services/authService';

// Ek single connection kaisa dikhega, uske liye type
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
           console.error("Data from server is not in the expected format:", response);
           setError('Received invalid data from the server.');
        }

      } catch (err) {
        setError('Failed to load connections.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center p-6">
            <p className="text-gray-500">Loading connections...</p>
        </div>
    );
  }

  if (error) {
    return <div className="flex h-full items-center justify-center p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full min-h-full">
      <header className="sticky top-0 z-10 flex items-center p-3 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="ml-4">
          <h2 className="font-bold text-lg">Connections</h2>
        </div>
      </header>

      <div>
        {connections.length === 0 ? (
          <p className="p-6 text-center text-gray-500">You don't have any connections yet.</p>
        ) : (
          connections.map((conn) => (
            <Link 
              to={`/dashboard1/profile/${conn.username}`} 
              key={conn._id} 
              className="flex p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <img 
                src={conn.profileImageUrl || 'https://placehold.co/150x150/a7a7a7/ffffff?text=Avatar'} 
                alt={conn.name}
                className="w-12 h-12 rounded-full mr-4 bg-gray-300 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <div className="truncate">
                    <p className="font-bold text-gray-900 truncate hover:underline">{conn.name}</p>
                    <p className="text-sm text-gray-500 truncate">@{conn.username}</p>
                  </div>
                  <button className="px-4 py-1.5 font-semibold text-sm bg-black text-white rounded-full ml-2 flex-shrink-0">
                    Following
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-800 break-words">{conn.bio}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage;

