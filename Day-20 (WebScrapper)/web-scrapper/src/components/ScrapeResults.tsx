import React, { useState } from 'react';
import { 
  FileText, 
  Code, 
  Camera, 
  ExternalLink, 
  Download, 
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import type { ScrapeData } from '../types';
import { exportScrapeData } from '../utils/storage';

interface ScrapeResultsProps {
  data: ScrapeData | null;
}

const ScrapeResults: React.FC<ScrapeResultsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'html' | 'screenshot' | 'links'>('markdown');
  const [showFullContent, setShowFullContent] = useState(false);

  if (!data) {
    return null;
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleExport = () => {
    const filename = `scrape-${data.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
    exportScrapeData(data, filename);
  };

  const truncateContent = (content: string, limit = 2000) => {
    if (showFullContent || content.length <= limit) {
      return content;
    }
    return content.slice(0, limit) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {data.title || 'Untitled'}
            </h3>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <ExternalLink size={14} className="mr-1" />
              <a 
                href={data.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 truncate"
              >
                {data.url}
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Scraped on {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleExport}
            className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <Download size={14} className="mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {data.markdown && (
          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'markdown'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} className="mr-2" />
            Markdown
          </button>
        )}
        {data.html && (
          <button
            onClick={() => setActiveTab('html')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'html'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code size={16} className="mr-2" />
            HTML
          </button>
        )}
        {data.screenshot && (
          <button
            onClick={() => setActiveTab('screenshot')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'screenshot'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Camera size={16} className="mr-2" />
            Screenshot
          </button>
        )}
        {data.links && data.links.length > 0 && (
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === 'links'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ExternalLink size={16} className="mr-2" />
            Links ({data.links.length})
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'markdown' && data.markdown && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Markdown Content</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  {showFullContent ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span className="ml-1">{showFullContent ? 'Collapse' : 'Expand'}</span>
                </button>
                <button
                  onClick={() => copyToClipboard(data.markdown || '')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Copy size={14} className="mr-1" />
                  Copy
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {truncateContent(data.markdown)}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'html' && data.html && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">HTML Source</h4>
              <button
                onClick={() => copyToClipboard(data.html || '')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <Copy size={14} className="mr-1" />
                Copy
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {truncateContent(data.html)}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'screenshot' && data.screenshot && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Page Screenshot</h4>
            <div className="border rounded-lg overflow-hidden">
              <img 
                src={data.screenshot} 
                alt="Page screenshot"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {activeTab === 'links' && data.links && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Extracted Links</h4>
            <div className="space-y-2">
              {data.links.map((link, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {link.text}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {link.href}
                    </p>
                  </div>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 p-1 text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrapeResults;
