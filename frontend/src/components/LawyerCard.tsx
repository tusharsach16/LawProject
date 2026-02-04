import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import AppointmentModal from './AppointmentModal';

interface LawyerProfile {
  _id: string;
  name: string;
  profileImageUrl?: string;
  experience: number;
  specialization: string[];
  ratings: number;
  price: number;
}

const LawyerCard = ({ lawyer }: { lawyer: LawyerProfile }) => {
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleCallClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsBookingModalOpen(true);
    } else {
      alert('Please sign in to connect with a lawyer.');
      navigate('/signin');
    }
  };

  const consultationDurationMinutes = 30;
  const totalConsultationPrice = lawyer.price * consultationDurationMinutes;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start gap-4">
          <img
            src={
              lawyer.profileImageUrl ||
              `https://placehold.co/150x150/e2e8f0/475569?text=${lawyer.name.charAt(0)}`
            }
            alt={lawyer.name}
            className="w-16 h-16 rounded-full object-cover bg-gray-300"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-800 truncate">
              {lawyer.name}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2">
              {lawyer.specialization.join(', ')}
            </p>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`stroke-1 ${i < Math.round(lawyer.ratings)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-600">
              Exp:{' '}
              <span className="font-semibold text-black">
                {lawyer.experience} Years
              </span>
            </p>
            <p className="text-gray-600">
              Fee:
              <span className="font-bold text-green-600 ml-1">
                ₹{totalConsultationPrice} / {consultationDurationMinutes} mins
              </span>
            </p>
          </div>
          <button
            onClick={handleCallClick}
            className="px-6 py-2 font-semibold text-green-600 border-2 border-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-colors duration-300"
          >
            Book Now
          </button>
        </div>
      </div>

      {isBookingModalOpen && (
        <>
          {console.log('Lawyer Id: ', lawyer._id)}
          <AppointmentModal
            lawyerId={lawyer._id}
            lawyerName={lawyer.name}
            pricePerMinute={lawyer.price}
            onClose={() => setIsBookingModalOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default LawyerCard;
