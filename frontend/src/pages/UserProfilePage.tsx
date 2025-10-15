import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, UserPlus, UserCheck, Clock, Scale, Loader2, AlertCircle } from 'lucide-react';
import { getUserProfile, sendFriendRequest } from '../services/authService'; 

interface UserProfileData {
  _id: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  bannerImageUrl?: string;
  profileImageUrl?: string;
  friends?: string[];
  isFollowing: boolean;
}

const UserProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requestStatus, setRequestStatus] = useState<'idle' | 'pending' | 'sent'>('idle');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setRequestStatus('idle'); 
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
  }, [username]);

  const handleFollow = async () => {
    if (!user) return;

    setIsProcessing(true);
    try {
      await sendFriendRequest(user.username);
      setRequestStatus('sent'); 
      alert("Friend request sent!");
    } catch (err: any) {
      console.error("Failed to send friend request:", err);
      alert(err.response?.data?.msg || "Could not send request.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Scale className="h-16 w-16 text-amber-500 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <p className="text-red-600 text-lg font-medium">{error || 'User not found.'}</p>
        </div>
      </div>
    );
  }
  
  const bannerImg = user.bannerImageUrl || 'https://placehold.co/600x200/1e293b/f59e0b?text=Banner';
  const profileImg = user.profileImageUrl || 'https://placehold.co/150x150/1e293b/f59e0b?text=Avatar';

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-gradient-to-r from-slate-900 to-slate-800 backdrop-blur-sm border-b-2 border-amber-500/20 shadow-lg">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 rounded-xl hover:bg-slate-700/50 text-slate-300 hover:text-amber-400 transition-all duration-300 group"
        >
          <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="ml-4 flex items-center gap-3">
          <Scale size={20} className="text-amber-400" />
          <h2 className="font-bold text-xl text-white">{user.name}</h2>
        </div>
      </header>
      
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
        <div className="relative">
          <div className="relative h-48 sm:h-64 overflow-hidden">
            <img 
              src={bannerImg} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/60"></div>
          </div>
          
          <div className="absolute -bottom-16 sm:-bottom-20 left-6 sm:left-8">
            <div className="relative">
              <img
                src={profileImg}
                alt="Profile"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-white shadow-2xl object-cover bg-slate-200"
              />
            </div>
          </div>

          <div className="absolute top-4 right-4">
            {user.isFollowing ? (
              <button className="px-6 py-2.5 font-bold text-sm rounded-xl bg-white text-slate-900 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 flex items-center gap-2 shadow-lg">
                <UserCheck size={18} className="text-emerald-600" />
                Following
              </button>
            ) : requestStatus === 'sent' ? (
              <button 
                className="px-6 py-2.5 font-bold text-sm rounded-xl bg-amber-100 text-amber-700 border-2 border-amber-300 cursor-not-allowed flex items-center gap-2 shadow-lg" 
                disabled
              >
                <Clock size={18} className="animate-pulse" />
                Pending
              </button>
            ) : (
              <button 
                onClick={handleFollow}
                disabled={isProcessing}
                className="px-6 py-2.5 font-bold text-sm rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-lg group"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="px-6 sm:px-8 pt-20 sm:pt-24 pb-8">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-1">{user.name}</h2>
              <p className="text-slate-500 text-lg">@{user.username}</p>
            </div>
            
            {user.bio && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t-2 border-slate-200">
              {user.location && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{user.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-emerald-600" />
                </div>
                <span className="text-slate-700">
                  <span className="font-bold text-slate-900">{user.friends?.length || 0}</span> Connections
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
