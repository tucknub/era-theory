import { readFile, writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourcePath=resolve(import.meta.dirname,'visual-qa-v4.mjs');
const runtimePath=resolve(import.meta.dirname,'.visual-qa-v5-runtime.mjs');
let source=await readFile(sourcePath,'utf8');

// Preserve the established four-report browser suite while replacing Report 004's
// prototype dynasty audit with the frozen 82.0 / 139-record lifecycle model.
source=source
  .replaceAll("'1064'","'1043'")
  .replaceAll('1064 / 1064','1043 / 1043')
  .replaceAll('1,064','1,043')
  .replaceAll("'160'","'139'")
  .replaceAll('160 / 160','139 / 139')
  .replaceAll('Great championship window','Successful lifecycle, imperfect exit')
  .replaceAll('Did the Cubs build a dynasty—or one great championship window?','Did the Cubs break up the 2016 core at the right time?')
  .replaceAll('Why did the farm stop replenishing the roster?','Should the Cubs have sold the core earlier?')
  .replaceAll('MLB rebuild-lifecycle model','seven-dimension MLB championship-window lifecycle model')
  .replaceAll('Eight MLB lifecycle questions','Seven MLB lifecycle questions')
  .replaceAll('Recent drafts are immature','Re-entry is only one complete season')
  .replace(
    "const expectations={published:['80.6','Championship-caliber rebuild / great window'],title:['82.4','Championship-caliber rebuild / great window'],dynasty:['77.6','Successful but incomplete lifecycle'],development:['74.9','Successful but incomplete lifecycle'],recovery:['79.6','Successful but incomplete lifecycle']};",
    "const expectations={published:['82.0','Successful with flaws'],title:['83.8','Successful with flaws'],dynasty:['77.3','Successful with flaws'],development:['77.0','Successful with flaws'],recovery:['78.6','Successful with flaws']};"
  )
  .replace('Visual QA v4 passed:','Visual QA v5 passed: frozen Cubs lifecycle model;');

for(const stale of ["published:['80.6'","'1064'",'1064 / 1064',"'160'",'160 / 160','Great championship window','Did the Cubs build a dynasty—or one great championship window?','Eight MLB lifecycle questions']){
  if(source.includes(stale))throw new Error(`Visual QA v5 still contains stale Report 004 expectation: ${stale}`);
}

await writeFile(runtimePath,source);
try{
  await import(pathToFileURL(runtimePath).href+`?audit=${Date.now()}`);
}finally{
  await unlink(runtimePath).catch(()=>{});
}
