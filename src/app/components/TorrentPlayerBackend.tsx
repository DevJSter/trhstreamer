'use client';

import { useEffect, useRef, useState } from 'react';

interface TorrentPlayerBackendProps {
  magnet: string;
  onError: (error: string) => void;
}

interface TorrentFile {
  index: number;
  name: string;
  length: number;
  path: string;
}

interface TorrentInfo {
  success: boolean;
  infoHash: string;
  name: string;
  files: TorrentFile[];
}

export default function TorrentPlayerBackend({ magnet, onError }: TorrentPlayerBackendProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [torrentInfo, setTorrentInfo] = useState<TorrentInfo | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);

  useEffect(() => {
    console.log('=== TORRENT PLAYER (BACKEND): Component mounted ===');
    console.log('Magnet link:', magnet);
    let mounted = true;

    const addTorrentToServer = async () => {
      try {
        console.log('BACKEND: Sending magnet to server API...');
        
        const response = await fetch('/api/relay/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ magnetURI: magnet }),
        });

        console.log('BACKEND: Server response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add torrent to server');
        }

        const data: TorrentInfo = await response.json();
        console.log('=== BACKEND: Torrent added to server successfully ===');
        console.log('Torrent info:', data);

        if (!mounted) {
          console.log('BACKEND: Component unmounted, aborting');
          return;
        }

        setTorrentInfo(data);

        // Find first playable video file
        const playableIndex = data.files.findIndex((file) =>
          /\.(mp4|webm|ogg|mkv)$/i.test(file.name)
        );

        console.log('BACKEND: Playable file index:', playableIndex);

        if (playableIndex === -1) {
          onError('No playable video file found in torrent');
          setLoading(false);
          return;
        }

        setSelectedFileIndex(playableIndex);
        playFile(data.infoHash, playableIndex);
        setLoading(false);

      } catch (error) {
        console.error('BACKEND: Error:', error);
        if (mounted) {
          onError(`Failed to add torrent: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setLoading(false);
        }
      }
    };

    const playFile = (infoHash: string, fileIndex: number) => {
      console.log('BACKEND: Setting video source to stream endpoint');
      if (videoRef.current) {
        const streamUrl = `/api/relay/stream/${infoHash}/${fileIndex}`;
        console.log('BACKEND: Stream URL:', streamUrl);
        videoRef.current.src = streamUrl;
        videoRef.current.load();
      }
    };

    addTorrentToServer();

    return () => {
      console.log('=== BACKEND: Component unmounting ===');
      mounted = false;
    };
  }, [magnet, onError]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Connecting to server and loading torrent...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black"
            controls
            playsInline
            autoPlay
          />
        )}

        {torrentInfo && (
          <div className="p-4 bg-gray-50">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">{torrentInfo.name}</h3>
              <p className="text-sm text-gray-600">
                Streaming from server • {torrentInfo.files.length} file(s)
              </p>
            </div>

            {torrentInfo.files.length > 1 && (
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-2">Files in torrent:</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {torrentInfo.files.map((file, index) => (
                    <div
                      key={index}
                      className={`text-sm p-2 rounded cursor-pointer ${
                        index === selectedFileIndex
                          ? 'bg-blue-100 border border-blue-300'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setSelectedFileIndex(index);
                        if (videoRef.current) {
                          videoRef.current.src = `/api/relay/stream/${torrentInfo.infoHash}/${index}`;
                          videoRef.current.load();
                        }
                      }}
                    >
                      {file.name} ({formatBytes(file.length)})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
