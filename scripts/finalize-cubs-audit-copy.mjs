import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist=resolve(import.meta.dirname,'..','dist');
const path=resolve(dist,'reports','cubs','index.html');
let html=await readFile(path,'utf8');

const replacements=[
  ['Championship-caliber rebuild / great window','Championship lifecycle — not a dynasty'],
  ['The balanced lifecycle model rewards the title and the 2015–18 run while penalizing replenishment and durability.','The balanced lifecycle model rewards elite foundation building and peak quality while penalizing renewal, retention and incomplete postseason conversion beyond 2016.']
];
for(const [from,to] of replacements){
  if(!html.includes(from))throw new Error(`Cubs audit first-load copy missing expected stale template text: ${from}`);
  html=html.replace(from,to);
}
await writeFile(path,html);
console.log('Finalized Report 004 first-load sensitivity classification and explanation from the audited lifecycle model.');
