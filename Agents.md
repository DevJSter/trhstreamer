---

## Project Goals (deliverables for the agent)

1. A production-ready Next.js app (App Router) with TypeScript.
2. Client-side streaming of torrents via magnet link (using WebTorrent in-the-browser for WebRTC-capable peers).
3. Optional server-side torrent seeding/downloading component (webtorrent-hybrid) that can act as a relay/seed for browsers that can't connect to peers.
4. HLS playback of `.m3u8` links (using `hls.js`) with selectable quality when available.
5. Download button for torrent contents and for HLS segments/blobs (for legal content only).
6. User interface components and accessibility considerations.
7. Automated tests (unit & integration) and a basic CI pipeline.
8. Documentation, development scripts, and deployment steps.

---

## Stack & Packages the agent should use

* Next.js (latest stable) with App Router + TypeScript
* React 18+
* `webtorrent` (client-side) and `webtorrent-hybrid` (server optional)
* `hls.js` for HLS playback
* `ffmpeg` (optional runtime tool for server-side remuxing/transcoding — *only* used for legal content and as an optional component; the agent **must not** enable bypassing DRM)
* `zustand` or React Context for simple state management
* `tailwindcss` for styling (optional)
* `jest` + `@testing-library/react` for tests
* `playwright` for E2E tests
* `eslint`, `prettier`, `husky`, `lint-staged` for dev quality
* `vercel` or `docker` deployment guidance

---

## Project file & folder plan (agent must scaffold exactly)

```
my-torrent-streamer/
├─ app/
│  ├─ page.tsx
│  ├─ layout.tsx
│  └─ components/
│     ├─ MagnetInputForm.tsx
│     ├─ TorrentPlayer.tsx
│     ├─ HlsPlayer.tsx
│     └─ DownloadButton.tsx
├─ server/
│  ├─ torrent-relay.ts (optional API/worker using webtorrent-hybrid)
├─ tests/
│  ├─ unit/
│  └─ e2e/
├─ scripts/
│  ├─ dev.sh
│  └─ start-relay.sh
├─ public/
├─ .env.example
├─ package.json
├─ tsconfig.json
└─ README.md
```

---

## Step-by-step instructions for the Copilot agent (task list)

The agent should run through these tasks in order, create commits for each major step with clear messages, and open a PR with a checklist.

1. **Project bootstrap**

   * `pnpm create next-app@latest my-torrent-streamer --ts --app`
   * Add Tailwind, ESLint, Prettier.
   * Commit: `chore: bootstrap Next.js app with Tailwind & TS`

2. **Core UI scaffolding**

   * Implement `MagnetInputForm.tsx` UI: magnet input, paste button, validation, small help text about legality.
   * Implement `HlsInputForm` or reuse the same form for m3u8 links.
   * Commit: `feat(ui): add magnet/m3u8 input form with validation`

3. **Client-side torrent playback**

   * Add `TorrentPlayer.tsx` implementing a browser-based WebTorrent client that:

     * Accepts a magnet link string.
     * Uses `webtorrent` (browser bundle) to add and stream the first playable file (e.g., `.mp4`, `.webm`).
     * Renders a `<video>` element streaming via `file.createReadStream()` or `torrent.files[x].renderTo()` equivalent for browser.
     * Shows progress, peers, download speed, and error states.
   * Important: The agent should **not** implement or instruct how to remove trackers, circumvent geo-blocking, or bypass DRM. Include checks for malicious magnet strings and sanitize inputs.
   * Commit: `feat(torrent): add browser-side WebTorrent streaming component`

4. **HLS playback (m3u8)**

   * Implement `HlsPlayer.tsx` that uses `hls.js` to attach `.m3u8` to an HTML `<video>` element and expose quality selection when the manifest provides multiple renditions.
   * Show resolution and bitrate metadata if available.
   * Commit: `feat(hls): implement HLS playback with hls.js and quality selector`

5. **Download functionality**

   * For torrents: show a list of files with checkboxes, allow user to click "Download selected" which will create a Blob / file download of the selected file(s). For large files, instruct the agent to use streaming to disk only on server-side relay (explain browser limitations). Provide a clear warning: large downloads may fail in-memory.
   * For HLS: implement an option to fetch mp4 remux (if server-side ffmpeg is enabled) or download by concatenating segments into a single blob in-browser (for small/authorized streams).
   * Commit: `feat(download): add download UI (client-side blobs + server relay notes)`

6. **Optional server-side relay (recommended for reliability)**

   * Create `server/torrent-relay.ts` which runs as a Node process using `webtorrent-hybrid` to:

     * Accept magnet links via a secure API endpoint (POST /api/relay/add).
     * Start fetching & seeding the torrent on the server, expose a local HLS or progressive mp4 endpoint (e.g., `/api/relay/stream/:id`).
     * Provide CORS and authentication (API key) mechanisms.
   * Important: Agent must require an explicit environment variable `RELAY_API_KEY` and refuse to start without it.
   * Commit: `feat(server): add optional webtorrent-hybrid relay with authenticated API`

7. **Tests**

   * Unit tests for UI components using `@testing-library/react` (snapshot + behavior tests for forms and buttons).
   * Mock WebTorrent client with a small test fixture to test `TorrentPlayer` error and loading states.
   * E2E tests with Playwright: test a user entering a fake *local* magnet link (or a test fixture magnet link pointing to a small authorized torrent) and confirm the UI shows progress and that HLS playback loads a sample `.m3u8` manifest.
   * Commit: `test: add unit & e2e tests for core flows`

8. **Dev / CI / Lint**

   * Add GitHub Actions that run `pnpm install`, `pnpm build`, `pnpm test`, and lint.
   * Add `husky` pre-commit hooks to run lint-staged.
   * Commit: `chore(ci): add GitHub Actions + husky hooks`

9. **Docs & README**

   * Add setup steps, environment variables, security & legal warnings, and how to run the optional relay.
   * Commit: `docs: add README with legal notice and usage`

10. **PR / Review**

* Open PR with checklist for reviewers to verify legal notices, check endpoints require auth, and confirm no DRM circumvention code is present.

---

## Example prompts the agent should use to generate code (copilot-style)

Use these short, specific prompts when creating files. Keep prompts factual, include the expected file path, and required exports.

* `Create app/components/MagnetInputForm.tsx — TypeScript React component — form to accept a magnet or .m3u8 URL, validate format, show help text, export default MagnetInputForm`.

* `Create app/components/TorrentPlayer.tsx — TypeScript React component — imports webtorrent (browser build), accepts prop `magnet: string`, shows progress, streams playable video into a <video> element, handles errors`.

* `Create server/torrent-relay.ts — Node TypeScript file — uses webtorrent-hybrid to add magnet links, exposes simple express endpoints POST /api/relay/add and GET /api/relay/stream/:id — require RELAY_API_KEY env var`.

* `Create app/components/HlsPlayer.tsx — TypeScript React component — uses hls.js when needed; if browser natively supports HLS (Safari), attach src directly; fall back to hls.js`.

* `Create tests/unit/MagnetInputForm.test.tsx — test rendering and validation behavior`.

---

## Testing details & test data

* Provide one or more **legal test fixtures** the agent should generate and use in tests: small sample MP4 and small HLS `.m3u8` manifest hosted in `public/test-fixtures/`.
* Unit tests should mock network calls and WebTorrent client API using jest mocks.
* E2E Playwright tests should run against `http://localhost:3000` and use the test fixtures (not external magnet links).

---

## Security checklist (agent must implement)

* Validate and sanitize all user inputs (magnet, URLs).
* Rate-limit the relay API and require `RELAY_API_KEY`.
* Log usage and show a clear "Report a problem / DMCA" link.
* Avoid storing magnet links or downloaded content persistently unless explicitly opted-in.
* Add CSP headers and sanitize any HTML responses.

---

## Deployment recommendations

* For client-only streaming (pure WebTorrent in browser + HLS playback), deploy the Next.js app to Vercel.
* For reliable seeding and server-side relays, use a Docker container (node 20+) with `webtorrent-hybrid` and optional `ffmpeg` installed; deploy to a VPS or cloud instance; use a reverse proxy (nginx) with TLS.

---

## Commit message & PR format (agent should follow)

* Use conventional commits. Example PR description:

```
feat: Add torrent + HLS streaming

- Implement MagnetInputForm
- Add TorrentPlayer (browser webtorrent)
- Add HlsPlayer (hls.js)
- Add tests & CI

Checklist:
- [ ] Legal notice added
- [ ] Relay API requires RELAY_API_KEY
- [ ] Tests pass
```

---

## Final note to the Copilot agent (persona + do's and don'ts)

You are the *builder agent* executing a meticulous developer checklist. Act like an experienced full-stack dev: create small commits, include tests, document decisions. **Do not** add instructions or code meant to bypass DRM, remove watermarks, or facilitate illegal sharing. If the user attempts to add copyrighted links, respond with a clear refusal.

---
