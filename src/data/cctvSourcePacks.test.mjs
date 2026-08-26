import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { frameUpstreamCandidate, normalizeSourceItem } from '../../vite.config.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PACKS = [
  'config/cctv_sources.shinjuku.json',
  'config/cctv_sources.dot-hls.example.json',
];

function loadPack(rel) {
  const parsed = JSON.parse(readFileSync(path.join(repoRoot, rel), 'utf8'));
  assert.ok(Array.isArray(parsed), `${rel} must be a JSON array`);
  // Pseudo-entries (leading _comment docs blocks) carry no id — the server
  // loader skips them the same way (normalizeSourceItem yields id '').
  return parsed.filter((item) => item && typeof item === 'object' && String(item.id || '').trim());
}

test('bundled CCTV source packs are shaped for the video pipeline', () => {
  for (const rel of PACKS) {
    const entries = loadPack(rel);
    assert.ok(entries.length >= 2, `${rel} should carry at least two real entries`);
    const seen = new Set();
    for (const raw of entries) {
      const s = normalizeSourceItem(raw);
      assert.ok(s.id, `${rel}: entry must keep a non-empty id`);
      assert.ok(!seen.has(s.id), `${rel}: duplicate id ${s.id}`);
      seen.add(s.id);
      assert.ok(Number.isFinite(s.lat) && s.lat >= -90 && s.lat <= 90, `${rel}:${s.id} lat`);
      assert.ok(Number.isFinite(s.lon) && s.lon >= -180 && s.lon <= 180, `${rel}:${s.id} lon`);
      assert.match(s.url, /^https:\/\//, `${rel}:${s.id} url must be https`);
      assert.ok(s.license, `${rel}:${s.id} must record its license/terms provenance`);
      assert.ok(s.provider, `${rel}:${s.id} must name a provider`);

      if (s.feedType === 'hls' || s.feedType === 'mp4' || s.feedType === 'webm' || s.feedType === 'mjpeg') {
        if (rel.includes('dot-hls')) {
          assert.match(s.snapshotUrl, /^https:\/\//,
            `${rel}:${s.id} video entries must carry a snapshotUrl still — without one `
            + '/frame falls through to the metered Street View fallback');
        }
        if (!s.snapshotUrl) {
          assert.equal(frameUpstreamCandidate(s), '',
            `${rel}:${s.id} snapshot-less stream must never reach the still fetcher`);
        }
      }
    }
  }
});

test('normalizeSourceItem round-trips the video-relevant fields without loss', () => {
  const entry = loadPack('config/cctv_sources.dot-hls.example.json')[0];
  const s = normalizeSourceItem(entry);
  assert.equal(s.feedType, 'hls');
  assert.equal(s.url, entry.url);
  assert.equal(s.snapshotUrl, entry.snapshotUrl);
  assert.equal(s.poseSource, 'curated');
  // clipRefreshSec: absent stays absent; declared survives numerically.
  assert.equal(s.clipRefreshSec, undefined);
  assert.equal(normalizeSourceItem({ ...entry, clipRefreshSec: 60 }).clipRefreshSec, 60);
  assert.equal(normalizeSourceItem({ ...entry, clipRefreshSec: 'sixty' }).clipRefreshSec, undefined);
  assert.equal(normalizeSourceItem({ ...entry, clipRefreshSec: -5 }).clipRefreshSec, undefined);
});

test('shinjuku pilot pack still exercises the plain-MP4 (non-HLS) path', () => {
  const entries = loadPack('config/cctv_sources.shinjuku.json');
  assert.ok(entries.every((e) => normalizeSourceItem(e).feedType === 'mp4'),
    'the smoke-test pack must keep covering direct <video> src playback');
});
