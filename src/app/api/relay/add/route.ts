import { NextRequest, NextResponse } from 'next/server';
import torrentStream from 'torrent-stream';

// Store active torrent engines
const activeTorrents = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    console.log('=== API: POST /api/relay/add called ===');
    
    const { magnetURI } = await request.json();
    console.log('API: Received magnet:', magnetURI);
    
    if (!magnetURI || typeof magnetURI !== 'string') {
      return NextResponse.json(
        { error: 'Invalid magnet URI' },
        { status: 400 }
      );
    }

    return new Promise((resolve) => {
      console.log('SERVER: Creating torrent-stream engine...');
      
      const engine = torrentStream(magnetURI, {
        connections: 100,     // Max connections
        uploads: 10,          // Max upload slots
        path: '/tmp/torrents' // Temp storage
      });

      let resolved = false;

      engine.on('ready', () => {
        if (resolved) return;
        resolved = true;

        console.log('=== SERVER: Torrent engine ready ===');
        console.log('Torrent name:', engine.torrent.name);
        console.log('Torrent infoHash:', engine.infoHash);
        
        const infoHash = engine.infoHash;
        activeTorrents.set(infoHash, engine);

        // Select all files for download
        engine.files.forEach((file: any) => {
          console.log(`SERVER: Selecting file for download: ${file.name}`);
          file.select();
        });

        const files = engine.files.map((file: any, index: number) => ({
          name: file.name,
          length: file.length,
          index,
        }));

        console.log('SERVER: Torrent files:', files);

        // Log download progress - track cumulative progress properly
        let lastLoggedProgress = 0;
        let lastLogTime = 0;
        const MIN_LOG_INTERVAL = 2000; // Log at most every 2 seconds
        
        const progressInterval = setInterval(() => {
          const downloaded = engine.swarm.downloaded;
          const total = engine.torrent.length;
          const progress = Math.floor((downloaded / total) * 100);
          const now = Date.now();
          
          // Only log if progress increased by at least 5% AND enough time has passed
          if (progress > lastLoggedProgress && 
              progress - lastLoggedProgress >= 5 && 
              now - lastLogTime >= MIN_LOG_INTERVAL) {
            
            const speed = engine.swarm.downloadSpeed();
            const speedMB = (speed / 1024 / 1024).toFixed(2);
            const peers = engine.swarm.wires.length;
            
            console.log(`SERVER: Download progress: ${progress}% (${downloaded}/${total} bytes) | Speed: ${speedMB} MB/s | Peers: ${peers}`);
            lastLoggedProgress = progress;
            lastLogTime = now;
          }
          
          // Always log when complete
          if (progress === 100 && lastLoggedProgress < 100) {
            console.log(`SERVER: ✓ Download complete! (${total} bytes)`);
            lastLoggedProgress = 100;
          }
        }, 1000);

        // Clear interval when engine is destroyed
        engine.on('idle', () => {
          clearInterval(progressInterval);
          console.log('SERVER: Torrent download idle - all pieces received');
        });

        resolve(
          NextResponse.json({
            success: true,
            infoHash,
            name: engine.torrent.name,
            files,
          })
        );
      });

      engine.on('error', (err: Error) => {
        if (resolved) return;
        resolved = true;
        console.error('SERVER: Torrent engine error:', err);
        resolve(
          NextResponse.json(
            { error: err.message || 'Failed to add torrent' },
            { status: 500 }
          )
        );
      });
    });
  } catch (error: unknown) {
    console.error('API: Error adding torrent:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add torrent';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export { activeTorrents };
