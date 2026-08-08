import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function archiveManifest({ root, dist, manifestName, outputName, label }) {
  const manifestPath = resolve(root, 'src', 'data', manifestName);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.assets) || manifest.assets.length === 0) {
    throw new Error(`${label} archive manifest contains no assets.`);
  }

  const approved = manifest.assets.filter(asset => asset.status === 'approved');
  const archiveDir = resolve(dist, 'assets', 'archive');
  await mkdir(archiveDir, { recursive: true });

  const archived = [];
  for (const asset of approved) {
    for (const field of ['id', 'slug', 'remoteSrc', 'sourcePage', 'creator', 'license', 'caption', 'alt', 'extension']) {
      if (!asset[field]) throw new Error(`Archive asset ${asset.id || '(unknown)'} missing ${field}.`);
    }
    if (!asset.remoteSrc.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/')) {
      throw new Error(`Archive asset ${asset.id} must use a reviewed Wikimedia redirect source.`);
    }

    const filename = `${asset.slug}.${asset.extension}`;
    const response = await fetch(asset.remoteSrc, {
      redirect: 'follow',
      headers: { 'user-agent': 'Era-Theory-Archive/1.0 (+https://era-theory.pages.dev/)' }
    });
    if (!response.ok) throw new Error(`Failed to archive ${asset.id}: HTTP ${response.status}`);
    const type = response.headers.get('content-type') || '';
    if (!type.startsWith('image/')) throw new Error(`Archive asset ${asset.id} returned non-image content: ${type}`);

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 10_000) throw new Error(`Archive asset ${asset.id} is unexpectedly small (${bytes.length} bytes).`);
    await writeFile(resolve(archiveDir, filename), bytes);
    archived.push({ ...asset, localSrc: `/assets/archive/${filename}`, bytes: bytes.length });
  }

  await writeFile(
    resolve(archiveDir, outputName),
    JSON.stringify({ version: manifest.version, policy: manifest.policy, assets: archived }, null, 2) + '\n'
  );
  console.log(`Archived ${archived.length} rights-approved ${label} images.`);
  return archived;
}

export async function archiveColtsAssets({ root, dist }) {
  const colts = await archiveManifest({
    root,
    dist,
    manifestName: 'colts-archive.json',
    outputName: 'colts-manifest.json',
    label: 'Colts'
  });
  const lions = await archiveManifest({
    root,
    dist,
    manifestName: 'lions-archive.json',
    outputName: 'lions-manifest.json',
    label: 'Detroit Lions'
  });
  return [...colts, ...lions];
}
