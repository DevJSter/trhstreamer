# Torrent & HLS Streamer

A production-ready Next.js application for streaming torrents and HLS playlists directly in your browser.

## ⚠️ Legal Notice

**This application is for educational and legal streaming purposes only.**

- You are solely responsible for ensuring you have the legal right to access and stream any content.
- Unauthorized distribution or streaming of copyrighted content is illegal and may result in civil and criminal penalties.
- This tool **does not** and **will not** implement features to bypass DRM, remove watermarks, or facilitate illegal sharing.

## Features

- 🎬 **Client-side torrent streaming** using WebTorrent (browser-based, WebRTC peers)
- 📺 **HLS playback** with hls.js and quality selection
- 💾 **Download functionality** for torrent files (with browser limitations warnings)
- 🔒 **Security-first design** with input validation and sanitization
- ♿ **Accessible UI** with ARIA labels and keyboard navigation
- 🧪 **Full test coverage** (unit + E2E tests)
- 🚀 **Production-ready** with TypeScript, ESLint, Prettier

## Tech Stack

- **Next.js 16** (App Router + TypeScript)
- **React 19**
- **Tailwind CSS 4**
- **WebTorrent** (client-side streaming)
- **hls.js** (HLS playback)
- **Zustand** (state management)
- **Jest + Testing Library** (unit tests)
- **Playwright** (E2E tests)

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables (optional, for relay server)
cp .env.example .env
```

### Development

```bash
# Start the development server
pnpm dev

# Or use the script
./scripts/dev.sh
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
my-torrent-streamer/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── MagnetInputForm.tsx    # Input form with validation
│   │   │   ├── TorrentPlayer.tsx      # WebTorrent player component
│   │   │   ├── HlsPlayer.tsx          # HLS player with quality selector
│   │   │   └── DownloadButton.tsx     # Download functionality
│   │   ├── page.tsx                   # Main application page
│   │   └── layout.tsx                 # Root layout
│   └── types/
│       └── webtorrent.d.ts            # TypeScript definitions
├── server/
│   └── torrent-relay.ts               # Optional server relay (TODO)
├── tests/
│   ├── unit/                          # Unit tests
│   └── e2e/                           # E2E tests
├── scripts/
│   ├── dev.sh                         # Development script
│   └── start-relay.sh                 # Relay server script
└── public/
    └── test-fixtures/                 # Test fixtures
```

## Usage

### Streaming Torrents

1. Paste a magnet link in the format: `magnet:?xt=urn:btih:...`
2. Click "Stream"
3. Wait for peers to connect (WebRTC in-browser)
4. Video will start playing automatically

**Note:** Browser-based torrenting relies on WebRTC peers. For best results:
- Use popular, well-seeded torrents
- Ensure your browser supports WebRTC
- Some networks may block WebRTC connections

### Streaming HLS

1. Paste an HLS playlist URL ending in `.m3u8`
2. Click "Stream"
3. Select quality if multiple renditions are available

## Testing

### Unit Tests

```bash
pnpm test
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm exec playwright test --ui
```

## Security Considerations

- ✅ Input validation and sanitization
- ✅ API key authentication for relay
- ✅ Rate limiting recommendations
- ✅ CSP headers
- ✅ DMCA reporting mechanism placeholder
- ✅ Legal notices prominently displayed

## Deployment

### Vercel (Client-Only)

```bash
pnpm add -g vercel
vercel
```

### Docker (with Server Relay)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000 3001
CMD ["npm", "start"]
```

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (native HLS support)
- ⚠️ WebTorrent requires WebRTC support

## Known Limitations

- **Browser memory limits**: Large file downloads may fail
- **WebRTC connectivity**: Depends on network configuration
- **HLS download**: Requires server-side processing
- **Mobile support**: Limited by browser capabilities

## License

MIT License

## Disclaimer

The developers of this tool are not responsible for any misuse or illegal activity performed with this software. Users must comply with all applicable laws and respect intellectual property rights.

---

**Remember:** Only stream content you have the legal right to access. 🔒
