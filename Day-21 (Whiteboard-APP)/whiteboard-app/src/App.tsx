/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import Canvas from './components/Canvas';
import Header from './components/Header';
import FileList from './components/FileList';
import type { FILE } from './types';

// Sample data for demonstration
const sampleFiles: FILE[] = [
  {
    _id: '1',
    fileName: 'Design Mockup',
    whiteboard: '[]',
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
    archived: false,
  },
];

function App() {
  const [files, setFiles] = useState<FILE[]>(sampleFiles);
  const [selectedFileId, setSelectedFileId] = useState<string>(sampleFiles[0]._id);
  const [saveTrigger, setSaveTrigger] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const selectedFile = files.find(file => file._id === selectedFileId);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    setSaveTrigger(prev => !prev);
    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  }, []);

  const handleFileSelect = useCallback((fileId: string) => {
    setSelectedFileId(fileId);
  }, []);

  const handleCreateNew = useCallback(() => {
    const newFile: FILE = {
      _id: Date.now().toString(),
      fileName: `New Canvas ${files.length + 1}`,
      whiteboard: '[]',
      createdBy: 'user1',
      createdAt: new Date().toISOString(),
      archived: false,
    };
    setFiles(prev => [...prev, newFile]);
    setSelectedFileId(newFile._id);
  }, [files.length]);

  const handleCanvasSave = useCallback((data: any) => {
    setFiles(prev => prev.map(file => 
      file._id === data._id 
        ? { ...file, whiteboard: data.whiteboard }
        : file
    ));
  }, []);

  if (!selectedFile) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header 
        fileName={selectedFile.fileName}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <div className="flex flex-1 overflow-hidden">
        <FileList
          files={files}
          selectedFileId={selectedFileId}
          onFileSelect={handleFileSelect}
          onCreateNew={handleCreateNew}
        />
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm h-full p-4">
            <Canvas
              onSaveTrigger={saveTrigger}
              fileId={selectedFileId}
              fileData={selectedFile}
              onSave={handleCanvasSave}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
