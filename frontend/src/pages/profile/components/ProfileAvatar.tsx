import { Camera } from 'lucide-react';

interface ProfileAvatarProps {
  profileImageUrl?: string;
  role?: 'general' | 'lawstudent' | 'lawyer';
}

const ProfileAvatar = ({ profileImageUrl, role }: ProfileAvatarProps) => {
  const profileImg = profileImageUrl || 'https://placehold.co/150x150/1e293b/f59e0b?text=Avatar';

  return (
    <div className="absolute -bottom-16 sm:-bottom-20 left-6 sm:left-8">
      <div className="relative group">
        <img
          src={profileImg}
          alt="Profile"
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-white shadow-2xl object-cover bg-slate-200"
        />
        <div className="absolute inset-0 rounded-2xl bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-300 flex items-center justify-center">
          <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={28} />
        </div>
        {role && (
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
            {role === 'lawyer' ? '⚖️ Lawyer' : role === 'lawstudent' ? '📚 Student' : '👤 User'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAvatar;