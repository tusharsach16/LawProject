export interface UserProfile {
  _id: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  bannerImageUrl?: string;
  profileImageUrl?: string;
  friends?: string[];
  role?: 'general' | 'lawstudent' | 'lawyer';
  roleData?: any;
}

export interface ProfileHeaderProps {
  name: string;
  onSearchClick: () => void;
}

export interface ProfileBodyProps {
  user: UserProfile;
  onEditClick: () => void;
}

export interface InfoModalProps {
  message: { type: 'success' | 'error'; text: string } | null;
  onClose: () => void;
}

export interface ProfileUpdatePayload {
  commonData: any;
  roleSpecificData: any;
  profileImageFile?: File;
  bannerImageFile?: File;
}