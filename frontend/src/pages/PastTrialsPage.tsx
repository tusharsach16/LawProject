import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPastMockTrials } from '../services/authService';
import { useAppSelector } from '../redux/hooks'; 

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
        console.log('Fetched trials data:', data); // Debug log
        setTrials(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        console.error('Error in fetchTrials:', err); // Debug log
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
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  
  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Past Mock Trials</h1>
      
      {trials.length === 0 ? (
        <p className="text-center text-gray-500 mt-12">You haven't completed any mock trials yet.</p>
      ) : (
        <div className="space-y-4">
          {trials.map((trial) => {
            const isWinner = trial.winnerId === user?._id;
            const resultText = isWinner ? "Victory" : "Defeat";
            const resultColor = isWinner ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

            return (
              <div key={trial._id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center transition hover:shadow-lg">
                <div>
                  <p className="text-lg font-semibold text-gray-700">{trial.situationId?.title}</p>
                  <p className="text-sm text-gray-500">
                    {trial.plaintiffId?.name} (Plaintiff) vs. {trial.defendantId?.name} (Defendant)
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                   <span className={`px-3 py-1 text-sm font-semibold rounded-full ${resultColor}`}>
                      {resultText}
                   </span>
                   <Link 
                     to={`/dashboard/trial-result/${trial._id}`}
                     className="bg-gray-800 hover:bg-black text-white font-bold py-2 px-4 rounded transition duration-300"
                   >
                     View Details
                   </Link>
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

 