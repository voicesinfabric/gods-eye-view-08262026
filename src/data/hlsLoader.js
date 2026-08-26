/**
 * Shared lazy loader for hls.js — the only media dependency in the bundle.
 *
 * Same dynamic-import idiom as geoid.js: Vite code-splits the ~190KB-gzipped
 * chunk out of the eager main bundle, and the single cached promise means it loads at
 * most once per session, on the first HLS camera activated in a browser
 * without native HLS support (Safari plays natively and never loads it).
 * Both consumers — the projection runtime (src/data/cctv.js) and the CCTV
 * panel player (src/ui.js) — share this loader so there is exactly one chunk
 * and one in-flight import.
 */
let _hlsJsModulePromise = null;

/** @returns {Promise<typeof import('hls.js')['default']>} */
export function loadHlsJs() {
  if (!_hlsJsModulePromise) {
    _hlsJsModulePromise = import('hls.js').then((mod) => mod?.default || mod);
  }
  return _hlsJsModulePromise;
}
