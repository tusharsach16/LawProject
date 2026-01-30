import { useState, useEffect } from 'react';
import type { CurrentUserProfile, FormData, ImageState } from '../types/useEditProfileForm';
import { getSpecializations } from '../../../services/authService';

export const useEditProfileForm = (currentUser: CurrentUserProfile, isOpen: boolean) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    bio: '',
    location: '',
    collegeName: '',
    year: '',
    enrollmentNumber: '',
    experience: '',
    licenseNumber: '',
    areaOfInterest: [],
    specialization: [],
    interests: [],
    price: ''
  });

  const [imageState, setImageState] = useState<ImageState>({
    profileImageFile: undefined,
    bannerImageFile: undefined,
    profileImagePreview: null,
    bannerImagePreview: null,
    croppingImage: null
  });

  const [allSpecializations, setAllSpecializations] = useState<string[]>([]);

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
      setFormData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        collegeName: currentUser.roleData?.collegeName || '',
        year: currentUser.roleData?.year || '',
        enrollmentNumber: currentUser.roleData?.enrollmentNumber || '',
        experience: currentUser.roleData?.experience || '',
        licenseNumber: currentUser.roleData?.licenseNumber || '',
        areaOfInterest: Array.isArray(currentUser.roleData?.areaOfInterest) ? currentUser.roleData.areaOfInterest : [],
        specialization: Array.isArray(currentUser.roleData?.specialization) ? currentUser.roleData.specialization : [],
        interests: Array.isArray(currentUser.roleData?.interests) ? currentUser.roleData.interests : [],
        price: currentUser.roleData?.price || ''
      });

      setImageState(prev => ({
        ...prev,
        profileImagePreview: currentUser.profileImageUrl || null,
        bannerImagePreview: currentUser.bannerImageUrl || null
      }));
    }
  }, [currentUser, isOpen]);

  const updateFormField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectToggle = (item: string, field: 'areaOfInterest' | 'specialization' | 'interests') => {
    setFormData(prev => {
      const currentList = prev[field];
      const newList = currentList.includes(item)
        ? currentList.filter(i => i !== item)
        : [...currentList, item];
      return { ...prev, [field]: newList };
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => setImageState(prev => ({
        ...prev,
        croppingImage: { src: reader.result as string, type }
      }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    if (imageState.croppingImage?.type === 'profile') {
      setImageState(prev => ({
        ...prev,
        profileImageFile: croppedFile,
        profileImagePreview: previewUrl,
        croppingImage: null
      }));
    } else if (imageState.croppingImage?.type === 'banner') {
      setImageState(prev => ({
        ...prev,
        bannerImageFile: croppedFile,
        bannerImagePreview: previewUrl,
        croppingImage: null
      }));
    }
  };

  const buildSavePayload = (role: 'general' | 'lawstudent' | 'lawyer') => {
    const commonData = {
      name: formData.name,
      bio: formData.bio,
      location: formData.location
    };

    let roleSpecificData = {};

    if (role === 'lawstudent') {
      roleSpecificData = {
        collegeName: formData.collegeName,
        year: formData.year,
        enrollmentNumber: formData.enrollmentNumber,
        areaOfInterest: formData.areaOfInterest
      };
    } else if (role === 'lawyer') {
      console.log('Lawyer specialization data:', {
        rawSpecialization: formData.specialization,
        validSpecialization: formData.specialization,
        allSpecializations: allSpecializations
      });
      roleSpecificData = {
        experience: formData.experience,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        price: formData.price
      };
    } else if (role === 'general') {
      roleSpecificData = {
        interests: formData.interests
      };
    }

    console.log('Saving profile with data:', { commonData, roleSpecificData });

    return {
      commonData,
      roleSpecificData,
      profileImageFile: imageState.profileImageFile,
      bannerImageFile: imageState.bannerImageFile
    };
  };

  return {
    formData,
    imageState,
    allSpecializations,
    updateFormField,
    handleMultiSelectToggle,
    handleImageSelect,
    handleCropComplete,
    buildSavePayload,
    setImageState
  };
};