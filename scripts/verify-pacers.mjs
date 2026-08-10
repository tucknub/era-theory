import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');const dist=resolve(root,'dist');
const report=await readFile(resolve(dist,'reports','pacers','index.html'),'utf8');
const method=await readFile(resolve(dist,'research','pacers','index.html'),'utf8');
const registry=JSON.parse(await readFile(resolve(dist,'data','reports.json'),'utf8'));
const manifest=JSON.parse(await readFile(resolve(dist,'assets','archive','pacers-manifest.json'),'utf8'));
const credits=await readFile(resolve(dist,'image-credits.html'),'utf8');
const home=await readFile(resolve(dist,'index.html'),'utf8');
const pacers=registry.reports.find(r=>r.number==='003'&&r.slug==='pacers'&&r.status==='published');
if(!pacers)throw new Error('Report 003 missing from published registry.');
for(const marker of ['The Haliburton core wins','83.6','79.3','59.9','One asset chain kept changing shape','Can the Paul George core still win?','175 sourced records','300,000 random-weight tests']) if(!report.includes(marker)) throw new Error(`Pacers report missing marker: ${marker}`);
for(const marker of ['175 / 175','Eight NBA questions','58.4%','64.2%','Zubac trade is unresolved']) if(!method.includes(marker)) throw new Error(`Pacers methodology missing marker: ${marker}`);
if(/docs\.google\.com\/spreadsheets/i.test(report+method)) throw new Error('Private Google Sheet URL leaked into public Pacers HTML.');
if(!Array.isArray(manifest.assets)||manifest.assets.length!==5)throw new Error(`Expected 5 archived Pacers images, found ${manifest.assets?.length||0}.`);
for(const asset of manifest.assets){if(!asset.localSrc?.startsWith('/assets/archive/'))throw new Error(`Pacers asset ${asset.id} missing local archive path.`);if(!credits.includes(asset.id))throw new Error(`Image credits missing ${asset.id}.`);if(!report.includes(asset.localSrc))throw new Error(`Pacers report does not use archived asset ${asset.localSrc}.`)}
if(!home.includes('How did the Pacers keep turning one star into the next?'))throw new Error('Server-rendered homepage fallback missing Report 003.');
if(!report.includes('Real people, real photographs.'))throw new Error('Pacers authentic-image disclosure missing.');
console.log(`Verified Report 003: Pacers story, methodology, ${manifest.assets.length} authentic images, privacy guard, final scores and homepage fallback.`);
