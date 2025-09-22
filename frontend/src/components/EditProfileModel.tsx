import React, { useState, useEffect } from 'react';
import { Camera, X, CheckSquare, Square } from 'lucide-react';
import ImageCropper from './ImageCropper';
import { getSpecializations } from '../services/authService';

interface CurrentUserProfile {
  name: string;
  bio?: string;
  location?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  role: 'general' | 'lawstudent' | 'lawyer';
  roleData: any;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUserProfile;
  onSave: (payload: { commonData: any; roleSpecificData: any; profileImageFile?: File; bannerImageFile?: File; }) => void;
}

const EditProfileModal = ({ isOpen, onClose, currentUser, onSave }: EditProfileModalProps) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  
  const [collegeName, setCollegeName] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [experience, setExperience] = useState<number | ''>('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [areaOfInterest, setAreaOfInterest] = useState<string[]>([]);
  const [specialization, setSpecialization] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  
  const [allSpecializations, setAllSpecializations] = useState<string[]>([]);

  const [profileImageFile, setProfileImageFile] = useState<File>();
  const [bannerImageFile, setBannerImageFile] = useState<File>();
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<{ src: string, type: 'profile' | 'banner' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchSpecializations = async () => {
        try {
          const data = await getSpecializations();
          console.log('Received specializations from API:', data);
          setAllSpecializations(data);
        } catch (err) {
          console.error("Failed to load specializations:", err);
        }
      };
      fetchSpecializations();
    }
  }, [isOpen]);

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
        setAreaOfInterest(Array.isArray(currentUser.roleData.areaOfInterest) ? currentUser.roleData.areaOfInterest : []);
      } else if (currentUser.role === 'lawyer' && currentUser.roleData) {
        setExperience(currentUser.roleData.experience || '');
        setLicenseNumber(currentUser.roleData.licenseNumber || '');
        setSpecialization(Array.isArray(currentUser.roleData.specialization) ? currentUser.roleData.specialization : []);
      } else if (currentUser.role === 'general' && currentUser.roleData) {
        setInterests(Array.isArray(currentUser.roleData.interests) ? currentUser.roleData.interests : []);
      }
    }
  }, [currentUser, isOpen]);

  const handleMultiSelectChange = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

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
      // Ensure areaOfInterest is always an array
      const validAreaOfInterest = Array.isArray(areaOfInterest) ? areaOfInterest : [];
      roleSpecificData = { collegeName, year, enrollmentNumber, areaOfInterest: validAreaOfInterest };
    } else if (currentUser.role === 'lawyer') {
      // Ensure specialization is always an array
      const validSpecialization = Array.isArray(specialization) ? specialization : [];
      console.log('Lawyer specialization data:', {
        rawSpecialization: specialization,
        validSpecialization: validSpecialization,
        allSpecializations: allSpecializations
      });
      roleSpecificData = { experience, specialization: validSpecialization, licenseNumber };
    } else if (currentUser.role === 'general') {
      // Ensure interests is always an array
      const validInterests = Array.isArray(interests) ? interests : [];
      roleSpecificData = { interests: validInterests };
    }

    console.log('Saving profile with data:', { commonData, roleSpecificData });

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
                  <div>
                    <label className="font-medium text-sm text-gray-700">Areas of Interest</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {allSpecializations.map(spec => (
                            <button key={spec} type="button" onClick={() => handleMultiSelectChange(spec, areaOfInterest, setAreaOfInterest)} className="flex items-center gap-2 text-sm text-gray-800 p-1">
                                {areaOfInterest.includes(spec) ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16} className="text-gray-400"/>}
                                {spec}
                            </button>
                        ))}
                    </div>
                  </div>
                </>
              )}
              {currentUser.role === 'lawyer' && (
                <>
                  <hr/>
                  <h3 className="font-semibold text-gray-600">Professional Details</h3>
                  <input type="number" placeholder="Years of Experience" value={experience} onChange={(e) => setExperience(Number(e.target.value))} className="w-full p-3 border rounded-md focus:outline-blue-500" />
                  <input type="text" placeholder="Bar Council License Number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="w-full p-3 border rounded-md focus:outline-blue-500" />
                  <div>
                    <label className="font-medium text-sm text-gray-700">Specializations</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {allSpecializations.map(spec => (
                            <button key={spec} type="button" onClick={() => handleMultiSelectChange(spec, specialization, setSpecialization)} className="flex items-center gap-2 text-sm text-gray-800 p-1">
                                {specialization.includes(spec) ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16} className="text-gray-400"/>}
                                {spec}
                            </button>
                        ))}
                    </div>
                  </div>
                </>
              )}
               {currentUser.role === 'general' && (
                <>
                  <hr/>
                  <h3 className="font-semibold text-gray-600">Your Interests</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {allSpecializations.map(spec => (
                        <button key={spec} type="button" onClick={() => handleMultiSelectChange(spec, interests, setInterests)} className="flex items-center gap-2 text-sm text-gray-800 p-1">
                            {interests.includes(spec) ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16} className="text-gray-400"/>}
                            {spec}
                        </button>
                    ))}
                  </div>
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

