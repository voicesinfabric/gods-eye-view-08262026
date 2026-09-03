import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tflFeedFields } from '../../vite.config.js';

const TFL_BUCKET = 'https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/';
const PROPS = {
  imageUrl: `${TFL_BUCKET}00001.01234.jpg`,
  videoUrl: `${TFL_BUCKET}00001.01234.mp4`,
  available: 'true',
};

test('TfL feed fields default to the historical stills shape (product rule)', () => {
  const disabled = tflFeedFields(PROPS, false);
  assert.deepEqual(disabled, {
    feedType: 'image',
    url: PROPS.imageUrl,
    snapshotUrl: PROPS.imageUrl,
  });
  assert.equal('clipRefreshSec' in disabled, false, 'no extra fields in stills mode');
});

test('TfL video opt-in upgrades to the MP4 clip and keeps the still as snapshotUrl', () => {
  const enabled = tflFeedFields(PROPS, true);
  assert.equal(enabled.feedType, 'mp4');
  assert.equal(enabled.url, PROPS.videoUrl);
  assert.equal(enabled.snapshotUrl, PROPS.imageUrl,
    'the still MUST survive — panel preview and /frame depend on it');
  assert.ok(Number.isFinite(enabled.clipRefreshSec) && enabled.clipRefreshSec > 0,
    'clip mode declares a re-arm cadence');
});

test('TfL video opt-in falls back to stills when videoUrl is missing or off-bucket', () => {
  const noVideo = tflFeedFields({ imageUrl: PROPS.imageUrl }, true);
  assert.equal(noVideo.feedType, 'image');
  assert.equal(noVideo.url, PROPS.imageUrl);

  const offBucket = tflFeedFields({
    imageUrl: PROPS.imageUrl,
    videoUrl: 'https://evil.example.net/clip.mp4',
  }, true);
  assert.equal(offBucket.feedType, 'image', 'clip URLs are pinned to the official TfL bucket');
  assert.equal(offBucket.url, PROPS.imageUrl);
});
