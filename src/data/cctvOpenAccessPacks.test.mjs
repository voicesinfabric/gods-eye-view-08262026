import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractFaaWeathercamEntries, parseBuoycamKml } from '../../vite.config.js';

const BUOYCAM_KML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document>
<Placemark>
  <name><![CDATA[Station 42001 - MID GULF]]></name>
  <description><![CDATA[<a href="https://www.ndbc.noaa.gov/station_page.php?station=42001">details</a>]]></description>
  <Point><coordinates>-89.668,25.897,0</coordinates></Point>
</Placemark>
<Placemark>
  <name>Station 51101 (Northwest Hawaii)</name>
  <Point><coordinates>-162.081,24.359,0</coordinates></Point>
</Placemark>
<Placemark>
  <name>Broken placemark, no coordinates</name>
</Placemark>
<Placemark>
  <name>No station token here at all!</name>
  <Point><coordinates>-70.0,40.0,0</coordinates></Point>
</Placemark>
</Document></kml>`;

test('BuoyCAM KML parser extracts stations with coordinates and skips garbage', () => {
  const rows = parseBuoycamKml(BUOYCAM_KML);
  assert.equal(rows.length, 2, 'only placemarks with station id AND coordinates survive');
  assert.deepEqual(rows[0], {
    station: '42001',
    name: 'Station 42001 - MID GULF',
    lat: 25.897,
    lon: -89.668,
  });
  assert.equal(rows[1].station, '51101');
  assert.equal(rows[1].lat, 24.359);
  // Robustness: empty/junk input degrades to zero rows, never a throw.
  assert.deepEqual(parseBuoycamKml(''), []);
  assert.deepEqual(parseBuoycamKml('not xml at all'), []);
  assert.deepEqual(parseBuoycamKml(null), []);
});

test('FAA extractor handles bare arrays, wrapped keys, and GeoJSON-ish rows', () => {
  const bare = extractFaaWeathercamEntries([
    { cameraId: 'C1', siteName: 'Anaktuvuk Pass', latitude: 68.14, longitude: -151.74, currentImageUri: '/imagery/C1/current.jpg' },
  ]);
  assert.equal(bare.length, 1);
  assert.equal(bare[0].id, 'C1');
  assert.equal(bare[0].imageUrl, 'https://weathercams.faa.gov/imagery/C1/current.jpg');
  assert.ok(bare[0].pageUrl.startsWith('https://weathercams.faa.gov/'));

  const wrapped = extractFaaWeathercamEntries({
    cameras: [
      { id: 7, name: 'Talkeetna NW', lat: 62.32, lon: -150.09, imageUrl: 'https://weathercams.faa.gov/imagery/7.jpg' },
    ],
  });
  assert.equal(wrapped.length, 1);
  assert.equal(wrapped[0].id, '7');

  const geojson = extractFaaWeathercamEntries({
    features: [
      {
        geometry: { coordinates: [-149.99, 61.17] },
        properties: { cameraID: 'ANC-1', title: 'Anchorage East', image: 'https://weathercams.faa.gov/imagery/anc1.jpg' },
      },
    ],
  });
  assert.equal(geojson.length, 1);
  assert.equal(geojson[0].lat, 61.17);
  assert.equal(geojson[0].lon, -149.99);
});

test('FAA extractor drops rows missing coordinates, ids, or off-origin images', () => {
  const rows = extractFaaWeathercamEntries([
    { cameraId: 'no-coords', currentImageUri: 'https://weathercams.faa.gov/x.jpg' },
    { latitude: 60, longitude: -150, currentImageUri: 'https://weathercams.faa.gov/x.jpg' }, // no id
    { cameraId: 'off-origin', latitude: 60, longitude: -150, currentImageUri: 'https://evil.example.net/x.jpg' },
    { cameraId: 'no-image', latitude: 60, longitude: -150 },
  ]);
  assert.deepEqual(rows, [], 'defensive extractor must reject every malformed row');
  assert.deepEqual(extractFaaWeathercamEntries(null), []);
  assert.deepEqual(extractFaaWeathercamEntries({ unexpected: 'shape' }), []);
});
