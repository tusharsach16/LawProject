import React, { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import ImageCropper from './ImageCropper';

// User ke poore profile ka type
interface CurrentUserProfile {
  name: string;
  bio?: string;
  location?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  role: 'general' | 'lawstudent' | 'lawyer';
  roleData: any;
}

// Modal ke props
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUserProfile;
  onSave: (payload: { commonData: any; roleSpecificData: any; profileImageFile?: File; bannerImageFile?: File; }) => void;
}

const EditProfileModal = ({ isOpen, onClose, currentUser, onSave }: EditProfileModalProps) => {
  // Common fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  
  // Role-specific fields
  // Law Student
  const [collegeName, setCollegeName] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [areaOfInterest, setAreaOfInterest] = useState('');
  
  // Lawyer
  const [experience, setExperience] = useState<number | ''>('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState(''); // <-- Added state for license number

  // General User
  const [interests, setInterests] = useState('');


  // Image handling
  const [profileImageFile, setProfileImageFile] = useState<File>();
  const [bannerImageFile, setBannerImageFile] = useState<File>();
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<{ src: string, type: 'profile' | 'banner' } | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setLocation(currentUser.location || '');
      setProfileImagePreview(currentUser.profileImageUrl || null);
      setBannerImagePreview(currentUser.bannerImageUrl || null);

      if (currentUser.role === 'lawstudent' && currentUser.roleData) {
        setCollegeName(currentUser.roleData.collegeName || '');
        setYear(currentUser.roleData.year || '');
        setEnrollmentNumber(currentUser.roleData.enrollmentNumber || '');
        setAreaOfInterest(currentUser.roleData.areaOfInterest || '');
      } else if (currentUser.role === 'lawyer' && currentUser.roleData) {
        setExperience(currentUser.roleData.experience || '');
        setSpecialization((currentUser.roleData.specialization || []).join(', '));
        setLicenseNumber(currentUser.roleData.licenseNumber || ''); // <-- Pre-fill license number
      } else if (currentUser.role === 'general' && currentUser.roleData) {
        // general user ka data pre fill kia h  
        setInterests((currentUser.roleData.interests || []).join(', '));
      }
    }
  }, [currentUser, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setCroppingImage({ src: reader.result as string, type });
      reader.readAsDataURL(e.target.files[0]);
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
    setCroppingImage(null);
  };
  
  const handleSave = () => {
    const commonData = { name, bio, location };
    let roleSpecificData = {};

    if (currentUser.role === 'lawstudent') {
      roleSpecificData = { collegeName, year, enrollmentNumber, areaOfInterest };
    } else if (currentUser.role === 'lawyer') {
      roleSpecificData = { 
        experience, 
        specialization: specialization.split(',').map(s => s.trim()).filter(Boolean),
        licenseNumber 
      };
    } else if (currentUser.role === 'general') {
      // general user ka data save kia 
      roleSpecificData = { interests: interests.split(',').map(s => s.trim()).filter(Boolean) };
    }

    onSave({
      commonData,
      roleSpecificData,
      profileImageFile,
      bannerImageFile
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center z-[100] p-4 pt-[5vh]">
        <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">
          <header className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
              <h2 className="text-xl font-bold">Edit profile</h2>
            </div>
            <button onClick={handleSave} className="px-4 py-1.5 rounded-full font-semibold bg-black text-white hover:bg-gray-800">Save</button>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="relative h-48 bg-gray-200">
              {bannerImagePreview && <img src={bannerImagePreview} alt="Banner" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30"><label htmlFor="banner-upload" className="cursor-pointer p-2 rounded-full bg-black/60 hover:bg-black/80"><Camera size={20} className="text-white" /><input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'banner')} /></label></div>
            </div>
            <div className="relative w-32 h-32 rounded-full border-4 border-white bg-gray-300 -mt-16 ml-4"><img src={profileImagePreview || ''} alt="Profile" className="w-full h-full object-cover rounded-full" /><label htmlFor="profile-upload" className="absolute inset-0 flex items-center justify-center cursor-pointer rounded-full bg-black/30 hover:bg-black/50"><Camera size={20} className="text-white" /><input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'profile')} /></label></div>
            
            <div className="p-4 space-y-4">
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-md focus:outline-blue-500" />
              <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 border rounded-md focus:outline-blue-500" rows={3}></textarea>
              <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 border rounded-md focus:outline-blue-500" />
              
              {currentUser.role === 'lawstudent' && (
                <>
                  <hr/>
                  <h3 className="font-semibold text-gray-600">Student Details</h3>
                  <input type="text" placeholder="College Name" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} className="w-full p-3 border rounded-md focus:outline-blue-500" />
                  <input type="number" placeholder="Year of Study" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full p-3 border rounded-md focus:outline-blue-500" />
                  <input type="text" placeholder="Enrollment Number" value={enrollmentNumber} onChange={(e) => setEnrollmentNumber(e.target.value)} className="w-full p-3 border rounded-md focus:outline-blue-500" />
                  <input type="text" placeholder="Area of Interest" value={areaOfInterest} onChange={(e) => setAreaOfInterest(e.target.value)} className="w-full p-3 border rounded-md focus:outline-blue-500" />
                </>
              )}
              {currentUser.role === 'lawyer' && (
                <>
                  <hr/>
                  <h3 className="font-semibold text-gray-600">Professional Details</h3>
                  <input type="number" placeholder="Years of Experience" value={experience} onChange={(e) => setExperience(Number(e.target.value))} className="w-full p-3 border rounded-md focus:outline-blue-500" />
                  <input type="text" placeholder="Specializations (e.g., Criminal, Civil)" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full p-3 border rounded-md focus:outline-blue-500" />
                  <input 
                    type="text" 
                    placeholder="Bar Council License Number" 
                    value={licenseNumber} 
                    onChange={(e) => setLicenseNumber(e.target.value)} 
                    className="w-full p-3 border rounded-md focus:outline-blue-500" 
                  />
                </>
              )}
               {currentUser.role === 'general' && (
                <>
                  <hr/>
                  <h3 className="font-semibold text-gray-600">Your Interests</h3>
                  <input type="text" placeholder="Interests (e.g., Property, Family Law)" value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full p-3 border rounded-md focus:outline-blue-500" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {croppingImage && (
        <ImageCropper
          imageSrc={croppingImage.src}
          aspect={croppingImage.type === 'profile' ? 1 : 3}
          onClose={() => setCroppingImage(null)}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};

export default EditProfileModal;
