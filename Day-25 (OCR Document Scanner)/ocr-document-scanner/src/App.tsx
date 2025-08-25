/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Upload, FileText, Loader2, Copy, Download, Zap, Eye, Settings, Cpu, Brain } from 'lucide-react';

interface OCRResponse {
  success: boolean;
  extracted_text: string;
  filename: string;
  model_used?: string;
  processing_device?: string;
  trocr_result?: string;
  easyocr_result?: string;
  all_results?: {
    tesseract?: string;
    easyocr?: string;
    trocr?: string;
  };
  quality_scores?: {
    tesseract?: number;
    easyocr?: number;
    trocr?: number;
  };
  best_engine?: string;
  confidence?: number;
  word_count?: number;
  blocks_found?: number;
  preprocessing?: string;
  character_count?: number;
  available_engines?: {
    tesseract?: boolean;
    easyocr?: boolean;
    trocr?: boolean;
  };
}

type OCRType = 'printed' | 'handwritten' | 'easyocr' | 'tesseract' | 'multi-engine';

const App: React.FC = () => {
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [ocrType, setOcrType] = useState<OCRType>('multi-engine');
  const [modelUsed, setModelUsed] = useState<string>('');
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [comparisonResults, setComparisonResults] = useState<{
    trocr: string;
    easyocr: string;
    tesseract: string;
  }>({ trocr: '', easyocr: '', tesseract: '' });
  const [qualityScores, setQualityScores] = useState<{
    tesseract?: number;
    easyocr?: number;
    trocr?: number;
  }>({});
  const [processingStats, setProcessingStats] = useState<{
    confidence?: number;
    wordCount?: number;
    blocksFound?: number;
    preprocessing?: string;
    characterCount?: number;
    bestEngine?: string;
  }>({});
  const [availableEngines, setAvailableEngines] = useState<{
    tesseract?: boolean;
    easyocr?: boolean;
    trocr?: boolean;
  }>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setExtractedText('');
      setShowComparison(false);
      setProcessingStats({});
      setQualityScores({});
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const handleOCR = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const endpoints: Record<OCRType, string> = {
        'printed': 'http://localhost:8000/extract-text',
        'handwritten': 'http://localhost:8000/extract-text-handwritten', // Note: This endpoint doesn't exist in your backend
        'easyocr': 'http://localhost:8000/extract-text-easyocr-enhanced',
        'tesseract': 'http://localhost:8000/extract-text-tesseract',
        'multi-engine': 'http://localhost:8000/extract-text-multi-engine'
      };

      const response = await axios.post<OCRResponse>(endpoints[ocrType], formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for processing
      });

      setExtractedText(response.data.extracted_text);
      setModelUsed(response.data.model_used || 'Unknown');
      
      // Set processing stats
      setProcessingStats({
        confidence: response.data.confidence,
        wordCount: response.data.word_count,
        blocksFound: response.data.blocks_found,
        preprocessing: response.data.preprocessing,
        characterCount: response.data.character_count,
        bestEngine: response.data.best_engine
      });

      // Set available engines info
      if (response.data.available_engines) {
        setAvailableEngines(response.data.available_engines);
      }

      // Set quality scores for multi-engine
      if (response.data.quality_scores) {
        setQualityScores(response.data.quality_scores);
      }
      
      // Show comparison for multi-engine results
      if (ocrType === 'multi-engine' && response.data.all_results) {
        setComparisonResults({
          trocr: response.data.all_results.trocr || '',
          easyocr: response.data.all_results.easyocr || '',
          tesseract: response.data.all_results.tesseract || ''
        });
        setShowComparison(true);
      } else {
        setShowComparison(false);
      }

    } catch (error: any) {
      console.error('OCR Error:', error);
      let errorMessage = 'Failed to extract text from image';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - image may be too large or complex';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setExtractedText(`Error: ${errorMessage}`);
      setModelUsed('Error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadText = () => {
    const element = document.createElement('a');
    const file = new Blob([extractedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `extracted-text-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getOCRTypeDescription = (type: OCRType): { title: string; description: string; icon: React.ReactNode; highlight?: boolean } => {
    const descriptions = {
      'printed': { 
        title: 'TrOCR Printed', 
        description: 'Transformer-based for typed text', 
        icon: <FileText className="h-4 w-4" /> 
      },
      'handwritten': { 
        title: 'TrOCR Handwritten', 
        description: 'Specialized for handwriting (not available)', 
        icon: <FileText className="h-4 w-4" /> 
      },
      'easyocr': { 
        title: 'Enhanced EasyOCR', 
        description: 'High accuracy with smart preprocessing', 
        icon: <Cpu className="h-4 w-4" /> 
      },
      'tesseract': { 
        title: 'Tesseract OCR', 
        description: 'Traditional OCR with advanced processing', 
        icon: <Settings className="h-4 w-4" /> 
      },
      'multi-engine': { 
        title: 'Multi-Engine (Recommended)', 
        description: 'All engines + intelligent selection', 
        icon: <Brain className="h-4 w-4" />, 
        highlight: true 
      }
    };
    return descriptions[type];
  };

  const formatScore = (score: number | undefined): string => {
    if (score === undefined) return 'N/A';
    return score.toFixed(1);
  };

  const getEngineStatus = (engine: string): string => {
    const available = availableEngines[engine as keyof typeof availableEngines];
    return available ? '✅' : '❌';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Advanced OCR Document Scanner
          </h1>
          <p className="text-lg text-gray-600">
            Extract text from images using multiple AI models with intelligent selection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Upload Document
            </h2>

            {/* OCR Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select OCR Engine
              </label>
              <div className="grid grid-cols-1 gap-3">
                {(['multi-engine', 'tesseract', 'easyocr', 'printed'] as OCRType[]).map((type) => {
                  const config = getOCRTypeDescription(type);
                  const isDisabled = type === 'handwritten'; // Disable handwritten since it's not in your backend
                  
                  return (
                    <label 
                      key={type}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        isDisabled 
                          ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                          : ocrType === type 
                            ? config.highlight 
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 ring-2 ring-blue-200' 
                              : 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={type}
                        checked={ocrType === type}
                        onChange={(e) => setOcrType(e.target.value as OCRType)}
                        disabled={isDisabled}
                        className="sr-only"
                      />
                      <div className={`mr-3 p-2 rounded-full ${
                        isDisabled 
                          ? 'bg-gray-200 text-gray-400'
                          : ocrType === type 
                            ? config.highlight 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                              : 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          isDisabled 
                            ? 'text-gray-400'
                            : ocrType === type 
                              ? config.highlight 
                                ? 'bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent' 
                                : 'text-blue-700'
                              : 'text-gray-900'
                        }`}>
                          {config.title}
                        </div>
                        <div className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                          {config.description}
                        </div>
                      </div>
                      {config.highlight && !isDisabled && (
                        <div className="ml-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800">
                            Recommended
                          </span>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Engine Status */}
            {Object.keys(availableEngines).length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Engine Status:</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span>Tesseract: {getEngineStatus('tesseract')}</span>
                  <span>EasyOCR: {getEngineStatus('easyocr')}</span>
                  <span>TrOCR: {getEngineStatus('trocr')}</span>
                </div>
              </div>
            )}

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50 scale-105' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop the image here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2 font-medium">
                    Drag & drop an image here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PNG, JPG, JPEG, GIF, BMP, WebP (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg border max-h-64 mx-auto shadow-sm"
                />
              </div>
            )}

            {/* Extract Button */}
            <button
              onClick={handleOCR}
              disabled={!selectedFile || isLoading}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Processing with {getOCRTypeDescription(ocrType).title}...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Extract Text
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Extracted Text
                </h2>
                {modelUsed && (
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">
                      Model: <span className="font-medium text-blue-600">{modelUsed}</span>
                    </p>
                    {Object.keys(processingStats).length > 0 && (
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                        {processingStats.characterCount && (
                          <span>Chars: {processingStats.characterCount}</span>
                        )}
                        {processingStats.wordCount && (
                          <span>Words: {processingStats.wordCount}</span>
                        )}
                        {processingStats.blocksFound && (
                          <span>Blocks: {processingStats.blocksFound}</span>
                        )}
                        {processingStats.confidence && (
                          <span>Conf: {processingStats.confidence}</span>
                        )}
                        {processingStats.bestEngine && (
                          <span>Best: {processingStats.bestEngine}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {extractedText && !extractedText.startsWith('Error:') && (
                <div className="flex space-x-2">
                  {showComparison && (
                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      title="Toggle comparison view"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    onClick={downloadText}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                    title="Download as text file"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {showComparison && ocrType === 'multi-engine' ? (
              <div className="space-y-4">
                {/* Quality Scores Summary */}
                {Object.keys(qualityScores).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <h4 className="font-medium text-gray-900 mb-2">Quality Scores:</h4>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {Object.entries(qualityScores).map(([engine, score]) => (
                        <span key={engine} className="capitalize">
                          {engine}: {formatScore(score)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {comparisonResults.tesseract && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Settings className="h-4 w-4 mr-1 text-green-600" />
                      Tesseract OCR Result:
                      {qualityScores.tesseract && (
                        <span className="ml-2 text-xs bg-green-100 px-2 py-1 rounded">
                          Score: {formatScore(qualityScores.tesseract)}
                        </span>
                      )}
                    </h4>
                    <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm max-h-32 overflow-y-auto">
                      {comparisonResults.tesseract || 'No result'}
                    </pre>
                  </div>
                )}

                {comparisonResults.easyocr && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Cpu className="h-4 w-4 mr-1 text-blue-600" />
                      EasyOCR Result:
                      {qualityScores.easyocr && (
                        <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded">
                          Score: {formatScore(qualityScores.easyocr)}
                        </span>
                      )}
                    </h4>
                    <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm max-h-32 overflow-y-auto">
                      {comparisonResults.easyocr || 'No result'}
                    </pre>
                  </div>
                )}

                {comparisonResults.trocr && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-purple-600" />
                      TrOCR Result:
                      {qualityScores.trocr && (
                        <span className="ml-2 text-xs bg-purple-100 px-2 py-1 rounded">
                          Score: {formatScore(qualityScores.trocr)}
                        </span>
                      )}
                    </h4>
                    <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm max-h-32 overflow-y-auto">
                      {comparisonResults.trocr || 'No result'}
                    </pre>
                  </div>
                )}

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Brain className="h-4 w-4 mr-1 text-orange-600" />
                    Best Result Selected by AI:
                  </h4>
                  <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm max-h-40 overflow-y-auto">
                    {extractedText}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 min-h-96">
                {extractedText ? (
                  <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm leading-relaxed">
                    {extractedText}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Ready to extract text</p>
                      <p className="text-sm">Upload an image and select your preferred OCR engine</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Multi-Engine Intelligence
            </h3>
            <p className="text-gray-600">
              Automatically selects the best result from multiple OCR engines with quality scoring
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Smart Preprocessing
            </h3>
            <p className="text-gray-600">
              Engine-specific image optimization for maximum accuracy
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Result Comparison
            </h3>
            <p className="text-gray-600">
              Compare outputs and quality scores from different OCR engines
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
