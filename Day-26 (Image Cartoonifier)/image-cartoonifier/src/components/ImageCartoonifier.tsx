import React, { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';

interface CartoonifierState {
  selectedImage: File | null;
  originalImageUrl: string | null;
  cartoonImageUrl: string | null;
  isProcessing: boolean;
  error: string | null;
}

const ImageCartoonifier: React.FC = () => {
  const [state, setState] = useState<CartoonifierState>({
    selectedImage: null,
    originalImageUrl: null,
    cartoonImageUrl: null,
    isProcessing: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        selectedImage: file,
        originalImageUrl: imageUrl,
        cartoonImageUrl: null,
        error: null,
      }));
    } else {
      setState(prev => ({
        ...prev,
        error: 'Please select a valid image file',
      }));
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setState(prev => ({
        ...prev,
        selectedImage: file,
        originalImageUrl: imageUrl,
        cartoonImageUrl: null,
        error: null,
      }));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const cartoonifyImage = async () => {
    if (!state.selectedImage) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    const formData = new FormData();
    formData.append('file', state.selectedImage);

    try {
      const response = await fetch('http://localhost:8000/cartoonify-advanced', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const cartoonImageUrl = URL.createObjectURL(blob);

      setState(prev => ({
        ...prev,
        cartoonImageUrl,
        isProcessing: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to process image',
        isProcessing: false,
      }));
    }
  };

  const downloadImage = () => {
    if (state.cartoonImageUrl) {
      const link = document.createElement('a');
      link.href = state.cartoonImageUrl;
      link.download = 'cartoonified-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetUploader = () => {
    setState({
      selectedImage: null,
      originalImageUrl: null,
      cartoonImageUrl: null,
      isProcessing: false,
      error: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎨 Image Cartoonifier
          </h1>
          <p className="text-lg text-gray-600">
            Transform your photos into beautiful cartoon-style images using AI
          </p>
        </div>

        {/* Upload Section */}
        {!state.originalImageUrl && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-xl text-gray-600 mb-2">
                📸 Click here to select an image
              </p>
              <p className="text-sm text-gray-400">
                or drag and drop your image here
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Supports JPG, PNG, GIF formats
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700">{state.error}</p>
            </div>
          </div>
        )}

        {/* Image Processing Section */}
        {state.originalImageUrl && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Original Image */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  📷 Original Image
                </h3>
                <div className="relative">
                  <img
                    src={state.originalImageUrl}
                    alt="Original"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>

              {/* Cartoonified Image */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  ✨ Cartoonified Image
                </h3>
                <div className="relative">
                  {state.isProcessing ? (
                    <div className="w-full h-64 bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">⏳ Processing your image...</p>
                        <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
                      </div>
                    </div>
                  ) : state.cartoonImageUrl ? (
                    <img
                      src={state.cartoonImageUrl}
                      alt="Cartoonified"
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-50 rounded-lg shadow-md flex items-center justify-center border-2 border-dashed border-gray-300">
                      <p className="text-gray-400">🎭 Cartoon version will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-8 justify-center">
              <button
                onClick={cartoonifyImage}
                disabled={!state.selectedImage || state.isProcessing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
              >
                <span>🎨</span>
                <span>{state.isProcessing ? 'Processing...' : 'Cartoonify Image'}</span>
              </button>

              {state.cartoonImageUrl && (
                <button
                  onClick={downloadImage}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
                >
                  <span>📥</span>
                  <span>Download Image</span>
                </button>
              )}

              <button
                onClick={resetUploader}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Upload New Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            ✨ Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-800 mb-2">Fast Processing</h3>
              <p className="text-gray-600 text-sm">
                Advanced AI algorithms process your images in seconds
              </p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold text-gray-800 mb-2">High Quality</h3>
              <p className="text-gray-600 text-sm">
                Professional cartoon effects with preserved image quality
              </p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-800 mb-2">Easy to Use</h3>
              <p className="text-gray-600 text-sm">
                Simple drag & drop interface works on all devices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCartoonifier;
