# Testing Instructions

## What to Check in Browser Console

1. **Open Developer Console** (F12 or Cmd+Option+I)
2. **Go to Console tab**
3. **Enter a magnet link** and click Stream

## Expected Console Output

You should see logs like this:

```
=== FORM: Submit handler called ===
=== PAGE: handleSubmit called ===
=== TORRENT PLAYER: Component mounted ===
TORRENT: Starting WebTorrent initialization...
TORRENT: WebTorrent module imported: [Object]
TORRENT: WebTorrent class: [Function]
TORRENT: Creating WebTorrent client...
TORRENT: Client instance created: [Object]
TORRENT: Adding magnet link...
TORRENT: All event listeners attached
=== TORRENT: Torrent added successfully ===
TORRENT: Torrent name: [filename]
TORRENT: Files in torrent: [Array]
TORRENT: Playing file: [filename.mp4]
```

## Common Issues

### Issue 1: "Client created" but torrent never added
**Cause**: WebTorrent can't connect to trackers or peers
**Solutions**:
- Check if your browser blocks WebRTC
- Try a different magnet link with more seeders
- Check browser console for WebRTC errors

### Issue 2: HLS "Video ref is null"
**Cause**: Video element not ready when useEffect runs
**Fix**: Added delay in code to wait for ref

### Issue 3: No peers connecting
**Check**:
1. Browser console Network tab - look for tracker connections
2. Check if magnet link has valid trackers
3. Try a popular torrent with many seeders

## Test with a Legal Public Domain Torrent

Try this Sintel trailer magnet (public domain, legal):

```
magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337
```

## Browser Compatibility

- **Chrome/Edge**: Full WebRTC support ✅
- **Firefox**: Full WebRTC support ✅
- **Safari**: Limited WebRTC, HLS native support ✅
- **Brave**: May block WebRTC by default ⚠️

## Check Network Tab

Look for:
- WebSocket connections to trackers
- STUN/TURN server connections
- Peer-to-peer connections (wrtc://)

## Current Status

Your app is now running with full console logging. Watch the console to see exactly where the torrent download gets stuck!
