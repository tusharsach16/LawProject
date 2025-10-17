import ImageCropper from './ImageCropper';
import ModalHeader from './editprofile/components/ModalHeader';
import BannerSection from './editprofile/components/BannerSection';
import ProfilePictureSection from './editprofile/components/ProfilePictureSection';
import BasicInfoSection from './editprofile/components/BasicInfoSection';
import LawStudentSection from './editprofile/components/LawStudentSection';
import LawyerSection from './editprofile/components/LawyerSection';
import GeneralUserSection from './editprofile/components/GeneralUserSection';
import { useEditProfileForm } from './editprofile/hooks/useEditProfileForm';
import type { EditProfileModalProps } from './editprofile/types/useEditProfileForm';

const EditProfileModal = ({ isOpen, onClose, currentUser, onSave }: EditProfileModalProps) => {
  const {
    formData,
    imageState,
    allSpecializations,
    updateFormField,
    handleMultiSelectToggle,
    handleImageSelect,
    handleCropComplete,
    buildSavePayload,
    setImageState
  } = useEditProfileForm(currentUser, isOpen);

  const handleSave = () => {
    const payload = buildSavePayload(currentUser.role);
    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-start z-[100] p-4 pt-[5vh] animate-fade-in overflow-y-auto">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border-2 border-slate-200 animate-slide-up">
          <ModalHeader onClose={onClose} onSave={handleSave} />

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <BannerSection 
              bannerImagePreview={imageState.bannerImagePreview}
              onImageSelect={(e) => handleImageSelect(e, 'banner')}
            />

            <ProfilePictureSection 
              profileImagePreview={imageState.profileImagePreview}
              onImageSelect={(e) => handleImageSelect(e, 'profile')}
            />
            
            <div className="p-6 space-y-5 mt-4">
              <BasicInfoSection
                name={formData.name}
                bio={formData.bio}
                location={formData.location}
                onNameChange={(value) => updateFormField('name', value)}
                onBioChange={(value) => updateFormField('bio', value)}
                onLocationChange={(value) => updateFormField('location', value)}
              />
              
              {currentUser.role === 'lawstudent' && (
                <LawStudentSection
                  collegeName={formData.collegeName}
                  year={formData.year}
                  enrollmentNumber={formData.enrollmentNumber}
                  areaOfInterest={formData.areaOfInterest}
                  allSpecializations={allSpecializations}
                  onCollegeNameChange={(value) => updateFormField('collegeName', value)}
                  onYearChange={(value) => updateFormField('year', value)}
                  onEnrollmentNumberChange={(value) => updateFormField('enrollmentNumber', value)}
                  onAreaOfInterestToggle={(spec) => handleMultiSelectToggle(spec, 'areaOfInterest')}
                />
              )}

              {currentUser.role === 'lawyer' && (
                <LawyerSection
                  experience={formData.experience}
                  licenseNumber={formData.licenseNumber}
                  specialization={formData.specialization}
                  allSpecializations={allSpecializations}
                  onExperienceChange={(value) => updateFormField('experience', value)}
                  onLicenseNumberChange={(value) => updateFormField('licenseNumber', value)}
                  onSpecializationToggle={(spec) => handleMultiSelectToggle(spec, 'specialization')}
                />
              )}

              {currentUser.role === 'general' && (
                <GeneralUserSection
                  interests={formData.interests}
                  allSpecializations={allSpecializations}
                  onInterestToggle={(spec) => handleMultiSelectToggle(spec, 'interests')}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {imageState.croppingImage && (
        <ImageCropper
          imageSrc={imageState.croppingImage.src}
          aspect={imageState.croppingImage.type === 'profile' ? 1 : 3}
          onClose={() => setImageState(prev => ({ ...prev, croppingImage: null }))}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};

export default EditProfileModal;
