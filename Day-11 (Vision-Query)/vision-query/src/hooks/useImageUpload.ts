
// hooks/useImageUpload.ts
import { useState, useCallback } from 'react';
import type { ImageData, LoadingState } from '@/types/index';

export const useImageUpload = () => {
  const [image, setImage] = useState<ImageData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = useCallback(async (file: File): Promise<void> => {
    setLoadingState('uploading');
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const base64 = await convertToBase64(file);
      const url = URL.createObjectURL(file);

      setImage({
        file,
        url,
        base64
      });

      setLoadingState('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setLoadingState('error');
    }
  }, []);

  const clearImage = useCallback(() => {
    if (image?.url) {
      URL.revokeObjectURL(image.url);
    }
    setImage(null);
    setError(null);
    setLoadingState('idle');
  }, [image]);

  return {
    image,
    loadingState,
    error,
    uploadImage,
    clearImage
  };
};
