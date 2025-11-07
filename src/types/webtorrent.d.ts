declare module 'webtorrent' {
  export interface TorrentFile {
    name: string;
    length: number;
    createReadStream(opts?: any): ReadableStream;
    renderTo(elem: HTMLMediaElement, opts?: { autoplay?: boolean; controls?: boolean }): void;
  }

  export interface Torrent {
    infoHash: string;
    magnetURI: string;
    files: TorrentFile[];
    progress: number;
    downloadSpeed: number;
    uploadSpeed: number;
    numPeers: number;
    on(event: string, callback: (...args: any[]) => void): void;
    destroy(): void;
  }

  export default class WebTorrent {
    constructor();
    add(torrentId: string, callback?: (torrent: Torrent) => void): Torrent;
    on(event: string, callback: (...args: any[]) => void): void;
    destroy(): void;
  }
}
