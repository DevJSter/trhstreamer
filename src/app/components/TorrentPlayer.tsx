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
    console.log('=== TORRENT PLAYER: Component mounted ===');
    console.log('Magnet link:', magnet);
    let mounted = true;

    const initTorrent = async () => {
      try {
        console.log('TORRENT: Starting WebTorrent initialization...');
        // Dynamically import WebTorrent for browser
        const WebTorrentModule = await import('webtorrent');
        console.log('TORRENT: WebTorrent module imported:', WebTorrentModule);
        const WebTorrent = WebTorrentModule.default;
        console.log('TORRENT: WebTorrent class:', WebTorrent);
        
        if (!mounted) {
          console.log('TORRENT: Component unmounted, aborting');
          return;
        }

        console.log('TORRENT: Creating WebTorrent client...');
        const client = new WebTorrent();
        console.log('TORRENT: Client instance created:', client);
        clientRef.current = client;
        
        console.log('TORRENT: Adding magnet link...');
        console.log('TORRENT: Magnet URI:', magnet);

        client.add(magnet, (torrent: any) => {
          console.log('=== TORRENT: Torrent added successfully ===');
          console.log('Torrent name:', torrent.name);
          console.log('Torrent info hash:', torrent.infoHash);
          console.log('Number of files:', torrent.files.length);
          
          if (!mounted) {
            console.log('TORRENT: Component unmounted during add callback');
            return;
          }

          torrentRef.current = torrent;

          // Get list of files
          const torrentFiles = torrent.files.map((file: any) => ({
            name: file.name,
            length: file.length,
          }));
          console.log('TORRENT: Files in torrent:', torrentFiles);
          setFiles(torrentFiles);

          // Find first playable video file
          const playableIndex = torrent.files.findIndex((file: any) => 
            /\.(mp4|webm|ogg|mkv)$/i.test(file.name)
          );
          console.log('TORRENT: Playable file index:', playableIndex);

          if (playableIndex === -1) {
            console.error('TORRENT: No playable video file found');
            onError('No playable video file found in torrent');
            setLoading(false);
            return;
          }

          console.log('TORRENT: Playing file:', torrent.files[playableIndex].name);
          setSelectedFileIndex(playableIndex);
          playFile(torrent.files[playableIndex]);

          // Update stats periodically
          const statsInterval = setInterval(() => {
            if (!mounted || !torrent) return;
            
            const stats = {
              progress: torrent.progress * 100,
              downloadSpeed: torrent.downloadSpeed,
              numPeers: torrent.numPeers,
            };
            console.log('TORRENT: Stats update:', stats);
            setStats(stats);
          }, 1000);

          torrent.on('error', (err: Error) => {
            console.error('TORRENT: Torrent error event:', err);
            if (mounted) {
              onError(`Torrent error: ${err.message}`);
            }
          });

          return () => clearInterval(statsInterval);
        });

        client.on('error', (err: Error) => {
          console.error('TORRENT: WebTorrent client error event:', err);
          if (mounted) {
            onError(`WebTorrent error: ${err.message}`);
            setLoading(false);
          }
        });
        
        client.on('warning', (err: Error) => {
          console.warn('TORRENT: WebTorrent warning event:', err);
        });
        
        console.log('TORRENT: All event listeners attached');

      } catch (err) {
        console.error('TORRENT: Failed to initialize:', err);
        if (mounted) {
          onError(`Failed to initialize torrent: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setLoading(false);
        }
      }
    };

    const playFile = (file: any) => {
      console.log('TORRENT: playFile called for:', file.name);
      if (videoRef.current) {
        console.log('TORRENT: Video ref exists, rendering to video element');
        file.renderTo(videoRef.current, {
          autoplay: true,
          controls: true,
        });
        console.log('TORRENT: Video rendering complete, setting loading to false');
        setLoading(false);
      } else {
        console.error('TORRENT: Video ref is null!');
      }
    };

    initTorrent();

    return () => {
      console.log('=== TORRENT: Component unmounting, cleaning up ===');
      mounted = false;
      if (clientRef.current) {
        console.log('TORRENT: Destroying client');
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
