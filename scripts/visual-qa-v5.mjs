import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath=resolve(import.meta.dirname,'visual-qa-v4.mjs');
const runtimePath=resolve(import.meta.dirname,'.visual-qa-v5-runtime.mjs');
let source=await readFile(sourcePath,'utf8');

// Preserve the established four-report browser suite; replace only Report 004's
// final audited research expectations and the aggregate evidence total they affect.
source=source
  .replaceAll("'1064'","'1090'")
  .replaceAll('1064 / 1064','1090 / 1090')
  .replaceAll('1,064','1,090')
  .replaceAll("'160'","'186'")
  .replaceAll('160 / 160','186 / 186')
  .replaceAll('Great championship window','Historic championship window')
  .replace(
    "const expectations={published:['80.6','Championship-caliber rebuild / great window'],title:['82.4','Championship-caliber rebuild / great window'],dynasty:['77.6','Successful but incomplete lifecycle'],development:['74.9','Successful but incomplete lifecycle'],recovery:['79.6','Successful but incomplete lifecycle']};",
    "const expectations={published:['83.7','Historic championship window — not a dynasty'],title:['83.1','Championship-successful lifecycle'],dynasty:['80.7','Championship-successful lifecycle — historical dynasty gate still fails'],development:['77.6','Strong but incomplete lifecycle'],recovery:['81.3','Championship-successful lifecycle']};"
  )
  .replace('Visual QA v4 passed:','Visual QA v5 passed: final Cubs audit;');

for(const stale of ["published:['80.6'","'1064'",'1064 / 1064',"'160'",'160 / 160','Great championship window']){
  if(source.includes(stale))throw new Error(`Visual QA v5 still contains stale Report 004 expectation: ${stale}`);
}

await writeFile(runtimePath,source);
try{
  await import(pathToFileURL(runtimePath).href+`?audit=${Date.now()}`);
}finally{
  await unlink(runtimePath).catch(()=>{});
}
