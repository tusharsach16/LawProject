import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const compressImage = (file: File, _maxSizeMB: number = 2): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                const maxDimension = 1500;
                if (width > height && width > maxDimension) {
                    height = (height / width) * maxDimension;
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = (width / height) * maxDimension;
                    height = maxDimension;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob conversion failed'));
                            return;
                        }

                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });

                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    0.85
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};

export const uploadProfileImage = async (imageFile: File) => {
    try {
        const compressedFile = await compressImage(imageFile, 2);
        const formData = new FormData();
        formData.append('profileImage', compressedFile);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await axios.post(
            `${API}/api/upload/profile-image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
                timeout: 30000,
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.msg || 'Failed to upload profile image');
        }
        throw error;
    }
};

export const uploadBannerImage = async (imageFile: File) => {
    try {
        const compressedFile = await compressImage(imageFile, 3);
        const formData = new FormData();
        formData.append('bannerImage', compressedFile);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await axios.post(
            `${API}/api/upload/banner-image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
                timeout: 30000,
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.msg || 'Failed to upload banner image');
        }
        throw error;
    }
};
