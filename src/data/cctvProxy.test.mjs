import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CCTV_FRAME_FETCH_TIMEOUT_MS,
  CCTV_MEDIA_HEADERS_TIMEOUT_MS,
  CCTV_MEDIA_MAX_CONCURRENT,
  createMediaStreamGate,
  fetchCctvImageFromUpstream,
  fetchCctvMediaUpstream,
  frameUpstreamCandidate,
} from '../../vite.config.js';

test('CCTV upstream frame fetch supplies a bounded abort signal', async () => {
  let observedSignal = null;
  const startedAt = Date.now();
  const result = await fetchCctvImageFromUpstream('https://example.com/frame.jpg', {
    timeoutMs: 20,
    fetchImpl: (_url, options) => new Promise((_resolve, reject) => {
      observedSignal = options.signal;
      options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
    }),
  });

  assert.equal(result, null);
  assert.ok(observedSignal instanceof AbortSignal);
  assert.equal(observedSignal.aborted, true);
  assert.ok(Date.now() - startedAt < 500, 'test timeout should settle promptly');
  assert.ok(CCTV_FRAME_FETCH_TIMEOUT_MS < 10_000, 'production timeout must beat the active refresh cadence');
});

test('CCTV upstream frame fetch returns a valid image response', async () => {
  const result = await fetchCctvImageFromUpstream('https://example.com/frame.jpg', {
    timeoutMs: 100,
    fetchImpl: async () => new Response(Uint8Array.from([1, 2, 3]), {
      status: 200,
      headers: { 'Content-Type': 'image/jpeg' },
    }),
  });

  assert.equal(result?.ok, true);
  assert.equal(result?.contentType, 'image/jpeg');
  assert.deepEqual(result?.body, Buffer.from([1, 2, 3]));
});

test('CCTV media fetch aborts when upstream headers never arrive', async () => {
  let observedSignal = null;
  const startedAt = Date.now();
  await assert.rejects(
    fetchCctvMediaUpstream('https://example.com/stream.mp4', {
      headersTimeoutMs: 20,
      fetchImpl: (_url, options) => new Promise((_resolve, reject) => {
        observedSignal = options.signal;
        options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
      }),
    }),
  );
  assert.ok(observedSignal instanceof AbortSignal);
  assert.equal(observedSignal.aborted, true);
  assert.ok(Date.now() - startedAt < 500, 'header timeout should settle promptly');
  assert.ok(CCTV_MEDIA_HEADERS_TIMEOUT_MS >= CCTV_FRAME_FETCH_TIMEOUT_MS,
    'live media may connect at least as leisurely as a frame fetch');
});

test('CCTV media fetch clears its timer once headers arrive (streams live past the timeout)', async () => {
  let observedSignal = null;
  const opened = await fetchCctvMediaUpstream('https://example.com/stream.mp4', {
    headersTimeoutMs: 15,
    fetchImpl: async (_url, options) => {
      observedSignal = options.signal;
      // Headers arrive immediately; the (conceptually unbounded) body follows.
      return new Response(new ReadableStream({ start() { /* never ends */ } }), {
        status: 200,
        headers: { 'Content-Type': 'video/mp4' },
      });
    },
  });
  assert.equal(opened.upstream.status, 200);
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(observedSignal.aborted, false,
    'an established stream must never be killed by the header timer');
  opened.cancel();
  assert.equal(observedSignal.aborted, true, 'cancel() aborts the transfer');
});

test('CCTV media fetch forwards the client Range header and rejects non-http URLs', async () => {
  let seenHeaders = null;
  const opened = await fetchCctvMediaUpstream('https://example.com/clip.mp4', {
    headersTimeoutMs: 100,
    rangeHeader: 'bytes=0-1023',
    fetchImpl: async (_url, options) => {
      seenHeaders = options.headers;
      return new Response(null, { status: 206 });
    },
  });
  assert.equal(opened.upstream.status, 206);
  assert.equal(seenHeaders.Range, 'bytes=0-1023');

  assert.equal(await fetchCctvMediaUpstream('file:///etc/passwd', {
    fetchImpl: async () => new Response(null, { status: 200 }),
  }), null);
  assert.equal(await fetchCctvMediaUpstream('', {}), null);
});

test('media stream gate admits to the cap, releases idempotently, and readmits', () => {
  const gate = createMediaStreamGate(2);
  const releaseA = gate.tryAcquire();
  const releaseB = gate.tryAcquire();
  assert.ok(releaseA && releaseB);
  assert.equal(gate.activeCount(), 2);
  assert.equal(gate.tryAcquire(), null, 'at capacity');

  releaseA();
  releaseA(); // double-release (finish + close both fire) must not double-decrement
  assert.equal(gate.activeCount(), 1);
  const releaseC = gate.tryAcquire();
  assert.ok(releaseC, 'released slot is readmittable');
  assert.equal(gate.tryAcquire(), null);

  releaseB();
  releaseC();
  assert.equal(gate.activeCount(), 0);
  assert.ok(CCTV_MEDIA_MAX_CONCURRENT >= 2,
    'default cap must allow projection + panel players concurrently');
});

test('frame upstream candidate refuses unbounded stream bodies without a snapshot', () => {
  // snapshotUrl always wins, for every feed type.
  assert.equal(
    frameUpstreamCandidate({ feedType: 'hls', url: 'https://a/x.m3u8', snapshotUrl: 'https://a/still.jpg' }),
    'https://a/still.jpg',
  );
  assert.equal(
    frameUpstreamCandidate({ feedType: 'mjpeg', url: 'https://a/stream', snapshotUrl: 'https://a/still.jpg' }),
    'https://a/still.jpg',
  );
  // Snapshot-less video and mjpeg fall through to Street View / synthetic.
  for (const feedType of ['mp4', 'webm', 'hls', 'stream', 'mjpeg', 'mjpg']) {
    assert.equal(frameUpstreamCandidate({ feedType, url: 'https://a/stream' }), '',
      `${feedType} without snapshotUrl must not reach the still fetcher`);
  }
  // Image feeds keep today's behavior: url is a fine still source.
  assert.equal(frameUpstreamCandidate({ feedType: 'image', url: 'https://a/cam.jpg' }), 'https://a/cam.jpg');
  assert.equal(frameUpstreamCandidate({ feedType: '', url: 'https://a/cam.jpg' }), 'https://a/cam.jpg');
  assert.equal(frameUpstreamCandidate(null), '');
  assert.equal(frameUpstreamCandidate({ feedType: 'image' }), '');
});
