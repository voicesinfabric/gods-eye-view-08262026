import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  VIDEO_RETRY_BASE_MS,
  VIDEO_RETRY_MAX_ATTEMPTS,
  VIDEO_RETRY_MAX_MS,
  clipRefreshDueAt,
  hlsEngineFor,
  nextRetryDelayMs,
  panelMediaBadgeState,
  shouldRetry,
  stallIndicatesFailure,
} from './cctvVideoPolicy.js';

test('video retry backoff is monotonic, starts at base, and caps at max', () => {
  assert.equal(nextRetryDelayMs(1), VIDEO_RETRY_BASE_MS);
  let prev = 0;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const delay = nextRetryDelayMs(attempt);
    assert.ok(delay >= prev, `delay must not shrink (attempt ${attempt})`);
    assert.ok(delay <= VIDEO_RETRY_MAX_MS, `delay must respect the cap (attempt ${attempt})`);
    prev = delay;
  }
  assert.equal(nextRetryDelayMs(100), VIDEO_RETRY_MAX_MS);
  // Garbage input degrades to the base delay, never NaN or a zero-spin.
  assert.equal(nextRetryDelayMs(Number.NaN), VIDEO_RETRY_BASE_MS);
  assert.equal(nextRetryDelayMs(-3), VIDEO_RETRY_BASE_MS);
});

test('retry ladder stops at the attempt cap', () => {
  assert.equal(shouldRetry(1), true);
  assert.equal(shouldRetry(VIDEO_RETRY_MAX_ATTEMPTS), true);
  assert.equal(shouldRetry(VIDEO_RETRY_MAX_ATTEMPTS + 1), false);
  assert.equal(shouldRetry(0), false);
  assert.equal(shouldRetry(Number.NaN), false);
  assert.equal(shouldRetry(3, 2), false, 'explicit cap wins');
});

test('a stall only counts as failure without buffered runway', () => {
  assert.equal(stallIndicatesFailure(0), true); // HAVE_NOTHING
  assert.equal(stallIndicatesFailure(2), true); // HAVE_CURRENT_DATA
  assert.equal(stallIndicatesFailure(3), false); // HAVE_FUTURE_DATA
  assert.equal(stallIndicatesFailure(4), false); // HAVE_ENOUGH_DATA
  assert.equal(stallIndicatesFailure(undefined), true, 'unknown state fails safe (retry)');
});

test('HLS engine selection: Safari-style answers go native, everything else hls.js', () => {
  assert.equal(hlsEngineFor('probably'), 'native');
  assert.equal(hlsEngineFor('maybe'), 'native');
  assert.equal(hlsEngineFor('Maybe'), 'native');
  assert.equal(hlsEngineFor(''), 'hlsjs');
  assert.equal(hlsEngineFor(undefined), 'hlsjs');
  assert.equal(hlsEngineFor('no'), 'hlsjs');
});

test('clip refresh is due only for sources that declare a cadence', () => {
  assert.equal(clipRefreshDueAt(1000, 60), 61000);
  assert.equal(clipRefreshDueAt(1000, undefined), null, 'no field → never refresh');
  assert.equal(clipRefreshDueAt(1000, 0), null);
  assert.equal(clipRefreshDueAt(1000, -5), null);
  assert.equal(clipRefreshDueAt(1000, 'sixty'), null);
  assert.equal(clipRefreshDueAt(Number.NaN, 60), null);
});

test('panel media badge state transitions', () => {
  assert.equal(panelMediaBadgeState({ isVideo: false, playing: false, degraded: false }), 'still');
  assert.equal(panelMediaBadgeState({ isVideo: false, playing: true, degraded: true }), 'still',
    'image cameras never enter the video badge machine');
  assert.equal(panelMediaBadgeState({ isVideo: true, playing: false, degraded: false }), 'connecting');
  assert.equal(panelMediaBadgeState({ isVideo: true, playing: true, degraded: false }), 'live');
  assert.equal(panelMediaBadgeState({ isVideo: true, playing: true, degraded: true }), 'degraded',
    'degraded health outranks apparent playback');
});
