import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, X, Clock, Sparkles } from 'lucide-react';

// Ek lawyer kaisa dikhega, uske liye type
interface LawyerProfile {
  _id: string;
  name: string;
  profileImageUrl?: string;
  experience: number;
  specialization: string[];
  ratings: number;
  price: number;
}

// Single Lawyer Card Component
const LawyerCard = ({ lawyer }: { lawyer: LawyerProfile }) => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleCallClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setShowComingSoon(true);
    } else {
      alert('Please sign in to connect with a lawyer.');
      navigate('/signin');
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start gap-4">
          <img
            src={lawyer.profileImageUrl || `https://placehold.co/150x150/e2e8f0/475569?text=${lawyer.name.charAt(0)}`}
            alt={lawyer.name}
            className="w-16 h-16 rounded-full object-cover bg-gray-300"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-800 truncate">{lawyer.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{lawyer.specialization.join(', ')}</p>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={`stroke-1 ${i < Math.round(lawyer.ratings) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-600">Exp: <span className="font-semibold text-black">{lawyer.experience} Years</span></p>
            <p className="text-gray-600">Price: <span className="font-bold text-green-600">₹{lawyer.price}/min</span></p>
          </div>
          <button 
            onClick={handleCallClick}
            className="px-6 py-2 font-semibold text-green-600 border-2 border-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors duration-300"
          >
            Call
          </button>
        </div>
      </div>

      {/* Coming Soon Popup */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scaleIn">
            <button
              onClick={() => setShowComingSoon(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Clock className="h-10 w-10 text-white" />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-3xl font-bold text-slate-900">Coming Soon</h2>
                <Sparkles className="h-6 w-6 text-amber-500" />
              </div>

              <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                This feature will be available soon..!!
              </p>

              <div className="w-full bg-gradient-to-r from-slate-100 to-amber-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-700 font-medium">
                  We're working hard to bring you direct calling with <span className="font-bold text-amber-600">{lawyer.name}</span>
                </p>
              </div>

              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default LawyerCard;