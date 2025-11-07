declare module 'torrent-stream' {
  import { EventEmitter } from 'events';
  import { Readable } from 'stream';

  interface TorrentFile {
    name: string;
    path: string;
    length: number;
    offset: number;
    createReadStream(opts?: { start?: number; end?: number }): Readable;
    select(): void;
    deselect(): void;
  }

  interface Torrent {
    name: string;
    length: number;
  }

  interface Swarm {
    downloaded: number;
    uploaded: number;
    downloadSpeed(): number;
    uploadSpeed(): number;
    wires: unknown[];
  }

  interface TorrentEngine extends EventEmitter {
    files: TorrentFile[];
    torrent: Torrent;
    infoHash: string;
    path: string;
    swarm: Swarm;
    destroy(callback?: () => void): void;
    connect(addr: string): void;
    disconnect(addr: string): void;
    remove(callback?: () => void): void;
    listen(port?: number, callback?: () => void): void;
  }

  interface TorrentStreamOptions {
    connections?: number;
    uploads?: number;
    tmp?: string;
    path?: string;
    verify?: boolean;
    dht?: boolean;
    tracker?: boolean;
    trackers?: string[];
  }

  function torrentStream(
    uri: string | Buffer,
    options?: TorrentStreamOptions
  ): TorrentEngine;

  export = torrentStream;
}
