export interface CurrentUserProfile {
  name: string;
  bio?: string;
  location?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  role: 'general' | 'lawstudent' | 'lawyer';
  roleData: any;
}

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUserProfile;
  onSave: (payload: {
    commonData: any;
    roleSpecificData: any;
    profileImageFile?: File;
    bannerImageFile?: File;
  }) => void;
}

export interface FormData {
  name: string;
  bio: string;
  location: string;
  collegeName: string;
  year: number | '';
  enrollmentNumber: string;
  experience: number | '';
  licenseNumber: string;
  areaOfInterest: string[];
  specialization: string[];
  interests: string[];
  price: number | '';
}

export interface ImageState {
  profileImageFile?: File;
  bannerImageFile?: File;
  profileImagePreview: string | null;
  bannerImagePreview: string | null;
  croppingImage: { src: string; type: 'profile' | 'banner' } | null;
}