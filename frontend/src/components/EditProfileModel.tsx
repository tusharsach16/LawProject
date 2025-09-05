import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import ImageCropper from './ImageCropper'; 

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    bio?: string;
    location?: string;
    profileImageUrl?: string;
    bannerImageUrl?: string;
  };
  onSave: (updatedData: {
    name: string;
    bio: string;
    location: string;
    profileImageFile?: File;
    bannerImageFile?: File;
  }) => void;
}

const EditProfileModal = ({ isOpen, onClose, currentUser, onSave }: EditProfileModalProps) => {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser.name || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(currentUser.profileImageUrl || null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(currentUser.bannerImageUrl || null);
  const [profileImageFile, setProfileImageFile] = useState<File | undefined>();
  const [bannerImageFile, setBannerImageFile] = useState<File | undefined>();

  // State for the cropping modal
  const [croppingImage, setCroppingImage] = useState<{ src: string, type: 'profile' | 'banner' } | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCroppingImage({ src: reader.result as string, type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    if (croppingImage?.type === 'profile') {
      setProfileImageFile(croppedFile);
      setProfileImagePreview(previewUrl);
    } else if (croppingImage?.type === 'banner') {
      setBannerImageFile(croppedFile);
      setBannerImagePreview(previewUrl);
    }
    setCroppingImage(null); // Cropper ko band kar dein
  };

  const handleSave = () => {
    const updatedData = { name, bio, location, profileImageFile, bannerImageFile };
    onSave(updatedData);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div className="bg-zinc-900 rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-800 transition">
                <X size={20} className="text-white" />
              </button>
              <h2 className="text-xl font-bold">Edit profile</h2>
            </div>
            <button onClick={handleSave} className="bg-white text-zinc-900 px-4 py-1.5 rounded-full font-semibold hover:bg-zinc-200 transition">Save</button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="relative h-48 bg-gray-700">
              {bannerImagePreview && <img src={bannerImagePreview} alt="Banner" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <label htmlFor="banner-upload" className="cursor-pointer p-2 rounded-full bg-black/60 hover:bg-black/80 transition">
                  <Camera size={20} className="text-white" />
                  <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'banner')} />
                </label>
              </div>
            </div>
            <div className="relative w-32 h-32 rounded-full border-4 border-zinc-900 bg-gray-700 -mt-16 ml-4 flex items-center justify-center">
              {profileImagePreview && <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover rounded-full" />}
              <label htmlFor="profile-upload" className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition">
                <Camera size={20} className="text-white" />
                <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'profile')} />
              </label>
            </div>

            <div className="p-4 space-y-6">
              <div className="relative">
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 pt-6 bg-transparent border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500 peer" placeholder=" " maxLength={50} />
                <label htmlFor="name" className="absolute left-3 top-3 text-zinc-500 text-sm transform transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-blue-500 peer-focus:text-xs">Name</label>
              </div>
              <div className="relative">
                <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 pt-6 bg-transparent border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500 peer resize-none" placeholder=" " rows={3} maxLength={160} />
                <label htmlFor="bio" className="absolute left-3 top-3 text-zinc-500 text-sm transform transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-blue-500 peer-focus:text-xs">Bio</label>
              </div>
              <div className="relative">
                <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 pt-6 bg-transparent border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500 peer" placeholder=" " maxLength={30} />
                <label htmlFor="location" className="absolute left-3 top-3 text-zinc-500 text-sm transform transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-blue-500 peer-focus:text-xs">Location</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jab user image select karega to yeh cropper modal dikhega */}
      {croppingImage && (
        <ImageCropper
          imageSrc={croppingImage.src}
          aspect={croppingImage.type === 'profile' ? 1 : 3} // Profile ke liye 1:1, banner ke liye 3:1
          onClose={() => setCroppingImage(null)}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};

export default EditProfileModal;
