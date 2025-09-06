import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getUserProfile } from '../services/authService'; 

// User ke data ke liye type
interface UserProfileData {
  _id: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  bannerImageUrl?: string;
  profileImageUrl?: string;
  friends?: string[];
  isFollowing: boolean; // Backend se aayega
}

const UserProfilePage = () => {
  // URL se username nikalein (e.g., 'vrinda26')
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Agar URL mein username nahi hai, to kuch na karein
    if (!username) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(username);
        setUser(data);
      } catch (err) {
        setError('Failed to load user profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]); // Jab bhi URL ka username badlega, yeh effect dobara chalega

  if (loading) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  if (error || !user) {
    return <div className="p-4 text-center text-red-500">{error || 'User not found.'}</div>;
  }
  
  // Placeholder images agar user ne set na ki ho
  const bannerImg = user.bannerImageUrl || 'https://placehold.co/600x200/a7a7a7/ffffff?text=Banner';
  const profileImg = user.profileImageUrl || 'https://placehold.co/150x150/a7a7a7/ffffff?text=Avatar';

  return (
    <div className="w-full min-h-full bg-white">
      <header className="sticky top-0 z-10 flex items-center p-3 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <div className="ml-4">
          <h2 className="font-bold text-lg">{user.name}</h2>
        </div>
      </header>
      
      <div className="bg-white text-zinc-900 font-sans">
        <div className="relative">
          <img src={bannerImg} alt="Banner" className="w-full h-52 object-cover bg-gray-200" />
          <img
            src={profileImg}
            alt="Profile"
            className="w-[135px] h-[135px] rounded-full border-4 border-white absolute -bottom-[60px] left-4 bg-gray-300"
          />
          <div className="absolute top-3 right-3">
            {/* Yahan par "Follow" / "Following" button aayega */}
            <button className={`px-4 py-1.5 font-semibold text-sm rounded-full ${
                user.isFollowing 
                ? 'bg-white text-black border border-gray-300' 
                : 'bg-black text-white'
            }`}>
              {user.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        <div className="p-4 pt-20">
          <div className="mb-3">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-zinc-500">@{user.username}</p>
          </div>
          <p className="my-3">{user.bio}</p>
          <div className="flex items-center gap-5 text-zinc-500 my-3 text-sm">
            <span>📍 {user.location}</span>
          </div>
          <div className="flex items-center gap-5 text-zinc-500 text-sm">
            <p><span className="text-zinc-900 font-bold mr-1">{user.friends?.length || 0}</span> Connections</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

