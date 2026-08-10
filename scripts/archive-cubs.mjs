import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sleep = ms => new Promise(resolveSleep => setTimeout(resolveSleep, ms));

async function fetchReviewedImage(asset, maxAttempts = 5) {
  let lastResponse = null;
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(asset.remoteSrc, {
        redirect: 'follow',
        headers: {
          'user-agent': 'Era-Theory-Archive/1.0 (+https://era-theory.pages.dev/; rights-reviewed archival build)',
          'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });
      lastResponse = response;
      if (response.ok) return response;
      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === maxAttempts) return response;
      const retryAfter = Number.parseFloat(response.headers.get('retry-after') || '');
      const delayMs = Number.isFinite(retryAfter)
        ? Math.min(Math.max(retryAfter * 1000, 1000), 15000)
        : Math.min(1000 * (2 ** (attempt - 1)), 12000);
      console.warn(`Archive fetch ${asset.id} returned HTTP ${response.status}; retrying in ${delayMs}ms (${attempt}/${maxAttempts}).`);
      await sleep(delayMs);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) throw error;
      const delayMs = Math.min(1000 * (2 ** (attempt - 1)), 12000);
      console.warn(`Archive fetch ${asset.id} failed (${error.message}); retrying in ${delayMs}ms (${attempt}/${maxAttempts}).`);
      await sleep(delayMs);
    }
  }
  if (lastResponse) return lastResponse;
  throw lastError || new Error(`Failed to fetch ${asset.id}.`);
}

export async function archiveCubsAssets({ root, dist }) {
  const manifestPath = resolve(root, 'src', 'data', 'cubs-archive.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.assets) || manifest.assets.length === 0) throw new Error('Cubs archive manifest contains no assets.');
  const approved = manifest.assets.filter(asset => asset.status === 'approved');
  const archiveDir = resolve(dist, 'assets', 'archive');
  await mkdir(archiveDir, { recursive: true });
  const archived = [];
  for (const asset of approved) {
    for (const field of ['id','slug','remoteSrc','sourcePage','creator','license','caption','alt','extension']) {
      if (!asset[field]) throw new Error(`Archive asset ${asset.id || '(unknown)'} missing ${field}.`);
    }
    if (!asset.remoteSrc.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/')) throw new Error(`Archive asset ${asset.id} must use a reviewed Wikimedia redirect source.`);
    const filename = `${asset.slug}.${asset.extension}`;
    const response = await fetchReviewedImage(asset);
    if (!response.ok) throw new Error(`Failed to archive ${asset.id}: HTTP ${response.status}`);
    const type = response.headers.get('content-type') || '';
    if (!type.startsWith('image/')) throw new Error(`Archive asset ${asset.id} returned non-image content: ${type}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 10_000) throw new Error(`Archive asset ${asset.id} is unexpectedly small (${bytes.length} bytes).`);
    await writeFile(resolve(archiveDir, filename), bytes);
    archived.push({ ...asset, localSrc:`/assets/archive/${filename}`, bytes:bytes.length });
    await sleep(250);
  }
  await writeFile(resolve(archiveDir, 'cubs-manifest.json'), JSON.stringify({version:manifest.version,policy:manifest.policy,assets:archived}, null, 2) + '\n');
  console.log(`Archived ${archived.length} rights-approved Chicago Cubs images.`);
  return archived;
}
