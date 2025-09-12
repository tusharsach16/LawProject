import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

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

  const handleCallClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      alert(`Connecting you with ${lawyer.name}...`);
    } else {
      alert('Please sign in to connect with a lawyer.');
      navigate('/signin');
    }
  };

  return (
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
  );
};

export default LawyerCard;
