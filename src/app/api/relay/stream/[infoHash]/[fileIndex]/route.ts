import { NextRequest, NextResponse } from 'next/server';
import { activeTorrents } from '../../../add/route';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ infoHash: string; fileIndex: string }> }
) {
  const { infoHash, fileIndex } = await params;
  console.log(`=== API: GET /api/relay/stream/${infoHash}/${fileIndex} ===`);

  const engine = activeTorrents.get(infoHash);

  if (!engine) {
    console.error('API: Torrent not found:', infoHash);
    return NextResponse.json(
      { error: 'Torrent not found' },
      { status: 404 }
    );
  }

  const fileIdx = parseInt(fileIndex);
  const file = engine.files[fileIdx];

  if (!file) {
    console.error('API: File not found:', fileIdx);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }

  console.log('API: Streaming file:', file.name);

  try {
    // Handle range requests for video seeking
    const range = request.headers.get('range');
    let start = 0;
    let end = file.length - 1;
    let statusCode = 200;
    const headers: Record<string, string> = {
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
    };

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      start = parseInt(parts[0], 10);
      end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
      statusCode = 206; // Partial Content
      
      headers['Content-Range'] = `bytes ${start}-${end}/${file.length}`;
      headers['Content-Length'] = (end - start + 1).toString();
      
      console.log(`API: Range request: bytes ${start}-${end}/${file.length}`);
    } else {
      headers['Content-Length'] = file.length.toString();
    }

    // Create a readable stream from the torrent file with range
    const stream = file.createReadStream({ start, end });
    
    // Convert Node stream to Web Stream
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        stream.on('end', () => {
          controller.close();
        });

        stream.on('error', (error: Error) => {
          console.error('Stream error:', error);
          controller.error(error);
        });
      },
      cancel() {
        stream.destroy();
      },
    });

    return new Response(readableStream, {
      status: statusCode,
      headers,
    });
  } catch (error) {
    console.error('API: Error streaming file:', error);
    return NextResponse.json(
      { error: 'Failed to stream file' },
      { status: 500 }
    );
  }
}
