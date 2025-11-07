'use client';

import { useState } from 'react';
import MagnetInputForm from './components/MagnetInputForm';
import TorrentPlayerBackend from './components/TorrentPlayerBackend';
import HlsPlayer from './components/HlsPlayer';
import DownloadButton from './components/DownloadButton';

export default function Home() {
  const [activeStream, setActiveStream] = useState<{
    url: string;
    type: 'magnet' | 'hls';
  } | null>(null);
  const [error, setError] = useState<string>('');

  console.log('=== PAGE RENDER ===');
  console.log('Active stream:', activeStream);
  console.log('Error:', error);

  const handleSubmit = (url: string, type: 'magnet' | 'hls') => {
    console.log('=== PAGE: handleSubmit called ===');
    console.log('URL:', url);
    console.log('Type:', type);
    setError('');
    setActiveStream({ url, type });
    console.log('Active stream set:', { url, type });
  };

  const handleError = (errorMsg: string) => {
    console.error('=== PAGE: Error received ===');
    console.error('Error message:', errorMsg);
    setError(errorMsg);
  };

  const handleReset = () => {
    console.log('=== PAGE: Reset called ===');
    setActiveStream(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Torrent & HLS Streamer</h1>
          <p className="mt-2 text-sm text-gray-600">
            Stream torrents and HLS playlists directly in your browser
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!activeStream ? (
          <div className="mt-8">
            <MagnetInputForm onSubmit={handleSubmit} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                ← Back to Input
              </button>
            </div>

            {error && (
              <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {activeStream.type === 'magnet' && (
              <>
                <TorrentPlayerBackend magnet={activeStream.url} onError={handleError} />
                <DownloadButton type="torrent" torrentFiles={[]} />
              </>
            )}

            {activeStream.type === 'hls' && (
              <>
                <HlsPlayer m3u8Url={activeStream.url} onError={handleError} />
                <DownloadButton type="hls" hlsUrl={activeStream.url} />
              </>
            )}
          </div>
        )}

        <footer className="mt-16 text-center text-sm text-gray-500">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Legal Notice & Disclaimer</h3>
            <p className="mb-2">
              This application is for educational and legal streaming purposes only.
            </p>
            <p className="mb-2">
              <strong>You are solely responsible for ensuring that you have the legal right to access and stream any content.</strong>
            </p>
            <p>
              Unauthorized distribution or streaming of copyrighted content is illegal and may result in civil and criminal penalties.
            </p>
            <div className="mt-4">
              <a href="#" className="text-blue-600 hover:underline">Report DMCA Issue</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
