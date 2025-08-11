
// components/ImageUpload.tsx
import React from 'react';
import type { ImageData, LoadingState } from '../types';

interface ImageUploadProps {
  image: ImageData | null;
  loadingState: LoadingState;
  error: string | null;
  onImageUpload: (file: File) => void;
  onNewImage: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  image,
  loadingState,
  error,
  onImageUpload,
  onNewImage
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="mb-8">
      {!image ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <div className="space-y-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <label className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {loadingState === 'uploading' ? 'Uploading...' : 'Upload an image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loadingState === 'uploading'}
                  className="sr-only"
                />
                <span className="mt-1 block text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </span>
              </label>
            </div>
          </div>
          {loadingState === 'uploading' && (
            <div className="mt-4">
              <div className="bg-blue-200 rounded-full h-2 w-full">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/2"></div>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">
                <span className="font-semibold">Error:</span> {error}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          <div className="inline-block relative">
            <img
              src={image.url}
              alt="Uploaded image"
              className="max-w-full max-h-96 rounded-lg shadow-lg"
            />
          </div>
          <div className="mt-4">
            <button 
              onClick={onNewImage} 
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Upload New Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
