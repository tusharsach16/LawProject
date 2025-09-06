import  { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModel'; 
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateProfile } from '../redux/slices/userSlice';
import { uploadProfileImage, uploadBannerImage } from '../services/authService'; 
import { Link } from 'react-router-dom'; 
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
}

interface ProfileHeaderProps {
 name: string;
}
const ProfileHeader = ({ name }: ProfileHeaderProps) => {
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

      <button className="p-2 rounded-full hover:bg-gray-100">
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
 const bannerImg = user.bannerImageUrl || 'https://placehold.co/600x200/a7a7a7/ffffff?text=Banner';
 const profileImg = user.profileImageUrl || 'https://placehold.co/150x150/a7a7a7/ffffff?text=Avatar';

 return (
    <div className="bg-white text-zinc-900 font-sans">
      <div className="relative">
        <img src={bannerImg} alt="Banner" className="w-full h-52 object-cover bg-gray-200" />
        <img
          src={profileImg}
          alt="Profile"
          className="w-[135px] h-[135px] rounded-full border-4 border-white absolute -bottom-[60px] left-4 bg-gray-300"
        />
        <button 
          onClick={onEditClick} 
          className="absolute top-3 right-3 bg-white text-zinc-900 border border-zinc-300 rounded-full py-2 px-4 font-bold cursor-pointer hover:bg-zinc-100 transition-colors"
        >
          Edit profile
        </button>
      </div>

      <div className="p-4 pt-20">
        <div className="mb-3">
          <h2 className="text-xl font-bold leading-tight">{user.name}</h2>
          <p className="text-zinc-500">@{user.username}</p>
        </div>
        
        <p className="my-3 whitespace-pre-wrap">{user.bio}</p>
        
        <div className="flex items-center gap-5 text-zinc-500 my-3 text-sm">
          <span>📍 {user.location}</span>
        </div>
        
        <div className="flex items-center gap-5 text-zinc-500 text-sm">
          <Link to="/dashboard1/connections" className="hover:underline cursor-pointer">
            <p>
              <span className="text-zinc-900 font-bold mr-1">
                {user.friends ? user.friends.length : 0}
              </span> 
              Connections
            </p>
          </Link>
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

 const handleSaveProfile = async (formData: {
    name: string;
    bio: string;
    location: string;
    profileImageFile?: File;
    bannerImageFile?: File;
 }) => {
    if (!user) return; 

    setIsSaving(true);
    try {
      let newProfileImageUrl = user.profileImageUrl;
      let newBannerImageUrl = user.bannerImageUrl;

      if (formData.profileImageFile) {
        console.log("Uploading new profile image...");
        const uploadResponse = await uploadProfileImage(formData.profileImageFile);
        newProfileImageUrl = uploadResponse.imageUrl; 
        console.log("New profile image URL:", newProfileImageUrl);
      }
      
      if (formData.bannerImageFile) {
        console.log("Uploading new banner image...");
        const bannerUploadResponse = await uploadBannerImage(formData.bannerImageFile);
        newBannerImageUrl = bannerUploadResponse.imageUrl;
        console.log("New banner image URL:", newBannerImageUrl);
      }

      const commonDataPayload = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        profileImageUrl: newProfileImageUrl,
        bannerImageUrl: newBannerImageUrl,
      };

      const finalPayload = {
        commonData: commonDataPayload,
        roleSpecificData: {},
      };
      
      console.log("Dispatching final profile update to Redux...");
      await dispatch(updateProfile(finalPayload)).unwrap();
      
      alert('Profile updated successfully!');

    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Profile update failed! Please try again.");
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
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
      <ProfileHeader name={user.name} />
      <ProfileBody user={user} onEditClick={() => setIsModalOpen(true)} />
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        currentUser={user}
        onSave={handleSaveProfile}
      />
    </div>
 );
};

export default ProfilePage;

