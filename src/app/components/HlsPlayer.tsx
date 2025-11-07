'use client';

import { useEffect, useRef, useState } from 'react';

interface HlsPlayerProps {
  m3u8Url: string;
  onError: (error: string) => void;
}

interface QualityLevel {
  height: number;
  bitrate: number;
  index: number;
}

export default function HlsPlayer({ m3u8Url, onError }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);

  useEffect(() => {
    console.log('=== HLS PLAYER: Component mounted ===');
    console.log('HLS URL:', m3u8Url);
    let mounted = true;

    const initHls = async () => {
      console.log('HLS: Initializing player...');
      
      // Add a small delay to ensure video ref is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!videoRef.current) {
        console.error('HLS: Video ref is null after delay!');
        onError('Video element not ready');
        return;
      }

      console.log('HLS: Video ref is ready');

      // Check if browser natively supports HLS (Safari)
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('HLS: Browser supports native HLS playback');
        videoRef.current.src = m3u8Url;
        setLoading(false);
        return;
      }

      // Use hls.js for browsers that don't natively support HLS
      try {
        console.log('HLS: Importing hls.js...');
        const Hls = (await import('hls.js')).default;
        console.log('HLS: hls.js imported successfully');

        if (!Hls.isSupported()) {
          console.error('HLS: hls.js is not supported in this browser');
          onError('HLS is not supported in this browser');
          setLoading(false);
          return;
        }

        if (!mounted) {
          console.log('HLS: Component unmounted, aborting');
          return;
        }

        console.log('HLS: Creating Hls instance...');
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });

        hlsRef.current = hls;

        console.log('HLS: Loading source:', m3u8Url);
        hls.loadSource(m3u8Url);
        console.log('HLS: Attaching media to video element');
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          console.log('=== HLS: Manifest parsed successfully ===');
          console.log('HLS: Levels available:', data.levels.length);
          if (!mounted) {
            console.log('HLS: Component unmounted during manifest parse');
            return;
          }
          
          setLoading(false);

          // Extract quality levels
          if (data.levels && data.levels.length > 1) {
            const levelList: QualityLevel[] = data.levels.map((level: any, index: number) => ({
              height: level.height,
              bitrate: level.bitrate,
              index,
            }));
            console.log('HLS: Quality levels:', levelList);
            setQualities(levelList);
            setCurrentQuality(hls.currentLevel);
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error('=== HLS: Error event ===');
          console.error('HLS: Error type:', data.type);
          console.error('HLS: Error details:', data.details);
          console.error('HLS: Fatal:', data.fatal);
          console.error('HLS: Full error data:', data);
          
          if (!mounted) return;

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('HLS: Network error, attempting recovery...');
                onError('Network error loading HLS stream');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('HLS: Media error, attempting recovery...');
                onError('Media error in HLS stream');
                hls.recoverMediaError();
                break;
              default:
                console.error('HLS: Fatal error, destroying player');
                onError('Fatal error loading HLS stream');
                hls.destroy();
                break;
            }
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          console.log('HLS: Level switched to:', data.level);
          if (mounted) {
            setCurrentQuality(data.level);
          }
        });

      } catch (err) {
        if (mounted) {
          onError(`Failed to initialize HLS: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setLoading(false);
        }
      }
    };

    initHls();

    return () => {
      mounted = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [m3u8Url, onError]);

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
    }
  };

  const formatBitrate = (bitrate: number): string => {
    return (bitrate / 1000).toFixed(0) + ' kbps';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading HLS stream...</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black"
            controls
            autoPlay
            playsInline
          />
        )}

        {qualities.length > 0 && (
          <div className="p-4 bg-gray-50">
            <label className="block text-sm font-semibold mb-2">Quality:</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleQualityChange(-1)}
                className={`px-3 py-1 rounded text-sm ${
                  currentQuality === -1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Auto
              </button>
              {qualities.map((quality) => (
                <button
                  key={quality.index}
                  onClick={() => handleQualityChange(quality.index)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentQuality === quality.index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {quality.height}p ({formatBitrate(quality.bitrate)})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
