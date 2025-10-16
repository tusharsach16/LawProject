import { useState } from 'react';
import { useAppDispatch } from '../../../redux/hooks';
import { updateProfile } from '../../../redux/slices/userSlice';
import { uploadProfileImage, uploadBannerImage } from '../../../services/authService';
import type { ProfileUpdatePayload } from '../types/profile.types';

export const useProfileUpdate = () => {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSaveProfile = async (payload: ProfileUpdatePayload) => {
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
      
      setInfoMessage({type: 'success', text: 'Profile updated successfully!'});
      return true;

    } catch (err: any) {
      console.error("Failed to update profile:", err);
      console.error("Error details:", err.message || err);
      const errorMessage = err.message || err.toString() || 'Profile update failed! Please try again.';
      setInfoMessage({type: 'error', text: errorMessage});
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    infoMessage,
    setInfoMessage,
    handleSaveProfile
  };
};