'use client';

import { useEffect, useRef, useState } from 'react';

interface TorrentPlayerProps {
  magnet: string;
  onError: (error: string) => void;
}

interface TorrentFile {
  name: string;
  length: number;
}

interface TorrentStats {
  progress: number;
  downloadSpeed: number;
  numPeers: number;
}

export default function TorrentPlayer({ magnet, onError }: TorrentPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TorrentStats>({ progress: 0, downloadSpeed: 0, numPeers: 0 });
  const [files, setFiles] = useState<TorrentFile[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const clientRef = useRef<any>(null);
  const torrentRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initTorrent = async () => {
      try {
        // Dynamically import WebTorrent for browser
        const WebTorrent = (await import('webtorrent')).default;
        
        if (!mounted) return;

        clientRef.current = new WebTorrent();

        clientRef.current.add(magnet, (torrent: any) => {
          if (!mounted) return;

          torrentRef.current = torrent;

          // Get list of files
          const torrentFiles = torrent.files.map((file: any) => ({
            name: file.name,
            length: file.length,
          }));
          setFiles(torrentFiles);

          // Find first playable video file
          const playableIndex = torrent.files.findIndex((file: any) => 
            /\.(mp4|webm|ogg|mkv)$/i.test(file.name)
          );

          if (playableIndex === -1) {
            onError('No playable video file found in torrent');
            setLoading(false);
            return;
          }

          setSelectedFileIndex(playableIndex);
          playFile(torrent.files[playableIndex]);

          // Update stats periodically
          const statsInterval = setInterval(() => {
            if (!mounted || !torrent) return;
            
            setStats({
              progress: torrent.progress * 100,
              downloadSpeed: torrent.downloadSpeed,
              numPeers: torrent.numPeers,
            });
          }, 1000);

          torrent.on('error', (err: Error) => {
            if (mounted) {
              onError(`Torrent error: ${err.message}`);
            }
          });

          return () => clearInterval(statsInterval);
        });

        clientRef.current.on('error', (err: Error) => {
          if (mounted) {
            onError(`WebTorrent error: ${err.message}`);
            setLoading(false);
          }
        });

      } catch (err) {
        if (mounted) {
          onError(`Failed to initialize torrent: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setLoading(false);
        }
      }
    };

    const playFile = (file: any) => {
      if (videoRef.current) {
        file.renderTo(videoRef.current, {
          autoplay: true,
          controls: true,
        });
        setLoading(false);
      }
    };

    initTorrent();

    return () => {
      mounted = false;
      if (clientRef.current) {
        clientRef.current.destroy();
      }
    };
  }, [magnet, onError]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading torrent...</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black"
            controls
            playsInline
          />
        )}

        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold">Progress:</span>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
                <span className="text-gray-600">{stats.progress.toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <span className="font-semibold">Speed:</span>
              <p className="text-gray-600">{formatSpeed(stats.downloadSpeed)}</p>
            </div>
            <div>
              <span className="font-semibold">Peers:</span>
              <p className="text-gray-600">{stats.numPeers}</p>
            </div>
          </div>

          {files.length > 1 && (
            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2">Files in torrent:</label>
              <div className="max-h-32 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded ${
                      index === selectedFileIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    {file.name} ({formatBytes(file.length)})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
