'use client';

import { useState } from 'react';

interface MagnetInputFormProps {
  onSubmit: (magnetOrM3u8: string, type: 'magnet' | 'hls') => void;
}

export default function MagnetInputForm({ onSubmit }: MagnetInputFormProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const validateInput = (value: string): { valid: boolean; type?: 'magnet' | 'hls' } => {
    // Validate magnet link
    if (value.startsWith('magnet:?')) {
      // Basic magnet link validation
      if (value.includes('xt=urn:')) {
        return { valid: true, type: 'magnet' };
      }
    }
    
    // Validate m3u8 link
    if (value.endsWith('.m3u8') || value.includes('.m3u8?')) {
      try {
        new URL(value);
        return { valid: true, type: 'hls' };
      } catch {
        return { valid: false };
      }
    }
    
    return { valid: false };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const sanitizedInput = input.trim();
    const validation = validateInput(sanitizedInput);
    
    if (!validation.valid || !validation.type) {
      setError('Please enter a valid magnet link (magnet:?xt=...) or HLS playlist URL (.m3u8)');
      return;
    }
    
    onSubmit(sanitizedInput, validation.type);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      setError('Failed to read clipboard. Please paste manually.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <label htmlFor="magnet-input" className="block text-sm font-medium text-gray-700 mb-2">
          Magnet Link or HLS Playlist URL
        </label>
        <div className="flex gap-2">
          <input
            id="magnet-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="magnet:?xt=urn:btih:... or https://example.com/playlist.m3u8"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-describedby="help-text"
          />
          <button
            type="button"
            onClick={handlePaste}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Paste
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
      
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        disabled={!input.trim()}
      >
        Stream
      </button>
      
      <div id="help-text" className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Legal Notice:</strong> Only use this tool with content you have the right to access. 
          Streaming copyrighted material without permission is illegal. This tool is for legal, 
          authorized content only.
        </p>
      </div>
    </form>
  );
}
