# Changelog

This changelog records public product changes. For the authoritative description
of current runtime behavior, see [`docs/CURRENT-STATE.md`](docs/CURRENT-STATE.md).

## [Unreleased] — 2026-08-26

### Added

- Live video for the CCTV layer, opt-in end to end. The existing (previously
  dormant) `feedType: mp4|webm|hls` pipeline is now production-supported:
  source packs can register live HLS/MP4 cameras (`CCTV_SOURCES_FILE`, see
  `config/cctv_sources.dot-hls.example.json`), and `CCTV_TFL_VIDEO=1` upgrades
  TfL JamCams from stills to their published ~10s MP4 clips (stills remain the
  default; the still always stays the panel/frame snapshot).
- HLS playback everywhere: the media proxy rewrites playlists so every URI
  flows back through `/api/cctv/hls/<id>/…` (same-origin-only, traversal
  rejected; cross-origin URIs dropped), and the client lazily code-splits
  `hls.js` for browsers without native HLS — the chunk loads only when an HLS
  camera is activated. Safari plays natively and never loads it.
- Bounded reconnects for live video: a media error (or stall without buffered
  runway) re-arms the stream on an exponential 2s→30s backoff, capped at 6
  attempts, then falls back to the placeholder + degraded health chip.
- A bundled **U.S. DOT & federal live-camera pack** (batches 1–9 of an
  assisted web-research harvest; batch 3 was rejected wholesale as
  URL-less duplicates): 238 cameras —
  106 direct HLS streams (DelDOT 40, MoDOT 60, WisDOT 2, Nevada DOT 2,
  Louisiana DOTD 2) that play in-app through the HLS proxy, one Oregon
  TripCheck direct still (validation stripped a scraped template artifact
  from its URL), 10 NPS direct-still webcams (Rocky Mountain, Olympic,
  Crater Lake, Big Bend, Grand Canyon/Kolb Studio, Yellowstone/Mammoth —
  live refreshing frames in-app; a stale epoch cache-buster was stripped
  from the Big Bend URL), and 121 page-linked cameras: WSDOT I-5 ×43,
  USGS volcano webcams ×31 (Hawaiian Volcano Observatory Kīlauea/Mauna Loa
  + Yellowstone Volcano Observatory, public domain), Maryland CHART ×13
  (supplied without stream URLs and downgraded from the claimed video type
  rather than shipped broken), 511GA/AZ511/Alaska/Idaho 511/DriveNC, and
  NPS park webcams across 8 parks with per-camera nps.gov pages. Provider
  coordinates, per-entry attribution, cross-pack dedupe;
  `CCTV_USDOT_ENABLED=0` disables.
- Nationwide open-access camera packs: a live **NOAA NDBC BuoyCAM** loader
  (~82 offshore cameras from NDBC's published KML, direct public-domain
  `buoycam.php` JPEGs, station page as the live-feed link; `CCTV_NOAA_ENABLED=0`
  disables) and an **experimental, opt-in FAA WeatherCams** loader
  (`CCTV_FAA_ENABLED=1`; schema-defensive, origin-pinned image URLs, degrades
  to zero cameras with a console warning on any schema surprise). The default
  catalog cap rises 900 → 1200 (the existing hard bound) so the full built-in
  roster never truncates; the US live-webcam pack logs its load count like the
  city packs.
- A bundled U.S. live-webcam directory (`config/cctv_sources.us-live.json`,
  ~70 publicly published cameras: Ocean City MD, Corpus Christi TX, and
  place-specific marinas/lighthouses/main-street cams across ~25 states) loads
  as a fourth built-in CCTV pack (`CCTV_USLIVE_ENABLED=0` disables). Clicking
  one of these cameras surfaces an **ACCESS LIVE FEED ↗** action in the CCTV
  panel that opens the operator's own live player/portal in a new tab
  (https-only, `noopener`); IPCamLive cameras additionally serve in-app stills
  through the provider's snapshot endpoint via the existing frame pipeline.
  The new `pageUrl` catalog field carrying this is validated server-side and
  client-side and never fetched or framed by the app.

### Changed

- The CCTV catalog hard bound rises 1200 → 2400 and the default cap to
  1600, after auditing what scales with catalog size (terrain ground-prior
  batching is chunked at 200 points, coverage geometry is lazy, billboards
  are the only linear render cost); the proxy health map now derives from
  the hard bound so per-camera observability keeps covering the full
  catalog.
- The media proxy now bounds its connect phase (10s header timeout that never
  kills an established stream), caps concurrently open streams (4, surplus gets
  503), and cancels the upstream transfer when the client disconnects.
- `/api/cctv/frame` no longer hands a snapshot-less MJPEG stream URL to the
  still-image fetcher (it would hang until the timeout); like video feeds,
  MJPEG sources need a `snapshotUrl` for stills.
- `.env.example`'s CCTV block now documents the source-pack gate
  (`CCTV_FORCE_AUSTIN=1` coexistence), the new video flags, and the real
  default caps (250 Austin / 900 overall); two flags that no longer exist
  (`CCTV_AUTO_CALIBRATE`, `CCTV_DRAPE_MESH`) were removed from it.

## [Unreleased] — 2026-08-24

### Added

- Added honest aircraft identity narration: callsign, operator, registration,
  type, and route come only from selected-contact context, and missing operator,
  route, or type enrichment is named explicitly.
- Added local, publication-compatible copies of the two README PNGs, with source
  records and third-party-license boundaries in `docs/media/README.md`.
- Added regression coverage for aircraft identity narration and optional-key
  loading feedback.

### Changed

- First-run presentation now opens with Detection `DENSE` at 75%, `ELASTIC`
  allocation, Fade 7%, Outside 1%, scope feather 11%, and aircraft 3D models in
  `PROXIMITY`. Stored state and share links still override these baselines.
- The 17 selected README GIFs remain unchanged and are documented separately
  from the two owner-published PNGs.
- Bundled datacenter and dam snapshots now omit contact-oriented fields and
  note values containing email or phone identifiers. Feature geometry, names,
  operator/capacity/river metadata, counts, and ODbL terms are unchanged.
- Public documentation and the L9 release matrix no longer reference non-public
  planning material or repository history.

### Fixed

- A missing optional FIRMS key no longer turns the complete Environmental
  mission into `LOAD FAILED`. The FIRMS row still reports `KEY REQUIRED`, while
  earthquakes continue to load. Real lifecycle and fetch failures retain
  failure priority.
- The mapped-installations layer retries after an unavailable request when it is
  enabled or the camera settles.
- Aircraft trails attach to the rendered aircraft transform and remain near the
  rear center across headings. Parked aircraft do not draw a moving head
  segment.
- Grounded aircraft keep validated floor evidence through temporary terrain
  outages and wait for measured photoreal-surface evidence before a 3D model
  takes over from its billboard.
- Cockpit altitude uses aviation MSL data rather than Cesium render height.

### Security

- Production transitive dependencies resolve to patched DOMPurify and
  protobufjs releases without changing the Cesium version or application APIs.
- Production dependency audit reports no known advisories; remaining audit
  findings are confined to development and QA tooling.

## [Unreleased] — 2026-08-23

### Added

- Added a first-run mission launcher for Contacts, Space Missions,
  Environmental, and manual exploration.
- Added terrain-validity gating and bounded last-known placement for grounded
  aircraft models.

### Changed

- Environmental consistently presents both earthquakes and NASA FIRMS fires,
  with honest optional-key degradation.
- The tracked aircraft trail acceptance bar is visual: roughly rear-center,
  stable across headings, with minor hull overlap allowed and no conspicuous
  top, bottom, or lateral projection.

## [Unreleased] — 2026-08-18 to 2026-08-22

### Added

- Added the four-source Map Source tray, share-link v2 state, cockpit/context
  voice parity, MSL altitude readouts, and close-range tracked aircraft models.
- Added the L9 release-candidate matrix, AIS feed watchdog, voice cost controls,
  satellite classes, and the shared world-overlay host.
- Added deterministic first-run, map-source, floor, overlay, tracking, and
  aircraft-model regression harnesses.

### Changed

- Consolidated world labels, cards, tracked readouts, CCTV thumbnails, cable
  labels, mission labels, and detection presentation under shared allocation and
  lifecycle rules.
- Reduced idle rendering through the render governor and explicit scope mask.
- Improved cockpit layout, context restoration, keyless feed honesty, and
  aircraft 2D/3D handoffs.

### Fixed

- Fixed degenerate depth picks, map-source restore states, route-camera motion,
  bright-ground label readability, grounded display flooring, and cross-layer
  tracking cleanup.
- Fixed stale overlay callbacks, parked-idle render leaks, cable-label sweep
  starvation, and several share-link state conflicts.

## [Unreleased] — 2026-08-02 to 2026-08-16

### Added

- Added Global Context modes, Cockpit briefing surfaces, Radio context,
  satellite mission replay, and real per-class aircraft models with adjacent
  provenance records.
- Added a shared screen-space overlay system with bounded allocation for labels,
  cards, callouts, detection brackets, and selected-object presentation.

### Changed

- Unified right-side product controls and responsive cockpit/map layouts.
- Migrated public-safe neighborhood geometry to DataSF and tightened safe local
  development defaults.
- Improved proxy resilience, annotation outline bounds, CCTV enable pacing,
  contact de-emphasis, and deterministic visual stacking.

## [Unreleased] — July 2026

### Added

- Added live NASA FIRMS fires, optional live TomTom traffic, Caltrans and TfL
  CCTV packs, CCTV viewsheds and direct-manipulation calibration, citywide CCTV
  cards, Natural Earth regions, analyst queries, and voice routing QA.
- Added the end-to-end vertical-datum system for aircraft, vessels, CCTV,
  annotations, trails, and terrain-aware rendering.
- Added aircraft class silhouettes, path-derived display heading, ADSBDB
  enrichment, cached CelesTrak TLE lookup, and next-ISS-pass prediction.

### Fixed

- Fixed elevated-airport aircraft placement, vessel sea-surface placement,
  close-zoom FIRMS anchors, antimeridian region framing, annotation resolution,
  cross-layer tracking ownership, and CCTV projection lifecycle issues.

## [Unreleased] — June 2026

### Added

- Added OpenAI Realtime voice control, scene-aware entity context, viewport image
  grounding, the AI HUD summary, live AIS vessels, infrastructure layers, map
  source switching, free-text navigation, and server-side data proxies.
- Added hybrid map annotations, 3D aircraft, panoptic detection, tracking
  harnesses, and public data attribution.
- Added MIT source licensing, security guidance, contribution guidance, data
  source notices, and third-party asset boundaries.

### Changed

- Removed the experimental AI video-edit style and retained seven deterministic
  visual styles.
- Moved Realtime text-history trimming to the server-side retention policy while
  keeping only the latest viewport image in conversation context.

## [0.7.0] — 2026-02-18

- Added the Bikeshare Pulse layer and panoptic label improvements.
- Improved tracked-item boxes, post-render alignment, and CCTV projection
  quality.
- Removed the experimental shift-drag CCTV calibration interaction.

## [0.6.0] — 2026-02-10

- Added the initial multi-layer 3D globe experience, visual styles, live
  aircraft, satellites, earthquakes, CCTV, traffic, FIRMS, infrastructure, and
  performance controls.
- Added entity inspection, tracking, scenes, keyboard controls, and shareable
  views.

## [0.1.0] — 2026-02-09

- Initial project version.
