'use client';

import { useState } from 'react';

interface DownloadButtonProps {
  type: 'torrent' | 'hls';
  torrentFiles?: Array<{ name: string; length: number }>;
  hlsUrl?: string;
}

export default function DownloadButton({ type, torrentFiles, hlsUrl }: DownloadButtonProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [downloading, setDownloading] = useState(false);

  const handleFileToggle = (index: number) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedFiles(newSelected);
  };

  const handleDownloadTorrent = async () => {
    if (selectedFiles.size === 0) {
      alert('Please select at least one file to download');
      return;
    }

    setDownloading(true);
    
    // Note: In-browser download is limited by memory
    alert('Browser-based torrent download has memory limitations. For large files, use a desktop torrent client with the magnet link.');
    
    setDownloading(false);
  };

  const handleDownloadHls = async () => {
    if (!hlsUrl) return;

    setDownloading(true);
    
    // Note: HLS download requires ffmpeg or segment concatenation
    alert('HLS download requires server-side processing or segment concatenation. This is a placeholder for future implementation.');
    
    setDownloading(false);
  };

  if (type === 'torrent' && torrentFiles) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">Download Files</h3>
          
          <div className="mb-4 max-h-64 overflow-y-auto border border-gray-200 rounded p-2">
            {torrentFiles.map((file, index) => (
              <label
                key={index}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(index)}
                  onChange={() => handleFileToggle(index)}
                  className="w-4 h-4"
                />
                <span className="text-sm flex-1">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.length / 1024 / 1024).toFixed(2)} MB
                </span>
              </label>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-xs text-yellow-800">
              <strong>⚠️ Warning:</strong> Browser downloads are limited by available memory. 
              Large files may fail. For reliable downloads, use a desktop torrent client.
            </p>
          </div>

          <button
            onClick={handleDownloadTorrent}
            disabled={downloading || selectedFiles.size === 0}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {downloading ? 'Preparing...' : `Download Selected (${selectedFiles.size})`}
          </button>
        </div>
      </div>
    );
  }

  if (type === 'hls' && hlsUrl) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">Download HLS Stream</h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-xs text-yellow-800">
              <strong>⚠️ Note:</strong> HLS streams require segment downloading and concatenation. 
              This feature requires server-side processing with ffmpeg or similar tools.
            </p>
          </div>

          <button
            onClick={handleDownloadHls}
            disabled={downloading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {downloading ? 'Preparing...' : 'Download Stream'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
