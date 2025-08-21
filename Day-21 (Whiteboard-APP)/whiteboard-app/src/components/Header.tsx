import React from 'react';

interface HeaderProps {
  fileName: string;
  onSave: () => void;
  isSaving: boolean;
}

const Header: React.FC<HeaderProps> = ({ fileName, onSave, isSaving }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Canvas App</h1>
          <span className="text-gray-500">|</span>
          <span className="text-lg text-gray-700">{fileName}</span>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </header>
  );
};

export default Header;
