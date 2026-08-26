/**
 * cctvVideoPolicy — pure decision helpers for the CCTV live-video paths.
 *
 * Everything here is DOM-free and side-effect-free so the reconnect ladder,
 * HLS engine choice, clip-refresh cadence, and panel badge state stay unit
 * testable without a browser. src/data/cctv.js (projection runtime) and
 * src/ui.js (panel player) consume these; keep behavior decisions here and
 * wiring there.
 */

/** First reconnect delay after a video error/stall. */
export const VIDEO_RETRY_BASE_MS = 2000;
/** Ceiling on the reconnect backoff. */
export const VIDEO_RETRY_MAX_MS = 30000;
/** Reconnect attempts before the placeholder + degraded health chip take over. */
export const VIDEO_RETRY_MAX_ATTEMPTS = 6;

/**
 * Bounded exponential backoff for video reconnects: 2s, 4s, 8s, 16s, 30s, 30s…
 *
 * @param {number} attempt - 1-based count of failures so far.
 * @returns {number} Delay in ms before the next reconnect.
 */
export function nextRetryDelayMs(attempt) {
  const n = Number(attempt);
  if (!Number.isFinite(n) || n <= 1) return VIDEO_RETRY_BASE_MS;
  return Math.min(VIDEO_RETRY_BASE_MS * 2 ** (n - 1), VIDEO_RETRY_MAX_MS);
}

/**
 * Whether another reconnect should be scheduled after this many failures.
 *
 * @param {number} attempt - 1-based count of failures so far.
 * @param {number} [maxAttempts=VIDEO_RETRY_MAX_ATTEMPTS]
 * @returns {boolean}
 */
export function shouldRetry(attempt, maxAttempts = VIDEO_RETRY_MAX_ATTEMPTS) {
  const n = Number(attempt);
  return Number.isFinite(n) && n >= 1 && n <= maxAttempts;
}

/**
 * Whether a 'stalled' media event should count as a failure. Mid-playback
 * fetch hiccups with buffered data ahead (readyState >= HAVE_FUTURE_DATA)
 * usually self-heal; treating them as failures would re-arm src and visibly
 * blip an otherwise-fine stream.
 *
 * @param {number} readyState - HTMLMediaElement.readyState at stall time.
 * @returns {boolean}
 */
export function stallIndicatesFailure(readyState) {
  const n = Number(readyState);
  return !Number.isFinite(n) || n < 3; // 3 = HAVE_FUTURE_DATA
}

/**
 * Choose the HLS playback engine from canPlayType's answer for
 * 'application/vnd.apple.mpegurl'. Safari answers 'maybe'/'probably' and
 * plays HLS natively (no hls.js chunk ever loads there); everything else
 * needs the lazily-imported hls.js MSE engine.
 *
 * @param {string} canPlayTypeResult - '' | 'maybe' | 'probably'.
 * @returns {'native'|'hlsjs'}
 */
export function hlsEngineFor(canPlayTypeResult) {
  const answer = String(canPlayTypeResult || '').toLowerCase();
  return answer === 'probably' || answer === 'maybe' ? 'native' : 'hlsjs';
}

/**
 * When a finite-clip camera (e.g. TfL JamCam ~10s MP4 loops) should have its
 * src re-armed so the loop tracks the provider's clip rotation. Returns null
 * for sources without a clipRefreshSec — continuous streams and plain MP4
 * packs never refresh (existing behavior).
 *
 * @param {number} lastSetAtMs - Epoch ms when src was last (re)set.
 * @param {number|undefined} clipRefreshSec - Catalog field, optional.
 * @returns {number|null} Epoch ms when a refresh is due, or null for never.
 */
export function clipRefreshDueAt(lastSetAtMs, clipRefreshSec) {
  const sec = Number(clipRefreshSec);
  const at = Number(lastSetAtMs);
  if (!Number.isFinite(sec) || sec <= 0 || !Number.isFinite(at)) return null;
  return at + sec * 1000;
}

/**
 * Whether a published feedType plays in a <video> element (mirrors the
 * layer-internal isVideoFeedType — mjpeg deliberately excluded, it renders
 * via <img>). Consumers outside the layer (the panel player in ui.js) use
 * this instead of reaching into cctv.js internals.
 *
 * @param {string} feedType - Normalized feed type off a published camera.
 * @returns {boolean}
 */
export function isVideoFeed(feedType) {
  const t = String(feedType || '').toLowerCase();
  return t === 'mp4' || t === 'webm' || t === 'hls';
}

/**
 * Panel media badge state for the active camera.
 *
 * @param {object} input
 * @param {boolean} input.isVideo - Active camera has a video feedType.
 * @param {boolean} input.playing - Panel <video> is actually playing.
 * @param {boolean} input.degraded - Health reports the feed degraded.
 * @returns {'still'|'connecting'|'live'|'degraded'} 'still' = keep the
 *   existing <img> path and badge untouched.
 */
export function panelMediaBadgeState({ isVideo, playing, degraded }) {
  if (!isVideo) return 'still';
  if (degraded) return 'degraded';
  return playing ? 'live' : 'connecting';
}
