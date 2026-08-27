# Data Sources & Attribution

God's Eye View's **code** is [MIT](LICENSE)-licensed. **The MIT grant covers the source code only — it does NOT extend to third-party data or visual assets.** Every third-party source keeps its own license and terms. This file documents the live and bundled data sources; bundled 3D-model provenance is recorded in [`public/models/README.md`](public/models/README.md).

How to read this:

- **The non-permissive datasets are carved out, not omitted.** Some bundled data (e.g. TeleGeography, CC BY-NC-SA) isn't MIT-compatible. Rather than hide it, we **bundle it with a clear license carve-out** so the app works out of the box — but it stays under the provider's terms.
- **If your use doesn't fit a dataset's license, remove that dataset.** Most importantly: TeleGeography is **NonCommercial** — commercial users must delete it (or license it from TeleGeography). It's one self-contained folder.
- **Attribution is shown in-app** and listed here. Keep it intact. The required Google/Cesium credit renders on the on-globe credit line (bottom-left, `#cesium-credits`), and every per-layer credit below is registered into the expandable **"Data attribution"** lightbox on that line (`src/data/dataCredits.js` → `viewer.creditDisplay.addStaticCredit`). Both stay visible in clean-view and recording modes.
- **Bundled model attribution lives beside the model files.** [`public/models/README.md`](public/models/README.md) records each shipped model's creator, source, license, and modification status.
- **README media provenance lives beside the media.** [`docs/media/README.md`](docs/media/README.md) records the creator and likeness permissions for the 17 capture GIFs, plus the public source, publication permission, and reuse boundary for the two README PNGs. Third-party content visible within this media remains subject to its provider or owner's terms.

---

## Live sources (fetched at runtime — not stored in this repo)

| Source | Used for | License / terms | Attribution |
|--------|----------|-----------------|-------------|
| **Google Map Tiles API** (Photorealistic 3D Tiles) + Places/Geocoding | The 3D globe, voice scene context, and on-demand nearby installation search | Google Maps Platform ToS (proprietary, your own key + billing) | "Google" / "Google Maps" logo — **shown in-app**, required |
| **OpenSky Network** | Primary worldwide live-flight snapshot | Non-commercial research/education license | Schäfer et al., *"Bringing Up OpenSky"*, IPSN 2014 + opensky-network.org |
| **adsb.lol point API** | Bounded live-flight fallback when OpenSky has no usable snapshot | ODbL 1.0 | adsb.lol contributors; `api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/{radius}` |
| **adsb.lol** | Military flights + aircraft traces | ODbL 1.0 | "adsb.lol" (ODbL) |
| **AISStream.io** | Live vessels (AIS) | Free, beta, no formal ToS; AIS is a public broadcast | "AISStream.io" (courtesy) |
| **CelesTrak** | Satellite TLEs (SGP4) | US-government-origin data, no license; citation requested | "CelesTrak (celestrak.org), Dr. T.S. Kelso" |
| **The Space Devs — Launch Library 2 v2.3** | Recent launch, payload, stage, and recovery metadata for Space Missions (30d) | [The Space Devs terms of use](https://github.com/TheSpaceDevs/Tutorials/blob/main/faqs/faq_TSD.md#terms-of-use): data may be used and shared in any form; avoid forwarding it without added value; attribution is encouraged (not mandatory). [Official API limits](https://ll.thespacedevs.com/docs/): 15 unauthenticated calls/hour; optional token | "Launch Library 2 — The Space Devs" (courtesy attribution) |
| **USGS** | Earthquakes | U.S. public domain | "Data courtesy of the U.S. Geological Survey" |
| **OpenStreetMap (Overpass API)** | Road geometry for traffic | ODbL 1.0 | "© OpenStreetMap contributors" |
| **TomTom Traffic API** (flow vector tiles) | Live congestion coloring for the traffic layer (optional, BYOK) | [TomTom for Developers terms](https://developer.tomtom.com) (proprietary, your own key; quotas depend on the current account plan) | "Traffic flow data © TomTom" — registered when live mode activates |
| **OpenStreetMap (Overpass API)** | Viewport-bounded mapped installation context for Global Context | ODbL 1.0 | "© OpenStreetMap contributors" (incomplete mapped context) |
| **OpenStreetMap (Nominatim)** | Reverse-geocoded place label in the cockpit Local Info page | ODbL 1.0 + Nominatim usage policy | "© OpenStreetMap contributors" |
| **Open-Meteo** | Current weather in the cockpit Local Info page and cockpit-local dynamic atmospheric effects | [CC BY 4.0 data licence and adjacent-link attribution requirement](https://open-meteo.com/en/licence) | Linked "Weather data by Open-Meteo.com" beside the displayed local data |
| **Google News RSS** | Primary locality-matched headlines in the cockpit Regional News page | [Google News Terms of Service](https://www.google.com/intl/en_us/terms_google_news.html) restrict use to personal, noncommercial use; linked articles remain third-party publisher content and retain publisher terms | "Google News RSS" plus each article's linked publisher/domain |
| **GDELT Project DOC 2.0** | Fail-soft fallback for location-matched cockpit headlines | [GDELT Terms of Use](https://www.gdeltproject.org/about.html#termsofuse): unrestricted academic/commercial/governmental dataset use, with citation and link required; linked articles retain publisher terms | "GDELT Project" plus each article's linked publisher/domain |
| **City of Austin Open Data** | CCTV camera catalog + frames | City of Austin Open Data Terms of Use | "City of Austin, TX — data.austintexas.gov" |
| **Caltrans (cwwp2.dot.ca.gov)** | CCTV camera catalogs + frames, California districts | Public Caltrans traffic camera data | "Caltrans — cwwp2.dot.ca.gov" (courtesy) |
| **TfL Open Data (JamCams)** | CCTV camera catalog + frames, London (opt-in `CCTV_TFL_VIDEO=1`: their published ~10s MP4 clips from the same bucket) | [TfL Open Data terms](https://tfl.gov.uk/info-for/open-data-users/) — attribution REQUIRED | "Powered by TfL Open Data. Contains OS data © Crown copyright and database rights" |
| **U.S. live-webcam directory** (bundled `config/cctv_sources.us-live.json`) | ~70 publicly published webcams (municipal, tourism, marina, small-business operators) as CCTV locations with an ACCESS LIVE FEED action; IPCamLive cameras also serve in-app stills via the provider's snapshot endpoint | Each feed remains the publishing operator's; per-entry `provider` + courtesy `license` note in the pack | Panel shows the operator per camera; "U.S. live webcams: municipal, tourism & local operators" |
| **U.S. DOT & federal live-camera pack** (bundled `config/cctv_sources.us-dot-live.json`) | 207 cameras — 106 direct HLS streams (DelDOT ×40, MoDOT, WisDOT, Nevada DOT, Louisiana DOTD), 11 direct still images (ODOT TripCheck + 10 NPS webcams: Rocky Mountain, Olympic, Crater Lake, Big Bend, Grand Canyon, Yellowstone), and 90 page-linked cameras (WSDOT I-5 ×43, Maryland CHART, 511GA, AZ511, Alaska 511, Idaho 511, DriveNC, and NPS park webcams across 8 parks) — with ACCESS LIVE FEED to each operator's own system | Public-courtesy traveler information / NPS federal content; per-entry provider + attribution note in the pack (ODOT permits public use with credit; Maryland requires acknowledging the State; Yosemite imagery is partner-credited, not presumed public domain) | Panel shows the operator per camera; "State DOT traffic cameras" + NPS credit lines |
| **NOAA NDBC BuoyCAMs** | ~82 offshore buoy cameras nationwide (Atlantic, Pacific, Gulf, Great Lakes, Hawaii, Alaska) — live station list from NDBC's BuoyCAM KML, direct `buoycam.php` JPEG stills, station page as the live-feed link | U.S. government work, public domain; images update ~every 10 min in daylight | "NOAA National Data Buoy Center — BuoyCAMs" |
| **FAA WeatherCams** (opt-in `CCTV_FAA_ENABLED=1`, experimental) | FAA aviation weather cameras (dense Alaska + expanding national coverage) with direct image endpoints, when the schema-defensive loader recognizes the API's current shape | U.S. government work, public domain | "FAA Weather Camera Program" (registered only when cameras load) |
| **GBFS (Lyft / BCycle)** | Bikeshare availability | Per-feed (attribution-only) | Credit the operator (e.g. Austin BCycle) + its `license_url` |
| **Radio Browser** | Geolocated internet-radio station directory and station-level tags | Public-domain directory data under PDDL 1.0; individual broadcaster stream terms apply | "Radio Browser" plus a link to the selected broadcaster |
| **Re:Earth Terrain** (Mapterhorn) | Terrain (keyless globe stacks — OSM etc. — + `/api/terrain/heights` ellipsoidal-height lookups) | Terrain mesh: CC BY 4.0; geoid: EGM2008 (NGA, public domain) | "Terrain (keyless globe stacks): Re:Earth Terrain / Mapterhorn (CC BY 4.0) / EGM2008 (NGA)" |

### Notes on the live sources

- **Google Maps Platform.** You supply your own API key and are bound by [Google's ToS](https://cloud.google.com/maps-platform/terms). Google Maps Content (tiles, geocodes, places) **may not be cached, stored, rehosted, or committed** — this app only ever uses it live, which is the compliant pattern. The "Google" attribution is displayed on the globe and must stay visible. Restrict your key (see [SECURITY.md](SECURITY.md)).
- **OpenSky Network.** Its license is **non-commercial**, and operational use of the REST API in a live product can require a prior written agreement with OpenSky — even for non-profit/government use. If you deploy this commercially, contact OpenSky for your own terms. The flights layer is a toggle and runs anonymously by default.
- **adsb.lol flight fallback.** When OpenSky is unavailable and no last-good OpenSky response exists, the server requests a cached, capped 250 nm adsb.lol point snapshot around the current camera subpoint. This is regional observed context, not worldwide completeness; provenance is exposed in the Flights stats/context row. Military ICAOs remain reconciled through the existing dedicated military registry rather than duplicated.
- **Launch Library 2.** `/api/launches` makes a server-side rolling-30-day query against the supported v2.3 detailed launch endpoint, caches successful responses for 15 minutes in memory and on disk, and serves the last successful response during a throttle or transient outage. Anonymous access is limited to 15 calls/hour; deployments can provide `LL2_API_TOKEN` for authenticated access. The Space Devs' published terms permit using and sharing the API data in any form, ask users not to forward it without adding value, disclaim complete accuracy, and encourage—but do not require—attribution. This app keeps a courtesy credit. Payload and stage/recovery records are shown only when supplied. Failed launches expose their source status and never receive fallback orbit geometry or a live/estimated marker. LL2 supplies launch context and event timing, not continuous ascent telemetry or live orbital state.
- **TfL JamCams.** The camera list comes from the keyless `api.tfl.gov.uk` endpoint (an optional `TFL_APP_KEY` raises its rate limit); frames come from TfL's public S3 bucket. Stills remain the default; `CCTV_TFL_VIDEO=1` opts cameras into the ~10s MP4 clips TfL publishes alongside each frame in the same official bucket (clip URLs are origin-pinned like frames, the still stays the snapshot/preview, and clips re-arm about once a minute per active camera). The "Powered by TfL Open Data" attribution is required by TfL's terms, applies equally to frames and clips, and is registered in the Data attribution popover.
- **Bundled U.S. live-webcam directory.** `config/cctv_sources.us-live.json` registers ~70 publicly published webcams curated 2026-08-26 from an operator-verified feed audit — Ocean City MD boardwalk/municipal cameras, Corpus Christi city beach cameras, Maryland CHART traffic video, NASA's ISS stream, and ~37 place-specific cameras (marinas, lighthouses, small-town main streets) across ~25 states and territories. Loaded by default like the city packs (`CCTV_USLIVE_ENABLED=0` disables; a custom `CCTV_SOURCES_FILE` replaces it under the usual gate). Two access paths, both honest about what they are: (1) IPCamLive cameras carry the provider's documented snapshot endpoint, so they behave like every other still camera in-app (snapshot availability is graceful — failures fall through the normal frame chain); (2) every camera exposes **ACCESS LIVE FEED**, which opens the operator's own live player/portal page **in a new browser tab** — GEV never fetches, frames, proxies, or rehosts those pages, so each operator's own terms, ads, and analytics apply on their site. Camera positions are curated approximations (calibrate with the gizmo); the ISS stream is anchored at NASA Johnson Space Center for map access since the platform itself is orbital (the Satellites layer tracks the real ISS).
- **Bundled U.S. DOT live-camera pack.** `config/cctv_sources.us-dot-live.json` (batch 1 of an assisted web-research harvest, compiled 2026-08-26) registers 100 cameras from official state DOT / 511 traveler-information systems: 25 DelDOT + 60 MoDOT + 2 WisDOT + 2 Nevada DOT + 2 Louisiana DOTD direct **HLS streams** (played through the app's rewriting HLS proxy), one Oregon TripCheck direct still (ODOT permits public use with the credit "Camera courtesy of ODOT"; a scraped template artifact was stripped from its URL during validation), and page-linked cameras (511GA, AZ511, Alaska 511, DriveNC municipalities, one NPS webcam, and — from batch 2 — 13 Maryland CHART cameras whose research rows carried provider coordinates but no per-camera stream URL, so they were downgraded from the claimed video type rather than shipped broken) that expose ACCESS LIVE FEED only. Every entry passed https/no-credential/coordinate validation and cross-pack dedupe; media URLs follow each system's published streaming pattern and per-entry liveness was checked during research, but DOT streams rotate — the per-camera health chips and bounded reconnects absorb any that go dark, and `CCTV_USDOT_ENABLED=0` disables the pack. Nevada stream ids are provider-assigned GUIDs flagged as rotation-prone in their entries.
- **NOAA BuoyCAMs & FAA WeatherCams (live U.S. government packs).** `loadNoaaBuoycamSources()` fetches NDBC's published BuoyCAM KML (station names + coordinates) once per catalog refresh and registers each station's documented direct-image endpoint (`buoycam.php?station=…`, per NDBC's own FAQ) plus its station page as the ACCESS LIVE FEED link — public-domain U.S. government imagery, ~82 offshore cameras, `CCTV_NOAA_ENABLED=0` disables. `loadFaaWeathercamSources()` is **experimental and off by default** (`CCTV_FAA_ENABLED=1` enables): the FAA camera API's exact schema is not pinned, so the loader recognizes several plausible shapes, origin-pins every image URL to `weathercams.faa.gov`, and degrades to zero cameras with one console warning on any surprise. Both load under the same built-in gate as the city packs and fail independently.
- **Live-video source packs (operator-supplied).** `CCTV_SOURCES_FILE` / `CCTV_SOURCES_JSON` packs may register live HLS/MP4 cameras (see `config/cctv_sources.dot-hls.example.json` — an unreferenced, verify-before-use template shaped for US state DOT / 511 traffic streams; nothing loads it by default and its example URLs are NOT live-verified). Whoever configures a pack is the data operator for it: use only streams published for public consumption, verify each URL and the provider's current terms, record `provider` + `license` on every entry, add a matching credit line (`src/data/dataCredits.js`) for any pack you ship to others, and give every video entry a `snapshotUrl` still (without one, `/api/cctv/frame` falls through to the metered Street View fallback). Video bytes are piped live through the server-side media proxy per explicit camera activation and are never cached, recorded, or redistributed (relay posture + bounds in [SECURITY.md](SECURITY.md)).
- **Radio Browser.** `/api/radio/stations` discovers official API mirrors, makes bounded and coalesced healthy/geolocated HTTPS-station queries, caches the normalized public-domain directory for 45 minutes, and may serve the last good catalog for up to seven days during an outage. Refreshes must meet minimum accepted-query and station coverage before replacing a warm catalog; schema-valid responses whose rows all fail the product's health policy do not count as successful queries. A usable partial cold catalog is explicitly `DEGRADED`, and malformed or empty successful payloads are rejected atomically. Every directory and click-count request rejects redirects, validates all resolved addresses as globally routable (including reserved/documentation IPv4 and special/non-global IPv6 exclusions), and pins the TLS connection to a validated address. Only MP3/AAC non-HLS directory rows with public HTTPS stream targets are returned; favicons are intentionally omitted. Pressing play connects one browser audio element directly to the selected broadcaster and calls the directory's click counter through known-ID-only `POST /api/radio/click/:uuid`. GEV never proxies, caches, records, bundles, or redistributes audio. Radio Browser supplies station-level tags, not dependable current-song or upcoming-program metadata, so Radio filtering never claims either. Direct playback exposes the listener's IP address to the broadcaster, whose own stream terms apply.
- **TomTom Traffic.** Optional and BYOK: without `TOMTOM_API_KEY` the traffic layer runs its built-in simulation and no TomTom data (or attribution) appears. With a key, flow vector tiles are fetched through the server-side `/api/tomtom` proxy (120 s cache + a configurable daily tile-budget governor, default 40,000 requests) and the "Traffic flow data © TomTom" credit is registered in the Data attribution popover the moment live mode activates. Set that governor within the current allowance for your TomTom account; the application default is a safety limit, not a promise of free quota. TomTom data is served live and cached only transiently (≤120 s TTL under `.gev-cache/`, gitignored) — it is not bundled or redistributed. One 23 KB point-in-time tile snapshot is committed as a decode-test fixture (`src/data/fixtures/`, © TomTom, never served to the app).
- **Re:Earth Terrain.** Keyless (no API key). Used two ways: (1) `src/mapStackController.js` swaps in a `Cesium.CesiumTerrainProvider` pointed at Re:Earth's `cesium-mesh/ellipsoid` quantized-mesh endpoint for globe stacks without a Cesium ion token (e.g. OSM), replacing a flat `EllipsoidTerrainProvider`; falls back to the flat provider if the endpoint can't be reached. (2) The server-side `/api/terrain/heights` proxy (disk-cached, serve-stale) resolves per-point ellipsoidal ground height for entity placement. Both are best-effort with a keyless-safe fallback (bundled EGM96 geoid math) if Re:Earth is unreachable.
- **Global Context installation context.** `/api/military-installations` queries only an allow-listed subset of OSM `military=*` and `landuse=military` features inside a maximum 10° non-dateline viewport. It caches and may serve stale mapped context, but it is neither a global installation database nor evidence of capability, activity, or absence. User-requested Google Places results remain separately sourced candidates unless their returned types explicitly establish military classification; generic offices, museums, and similarly ambiguous matches are excluded from military proximity counts.
- **Cockpit regional briefing.** `/api/regional-brief` rounds aircraft coordinates into 0.1° cache cells, caches results for five minutes, and serializes Nominatim calls at no more than one request per second. Google News RSS is queried with the resolved locality/region first; GDELT is used only when that RSS query fails or is empty. Google's published Google News terms restrict that source to personal, noncommercial use, so commercial deployments must disable/replace it or obtain separate permission; GDELT permits commercial dataset use with citation. The Data attribution popover identifies the active headline sources; article links retain publisher attribution. Headlines are location-query matches, not verified incidents, risk rankings, or evidence that a location is safe. Empty, partial, stale, and unavailable source states remain distinct. Open-Meteo supplies current conditions independently of the news source. `WX OFF` disables cockpit weather rendering only; the Local Info briefing still fetches its source-backed weather values and displays the required linked Open-Meteo credit.
- **Dynamic weather presentation.** While cockpit mode is active, `/api/weather-effects` requests current Open-Meteo observations for the aircraft/camera location, rounds coordinates into 0.1° cache cells, caches results for five minutes, and may retain a stale observation for up to 30 minutes during a transient outage. WMO condition code selects the visual family; observed cloud cover, precipitation, visibility, wind speed, and wind direction bound its strength and motion. Missing or expired weather renders no synthetic atmospheric effect, and normal globe view never renders the weather overlay.

---

## Bundled snapshots (committed under `src/data/local_data/`)

Static datasets shipped in the repo for an out-of-the-box experience. **None are MIT** — each keeps its own license (see the carve-out in [LICENSE](LICENSE)). Each folder also has its own provenance README.

| Dataset | Folder | License | Commercial use? | Attribution |
|---------|--------|---------|-----------------|-------------|
| **Datacenters** (~4.3K) | `datacenters/` | **ODbL 1.0** (OpenStreetMap extract) | ✅ (attribution + share-alike on data) | "© OpenStreetMap contributors" |
| **Dams** (704) | `dams/` | **ODbL 1.0** (OpenInfraMap / OSM extract) | ✅ (attribution + share-alike on data) | "© OpenStreetMap contributors" (+ Open Infrastructure Map) |
| **TeleGeography Submarine Cable Map** (712 cables + 1,917 landing points) | `telegeography_submarine_cables/` | **CC BY-NC-SA 3.0** | ❌ **NonCommercial — remove for commercial use** | "© TeleGeography — submarinecablemap.com" |
| **Natural Earth physical regions** (1,046 land + 292 marine named polygons) | `natural_earth/` | **Public domain** | ✅ (no restrictions) | "Made with Natural Earth" (courtesy credit — not legally required) |
| **DataSF Analysis Neighborhoods** (41 SF neighborhood polygons) | `neighborhoods/` | **PDDL 1.0** (public domain) | ✅ (no restrictions) | "City & County of San Francisco — DataSF" (courtesy — not legally required) |

### ⚠️ TeleGeography is bundled but NonCommercial

The submarine-cable GeoJSON is **CC BY-NC-SA 3.0** (Attribution-**NonCommercial**-**ShareAlike**). It is bundled so the cables layer works out of the box, but it is **not covered by this project's MIT license**. CC BY-NC-SA permits redistribution with attribution and share-alike — which is exactly how it ships here — but the **NonCommercial** clause means:

> If you use God's Eye View commercially, delete `src/data/local_data/telegeography_submarine_cables/` (or obtain a commercial license from TeleGeography). It is one self-contained folder; the rest of the app runs without it.

The richer structured dataset is licensed separately/commercially by TeleGeography.

### ODbL share-alike (datacenters, dams)

The OSM-derived datasets are under the **Open Database License**. ODbL's share-alike applies to the **data / derived database, not this MIT-licensed code** — the two coexist (exactly how Open Infrastructure Map ships: MIT software + ODbL data). If you publicly distribute a *modified* version of these databases, you must offer it under ODbL. Keep the "© OpenStreetMap contributors" notice (link: https://www.openstreetmap.org/copyright).

The bundled public-release copies omit contact-oriented tags and any note value
that contains an email or phone identifier. Those fields are not used by the
application. This privacy transform does not change feature geometry, identity,
name, operator, capacity, or river metadata, and the resulting derived databases
remain under ODbL 1.0.

### NASA FIRMS acknowledgement

> We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS) (https://earthdata.nasa.gov/firms), part of NASA's Earth Observing System Data and Information System (EOSDIS).

FIRMS active fires are **fetched live at runtime** (CC0 / U.S. public domain data): the
`/api/firms` server-side proxy merges the three VIIRS NRT sources (NOAA-20, NOAA-21,
Suomi-NPP) clamped to the trailing 24 h, cached 30 min to respect the shared MAP_KEY
transaction quota. Requires a free `FIRMS_MAP_KEY`
(https://firms.modaps.eosdis.nasa.gov/api/map_key/); the layer is empty without it.
The former bundled 2026-05-25 snapshot was removed 2026-07-16.

### Natural Earth physical regions (`natural_earth/`)

Curated from the **Natural Earth 10m physical vectors** (https://www.naturalearthdata.com/ —
fetched from the canonical `nvkelso/natural-earth-vector` GitHub repo, commit
`ca96624a56bd078437bca8184e78163e5039ad19`, 2026-07-28): `ne_10m_geography_regions_polys`
(mountain ranges, deserts, plateaus, peninsulas, islands, …) → `regions.json` and
`ne_10m_geography_marine_polys` (seas, gulfs, straits, bays) → `marine.json`. They back the
voice-annotation resolver's named-natural-region lookup (`src/data/naturalEarthRegions.js`),
so "outline the Alps" draws the real range polygon offline.

Curation (provenance in each file's `meta` header): named features only, outer rings only,
Douglas-Peucker simplified at ~0.01° with coordinates rounded to 3 decimals, sub-20 km²
MultiPolygon crumbs and zero-area sliver artifacts dropped (7.3 MB source → 2.5 MB pack).

Natural Earth is **public domain** (no permission needed, no attribution legally required —
https://www.naturalearthdata.com/about/terms-of-use/). We credit anyway: "Made with Natural
Earth". Registration in the in-app `dataCredits.js` attribution list ships with the resolver
wiring (see below).

### DataSF Analysis Neighborhoods (`neighborhoods/`)

`neighborhoods/san-francisco.json` bundles the City & County of San Francisco's official
**"Analysis Neighborhoods"** dataset (41 neighborhood polygons; DataSF dataset `j2bu-swwd`,
catalog map view
[`p5b7-5n3h`](https://data.sfgov.org/Geographic-Locations-and-Boundaries/Analysis-Neighborhoods-Map/p5b7-5n3h)).
It backs the voice-annotation resolver's offline neighborhood-boundary lookup
(`src/data/neighborhoodPolygons.js`), so "outline Chinatown" draws the city's real
boundary polygon with no network dependency.

The dataset is licensed **PDDL 1.0** (Open Data Commons Public Domain Dedication and
License — public domain; the DataSF metadata declares `licenseId: "PDDL"`). No attribution
is legally required; we note the source here and in the folder's `SOURCE.md`, which records
the retrieval date (2026-07-30), exact download URL, license evidence, and the
deterministic transform (`scripts/build-sf-neighborhoods.mjs`: `nhood` → `name`, ~2 m
Douglas-Peucker simplification, 6-decimal rounding).

---

## In-app attribution

The required Google Maps / Cesium credit renders on the on-globe credit line (`#cesium-credits`, bottom-left) and must stay visible — including in clean-view and recording modes (the whole line, logo + "Google Maps" + the "Data attribution" link, stays on screen; only the GEV panels/HUD fade). The layer-specific credits (adsb.lol, TeleGeography, OSM datacenters/dams/roads, NASA FIRMS, CelesTrak, USGS, City of Austin, GBFS, Radio Browser, OpenSky, AISStream) are registered into the expandable **"Data attribution"** popover on that credit line via `viewer.creditDisplay.addStaticCredit(new Cesium.Credit(html, /* showOnScreen */ false))` — see `src/data/dataCredits.js`. When you add a new data source, add its license and attribution to this file **and** append an entry to `DATA_CREDITS` in `src/data/dataCredits.js` so it surfaces in the app.
