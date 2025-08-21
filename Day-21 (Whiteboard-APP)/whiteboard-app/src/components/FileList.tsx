import React from 'react';
import type { FILE } from '../types';

interface FileListProps {
  files: FILE[];
  selectedFileId: string;
  onFileSelect: (fileId: string) => void;
  onCreateNew: () => void;
}

const FileList: React.FC<FileListProps> = ({ 
  files, 
  selectedFileId, 
  onFileSelect, 
  onCreateNew 
}) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full">
      <div className="p-4">
        <button
          onClick={onCreateNew}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium mb-4 transition-colors duration-200"
        >
          New Canvas
        </button>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Files</h3>
        <div className="space-y-2">
          {files.map((file) => (
            <button
              key={file._id}
              onClick={() => onFileSelect(file._id)}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                selectedFileId === file._id
                  ? 'bg-blue-100 border-2 border-blue-500 text-blue-900'
                  : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-700'
              }`}
            >
              <div className="font-medium truncate">{file.fileName}</div>
              <div className="text-sm text-gray-500 mt-1">
                {new Date(file.createdAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileList;
