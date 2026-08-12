import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath=resolve(import.meta.dirname,'visual-qa-v4.mjs');
const runtimePath=resolve(import.meta.dirname,'.visual-qa-v5-runtime.mjs');
let source=await readFile(sourcePath,'utf8');

// Preserve the established four-report browser suite; only replace Report 004's
// audited research expectations and the aggregate evidence total they affect.
source=source
  .replaceAll("'1064'","'1039'")
  .replaceAll('1064 / 1064','1039 / 1039')
  .replaceAll('1,064','1,039')
  .replaceAll("'160'","'135'")
  .replaceAll('160 / 160','135 / 135')
  .replaceAll('Great championship window','Championship lifecycle')
  .replace(
    "const expectations={published:['80.6','Championship-caliber rebuild / great window'],title:['82.4','Championship-caliber rebuild / great window'],dynasty:['77.6','Successful but incomplete lifecycle'],development:['74.9','Successful but incomplete lifecycle'],recovery:['79.6','Successful but incomplete lifecycle']};",
    "const expectations={published:['80.7','Championship lifecycle — not a dynasty'],title:['80.0','Championship lifecycle — not a dynasty'],dynasty:['77.3','Strong but incomplete lifecycle'],development:['78.5','Strong but incomplete lifecycle'],recovery:['79.3','Strong but incomplete lifecycle']};"
  )
  .replace('Visual QA v4 passed:','Visual QA v5 passed: audited Cubs model;');

for(const stale of ["published:['80.6'","'1064'",'1064 / 1064',"'160'",'160 / 160','Great championship window']){
  if(source.includes(stale))throw new Error(`Visual QA v5 still contains stale Report 004 expectation: ${stale}`);
}

await writeFile(runtimePath,source);
try{
  await import(pathToFileURL(runtimePath).href+`?audit=${Date.now()}`);
}finally{
  await unlink(runtimePath).catch(()=>{});
}
