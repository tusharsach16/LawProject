import { ProfileBanner } from './ProfileBanner';
import ProfileAvatar from './ProfileAvatar';
import ProfileInfo from './ProfileInfo';
import ProfileDetails from './ProfileDetails';
import type { ProfileBodyProps } from '../types/profile.types';

const ProfileBody = ({ user, onEditClick }: ProfileBodyProps) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans min-h-screen">
      <div className="relative">
        <ProfileBanner 
          bannerImageUrl={user.bannerImageUrl}  
          onEditClick={onEditClick}
        />
        <ProfileAvatar 
          profileImageUrl={user.profileImageUrl}
          role={user.role}
        />
      </div>

      <div className="px-6 sm:px-8 pt-20 sm:pt-24 pb-8">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-6 sm:p-8">
          <ProfileInfo 
            name={user.name}
            username={user.username}
            bio={user.bio}
          />
          <ProfileDetails user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfileBody;