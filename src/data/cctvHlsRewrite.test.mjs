import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CCTV_HLS_MANIFEST_MAX_BYTES,
  resolveHlsRelativeUrl,
  rewriteHlsManifest,
} from '../../vite.config.js';

const MANIFEST_URL = 'https://cams.example-dot.gov/feeds/cam42/playlist.m3u8';
const CAMERA = 'dot-ny-042';

test('relative segment URIs rewrite to the proxied /api/cctv/hls path', () => {
  const input = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    '#EXT-X-TARGETDURATION:6',
    '#EXTINF:6.000,',
    'seg_001.ts',
    '#EXTINF:6.000,',
    'chunks/seg_002.ts?token=abc',
    '#EXT-X-ENDLIST',
  ].join('\n');
  const out = rewriteHlsManifest(input, { cameraId: CAMERA, manifestUrl: MANIFEST_URL });
  const lines = out.split('\n');
  assert.equal(lines[4], `/api/cctv/hls/${CAMERA}/${encodeURIComponent('/feeds/cam42/seg_001.ts')}`);
  assert.equal(lines[6], `/api/cctv/hls/${CAMERA}/${encodeURIComponent('/feeds/cam42/chunks/seg_002.ts?token=abc')}`);
  // Non-URI tag lines pass through byte-identical.
  assert.equal(lines[0], '#EXTM3U');
  assert.equal(lines[1], '#EXT-X-VERSION:3');
  assert.equal(lines[2], '#EXT-X-TARGETDURATION:6');
  assert.equal(lines[3], '#EXTINF:6.000,');
  assert.equal(lines[7], '#EXT-X-ENDLIST');
});

test('same-origin absolute URIs are proxied; cross-origin segments drop with their EXTINF', () => {
  const input = [
    '#EXTM3U',
    '#EXTINF:6.0,',
    'https://cams.example-dot.gov/feeds/cam42/abs_seg.ts',
    '#EXTINF:6.0,',
    'https://evil.example.net/exfil.ts',
    '#EXTINF:6.0,',
    'ok_seg.ts',
  ].join('\n');
  const droppedUris = [];
  const out = rewriteHlsManifest(input, {
    cameraId: CAMERA,
    manifestUrl: MANIFEST_URL,
    onDrop: (uri) => droppedUris.push(uri),
  });
  assert.deepEqual(droppedUris, ['https://evil.example.net/exfil.ts']);
  assert.ok(!out.includes('evil.example.net'), 'cross-origin URI must not survive');
  const lines = out.split('\n');
  // The dropped segment took its #EXTINF with it: 3 EXTINF in, 2 out.
  assert.equal(lines.filter((l) => l.startsWith('#EXTINF')).length, 2);
  assert.equal(lines.filter((l) => l.startsWith('/api/cctv/hls/')).length, 2);
});

test('URI= attributes in EXT-X-KEY / EXT-X-MAP / EXT-X-MEDIA are rewritten', () => {
  const input = [
    '#EXTM3U',
    '#EXT-X-KEY:METHOD=AES-128,URI="keys/k1.bin",IV=0x9c7db8778570d05c3177c349fd9236aa',
    '#EXT-X-MAP:URI="init.mp4"',
    '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="en",URI="audio/en.m3u8"',
    '#EXTINF:6.0,',
    'seg.ts',
  ].join('\n');
  const out = rewriteHlsManifest(input, { cameraId: CAMERA, manifestUrl: MANIFEST_URL });
  assert.ok(out.includes(`URI="/api/cctv/hls/${CAMERA}/${encodeURIComponent('/feeds/cam42/keys/k1.bin')}"`));
  assert.ok(out.includes(`URI="/api/cctv/hls/${CAMERA}/${encodeURIComponent('/feeds/cam42/init.mp4')}"`));
  assert.ok(out.includes(`URI="/api/cctv/hls/${CAMERA}/${encodeURIComponent('/feeds/cam42/audio/en.m3u8')}"`));
  assert.ok(out.includes('IV=0x9c7db8778570d05c3177c349fd9236aa'), 'other attributes stay intact');
  // A cross-origin key server drops the whole tag line rather than leaking it.
  const withEvilKey = rewriteHlsManifest(
    '#EXT-X-KEY:METHOD=AES-128,URI="https://evil.example.net/key"',
    { cameraId: CAMERA, manifestUrl: MANIFEST_URL },
  );
  assert.ok(!withEvilKey.includes('EXT-X-KEY'));
});

test('master playlists: variant references rewrite and re-resolve against the variant base', () => {
  const master = [
    '#EXTM3U',
    '#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360',
    'variants/360p/index.m3u8',
  ].join('\n');
  const out = rewriteHlsManifest(master, { cameraId: CAMERA, manifestUrl: MANIFEST_URL });
  const variantRel = '/feeds/cam42/variants/360p/index.m3u8';
  assert.ok(out.includes(`/api/cctv/hls/${CAMERA}/${encodeURIComponent(variantRel)}`));

  // The /hls route later rewrites the nested variant with ITS url as base:
  const variantUrl = `https://cams.example-dot.gov${variantRel}`;
  const nested = rewriteHlsManifest('#EXTINF:2.0,\nseg7.ts', { cameraId: CAMERA, manifestUrl: variantUrl });
  assert.ok(nested.includes(encodeURIComponent('/feeds/cam42/variants/360p/seg7.ts')));
});

test('resolveHlsRelativeUrl enforces the registered-host boundary', () => {
  // Happy path: origin-absolute path with query, as the rewriter emits.
  assert.equal(
    resolveHlsRelativeUrl('/feeds/cam42/seg_001.ts?token=abc', MANIFEST_URL),
    'https://cams.example-dot.gov/feeds/cam42/seg_001.ts?token=abc',
  );
  // Refusals: schemes, protocol-relative, traversal, backslash, cross checks.
  assert.equal(resolveHlsRelativeUrl('https://evil.example.net/x.ts', MANIFEST_URL), null);
  assert.equal(resolveHlsRelativeUrl('//evil.example.net/x.ts', MANIFEST_URL), null);
  assert.equal(resolveHlsRelativeUrl('file:///etc/passwd', MANIFEST_URL), null);
  assert.equal(resolveHlsRelativeUrl('../../../etc/passwd', MANIFEST_URL), null);
  assert.equal(resolveHlsRelativeUrl('a/..\\..\\x', MANIFEST_URL), null);
  assert.equal(resolveHlsRelativeUrl('', MANIFEST_URL), null);
  assert.equal(resolveHlsRelativeUrl('seg.ts', 'ftp://cams.example-dot.gov/playlist.m3u8'), null);
  assert.equal(resolveHlsRelativeUrl('seg.ts', 'not a url'), null);
});

test('manifest size cap exists and is sane', () => {
  assert.ok(CCTV_HLS_MANIFEST_MAX_BYTES >= 256 * 1024, 'must tolerate large VOD playlists');
  assert.ok(CCTV_HLS_MANIFEST_MAX_BYTES <= 8 * 1024 * 1024, 'must stay un-OOM-able');
});
