import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { updateProfile } from '../redux/slices/userSlice';
import { uploadProfileImage, uploadBannerImage } from '../services/authService';
import EditProfileModal from '../components/EditProfileModel'; 
import { ArrowLeft, Search, Book, Briefcase, Star, MapPin, Users, Heart, BadgeCheck } from 'lucide-react';
import SearchBar from '../components/SearchBar';

interface UserProfile {
 _id: string;
 name: string;
 username: string;
 bio?: string;
 location?: string;
 bannerImageUrl?: string;
 profileImageUrl?: string;
 friends?: string[];
 role?: 'general' | 'lawstudent' | 'lawyer';
 roleData?: any;
}

// --- Helper Component for Success/Error Messages ---
const InfoModal = ({ message, onClose }: { message: {type: 'success' | 'error', text: string} | null, onClose: () => void }) => {
    if (!message) return null;
    const isError = message.type === 'error';
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[200]">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center w-80">
                <h3 className={`text-xl font-bold mb-4 ${isError ? 'text-red-600' : 'text-green-600'}`}>
                    {isError ? 'Error' : 'Success'}
                </h3>
                <p className="text-gray-700">{message.text}</p>
                <button onClick={onClose} className="mt-6 px-6 py-2 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors">
                    OK
                </button>
            </div>
        </div>
    );
};


interface ProfileHeaderProps {
 name: string;
 onSearchClick: () => void;
}
const ProfileHeader = ({ name, onSearchClick }: ProfileHeaderProps) => {
 return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <button 
        onClick={() => window.history.back()}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <ArrowLeft size={20} />
      </button>
      
      <div className="text-center">
        <h2 className="font-bold text-lg leading-tight">{name}</h2>
      </div>

      <button onClick={onSearchClick} className="p-2 rounded-full hover:bg-gray-100">
        <Search size={20} />
      </button>
    </header>
 );
};

interface ProfileBodyProps {
 user: UserProfile;
 onEditClick: () => void;
}
const ProfileBody = ({ user, onEditClick }: ProfileBodyProps) => {
 const bannerImg = user.bannerImageUrl || 'https://placehold.co/600x200/e2e8f0/475569?text=Banner';
 const profileImg = user.profileImageUrl || 'https://placehold.co/150x150/e2e8f0/475569?text=Avatar';

 return (
    <div className="bg-white text-zinc-900 font-sans">
      {/* Top Section */}
      <div className="relative">
        <img src={bannerImg} alt="Banner" className="w-full h-40 sm:h-52 object-cover bg-gray-200" />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
             <button
                onClick={onEditClick}
                className="bg-black/50 text-white border border-white/50 rounded-full py-2 px-4 font-bold text-sm cursor-pointer hover:bg-black/80 transition-colors"
              >
                Edit profile
            </button>
        </div>
        <div className="absolute -bottom-16 left-4">
             <img
               src={profileImg}
               alt="Profile"
               className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-300"
             />
        </div>
      </div>

      <div className="p-4 pt-14"> 
        <div className="mb-4">
          <h2 className="text-2xl font-bold leading-tight">{user.name}</h2>
          <p className="text-zinc-500">@{user.username}</p>
        </div>
        
        {user.bio && <p className="my-3 whitespace-pre-wrap text-gray-800">{user.bio}</p>}
        
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-600">
            {user.location && (
                <div className="flex items-center">
                    <MapPin size={14} className="mr-2 flex-shrink-0" />
                    <span>{user.location}</span>
                </div>
            )}
            
            <Link to="/dashboard1/connections" className="flex items-center hover:underline">
                <Users size={14} className="mr-2 flex-shrink-0" />
                <span className="font-bold text-black mr-1">{user.friends?.length || 0}</span> Connections
            </Link>

            {user.role === 'lawstudent' && user.roleData && (
                <>
                    {user.roleData.collegeName && <div className="flex items-center"><Book size={14} className="mr-2 flex-shrink-0"/><span>{user.roleData.collegeName}</span></div>}
                    {user.roleData.areaOfInterest && user.roleData.areaOfInterest.length > 0 && <div className="flex items-start sm:col-span-2"><Star size={14} className="mr-2 mt-1 flex-shrink-0"/><span>Interest: {Array.isArray(user.roleData.areaOfInterest) ? user.roleData.areaOfInterest.join(', ') : user.roleData.areaOfInterest}</span></div>}
                </>
            )}

            {user.role === 'lawyer' && user.roleData && (
                 <>
                    {user.roleData.experience > 0 && <div className="flex items-center"><Briefcase size={14} className="mr-2 flex-shrink-0"/><span>{user.roleData.experience} years experience</span></div>}
                    {user.roleData.licenseNumber && <div className="flex items-center"><BadgeCheck size={14} className="mr-2 flex-shrink-0 text-blue-600"/><span>License: {user.roleData.licenseNumber}</span></div>}
                    {user.roleData.specialization?.length > 0 && <div className="flex items-start sm:col-span-2"><Star size={14} className="mr-2 mt-1 flex-shrink-0"/><span>Specializes in: {user.roleData.specialization.join(', ')}</span></div>}
                </>
            )}

            {user.role === 'general' && user.roleData && user.roleData.interests?.length > 0 && (
                 <div className="flex items-start sm:col-span-2">
                    <Heart size={14} className="mr-2 mt-1 flex-shrink-0 text-red-500"/>
                    <span>Interests: {user.roleData.interests.join(', ')}</span>
                 </div>
            )}
        </div>
      </div>
    </div>
 );
};


const ProfilePage = () => {
 const dispatch = useAppDispatch();
 const { user, status, error } = useAppSelector((state) => state.user);
 
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isSaving, setIsSaving] = useState(false);
 const [isSearchOpen, setIsSearchOpen] = useState(false);
 const [infoMessage, setInfoMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

 const handleSaveProfile = async (payload: {
    commonData: any;
    roleSpecificData: any;
    profileImageFile?: File;
    bannerImageFile?: File;
 }) => {
    if (!user) return; 

    setIsSaving(true);
    try {
      let finalCommonData = { ...payload.commonData };

      if (payload.profileImageFile) {
        const res = await uploadProfileImage(payload.profileImageFile);
        finalCommonData.profileImageUrl = res.imageUrl; 
      }
      if (payload.bannerImageFile) {
        const res = await uploadBannerImage(payload.bannerImageFile);
        finalCommonData.bannerImageUrl = res.imageUrl;
      }

      const finalPayload = {
        commonData: finalCommonData,
        roleSpecificData: payload.roleSpecificData,
      };
      
      console.log('Final payload being sent:', finalPayload);
      
      const result = await dispatch(updateProfile(finalPayload)).unwrap();
      console.log('Profile update result:', result);
      
      setIsModalOpen(false);
      setInfoMessage({type: 'success', text: 'Profile updated successfully!'});

    } catch (err: any) {
      console.error("Failed to update profile:", err);
      console.error("Error details:", err.message || err);
      setIsModalOpen(false);
      const errorMessage = err.message || err.toString() || 'Profile update failed! Please try again.';
      setInfoMessage({type: 'error', text: errorMessage});
    } finally {
      setIsSaving(false);
    }
 };

 if (status === 'loading' && !user) {
    return <div>Loading profile...</div>;
 }
 if (status === 'failed' && !user) {
    return <div>Error loading profile: {error}</div>;
 }
 if (!user) {
    return <div>No user found. Please try logging in again.</div>;
 }

 return (
    <div>
      <ProfileHeader name={user.name} onSearchClick={() => setIsSearchOpen(true)} />
      <ProfileBody user={user} onEditClick={() => setIsModalOpen(true)} />
      
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        currentUser={user}
        onSave={handleSaveProfile}
      />
      
      <SearchBar 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <InfoModal message={infoMessage} onClose={() => setInfoMessage(null)} />
    </div>
 );
};

export default ProfilePage;
