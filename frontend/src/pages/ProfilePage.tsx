import { useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import EditProfileModal from '../components/EditProfileModel';
import SearchBar from '../components/SearchBar';
import ProfileHeader from './profile/components/ProfileHeader';
import ProfileBody from './profile/components/ProfileBody';
import InfoModal from './profile/components/InfoModal';
import { useProfileUpdate } from './profile/hooks/useProfileUpdate';
import { Scale } from 'lucide-react';

const ProfilePage = () => {
  const { user, status, error } = useAppSelector((state) => state.user);
  const { isSaving, infoMessage, setInfoMessage, handleSaveProfile } = useProfileUpdate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const onSaveProfile = async (payload: any) => {
    if (!user) return;
    const success = await handleSaveProfile(payload);
    if (success) {
      setIsModalOpen(false);
    }
  };

  if (status === 'loading' && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Scale className="h-16 w-16 text-amber-500 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed' && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
            <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-slate-600 text-lg font-medium">Error loading profile: {error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Scale className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg font-medium">No user found. Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <ProfileHeader name={user.name} onSearchClick={() => setIsSearchOpen(true)} />
      <ProfileBody user={user} onEditClick={() => setIsModalOpen(true)} />
      
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        currentUser={user}
        onSave={onSaveProfile}
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