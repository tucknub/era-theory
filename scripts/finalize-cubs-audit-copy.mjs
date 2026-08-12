import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dist=resolve(import.meta.dirname,'..','dist');
const reportPath=resolve(dist,'reports','cubs','index.html');
const methodPath=resolve(dist,'research','cubs','index.html');

function required(text,from,to,label){
  if(!text.includes(from))throw new Error(`Final Cubs audit missing expected ${label}: ${from}`);
  return text.replace(from,to);
}
function requiredRegex(text,pattern,to,label){
  if(!pattern.test(text))throw new Error(`Final Cubs audit missing expected ${label}.`);
  pattern.lastIndex=0;
  return text.replace(pattern,to);
}

let html=await readFile(reportPath,'utf8');
html=html
  .replaceAll('A 135-record Era Theory study','A 186-record Era Theory study')
  .replaceAll('135 sourced records','186 sourced records')
  .replaceAll('135 / 135','186 / 186')
  .replaceAll('135 records','186 records');

html=required(html,
  '<p>The Cubs score <strong>80.7</strong>: championship-caliber rebuild, historically elite peak, real four-year window—and a clear durability failure afterward.</p>',
  '<p>The Cubs score <strong>83.7</strong>: an elite rebuild, a historically great four-year window and a championship—without the replenishment and repeated pennants needed for a dynasty.</p>',
  'quick-answer score');
html=required(html,
  '<article class="result-card"><span>FINAL LIFECYCLE SCORE</span><strong>80.7</strong><h3>Great window</h3><p>The rebuild absolutely succeeded. It produced four straight 90+ win seasons from 2015–18 and a historically dominant champion.</p></article>',
  '<article class="result-card"><span>FINAL LIFECYCLE SCORE</span><strong>83.7</strong><h3>Historic championship window</h3><p>The rebuild absolutely succeeded. It produced four straight postseason teams from 2015–18 and a historically dominant champion.</p></article>',
  'verdict score card');
html=required(html,
  '<article><span>DYNASTY TEST</span><strong>0 / 100,000</strong><h3>bounded models reached 90</h3><p>When every lifecycle dimension matters at least a little, no plausible random-weight model classifies this as dynasty-level sustained success.</p></article>',
  '<article><span>ROBUSTNESS</span><strong>92.8%</strong><h3>bounded models score 80+</h3><p>The lifecycle-success conclusion is robust. Dynasty status is decided separately by repeated pennants, titles and championship-level replenishment.</p></article>',
  'robustness verdict card');
html=required(html,
  '<article><span>THE STRUCTURAL PROBLEM</span><strong>73.9</strong><h3>draft / development score</h3><p>The early prospect wave was spectacular. The mature replenishment classes behind it were not.</p></article>',
  '<article><span>THE STRUCTURAL PROBLEM</span><strong>61.8</strong><h3>window durability score</h3><p>The original stars stayed recognizable, but new impact talent, pitching and contract runway did not arrive fast enough to keep the championship ecosystem regenerating.</p></article>',
  'structural-problem card');

html=html.replaceAll('<strong>91.1</strong>','<strong>96.0</strong>');
html=html.replace('Hendricks</b> · 95','Hendricks</b> · 99');

html=required(html,
  '<p>The mature draft classes average <strong>68.3</strong>, while the broader prospect-development index is <strong>84.2</strong>. Combined, the development dimension lands at <strong>73.9</strong>. The early 2013–14 classes were exceptional, but later drafting was uneven and internal pitching renewal never matched the first position-player wave.</p><div class="grade-slope"><article><span>2012–14</span><strong>84.3</strong><p>foundation draft classes</p></article><b>→</b><article><span>2015–18</span><strong>71.8</strong><p>window draft classes</p></article><b>→</b><article><span>2019–21</span><strong>47.7</strong><p>decline draft classes</p></article></div>',
  '<p>The mature 2012–20 draft classes average <strong>66.8</strong>. The early 2012–15 run averages <strong>89.0</strong>; 2016–20 falls to <strong>49.0</strong>. Combined with prospect conversion into direct Cubs MLB value or premium trade value, the development dimension lands at <strong>74.0</strong>.</p><div class="grade-slope"><article><span>2012–15</span><strong>89.0</strong><p>early mature classes</p></article><b>→</b><article><span>2016–20</span><strong>49.0</strong><p>replenishment classes</p></article><b>→</b><article><span>2021–25</span><strong>TRACKED</strong><p>still immature at cutoff</p></article></div>',
  'development chapter');

html=required(html,
  '<div class="move-grid"><article><strong>80.4</strong><span>trade conversion</span></article><article><strong>81.8</strong><span>veteran supplementation</span></article><article><strong>64.0</strong><span>decline external additions</span></article><article><strong>86.8</strong><span>second-build external additions</span></article></div>',
  '<div class="move-grid"><article><strong>86.0</strong><span>trade conversion</span></article><article><strong>84.0</strong><span>veteran supplementation</span></article><article><strong>64.0</strong><span>decline external additions</span></article><article><strong>91.0</strong><span>second-build supplementation</span></article></div>',
  'external-additions grid');

html=required(html,
  '<div class="durability-fall"><span>Competitive floor <b>90</b></span><span>Position replenishment <b>62</b></span><span>Homegrown pitching <b>35</b></span><span>Retention <b>58</b></span><span>Decline response <b>68</b></span></div>',
  '<div class="durability-fall"><span>Season durability <b>66.0</b></span><span>Retention <b>69.7</b></span><span>Replenishment <b>49.0</b></span><span>Decline response <b>54.7</b></span><span>Final durability <b>61.8</b></span></div>',
  'durability diagnostic');

html=requiredRegex(html,
  /<section class="proof-section" id="evidence">[\s\S]*?<\/section>/,
  `<section class="proof-section" id="evidence"><div class="fan-heading"><p>Chapter 11 · The full model</p><h2>The Cubs lifecycle scores 83.7.</h2><p>Eight MLB-specific questions, 186 sourced records and a model that separates championship peak from durability.</p></div><div class="score-grid"><article><span>Foundation</span><strong>96.0</strong></article><article><span>Development</span><strong>74.0</strong></article><article><span>Trade conversion</span><strong>86.0</strong></article><article><span>Supplementation</span><strong>84.0</strong></article><article><span>Peak quality</span><strong>96.0</strong></article><article><span>Postseason</span><strong>82.0</strong></article><article><span>Durability</span><strong>61.8</strong></article><article><span>Recovery</span><strong>81.0</strong></article></div><div class="proof-strip"><div><strong>186 / 186</strong><span>core records sourced</span></div><div><strong>14</strong><span>completed seasons</span></div><div><strong>300,000</strong><span>random-weight tests</span></div><div><strong>83.7</strong><span>published lifecycle score</span></div></div><a class="button secondary" href="../../research/cubs/index.html">See the methodology and sources</a></section>`,
  'evidence section');

html=html.replace('<button data-preset="development">Development heavy</button>','<button data-preset="development">Sustainability first</button>');
html=requiredRegex(html,
  /<div class="sensitivity-result">[\s\S]*?<\/div><div class="robustness">[\s\S]*?<\/div>/,
  `<div class="sensitivity-result"><span id="cubs-preset-label">Published lifecycle model</span><strong id="cubs-preset-score">83.7</strong><h3 id="cubs-preset-class">Historic championship window — not a dynasty</h3><p id="cubs-preset-explainer">The balanced lifecycle model rewards elite foundation building, a historically great peak and strong asset conversion while penalizing the failure to replenish and extend championship-level quality.</p></div><div class="robustness"><span>Title-first: <b>83.1</b></span><span>Dynasty-first: <b>80.7</b></span><span>Highest leave-one-out: <b>86.2</b></span><span>Bounded below 75: <b>0 / 100,000</b></span></div>`,
  'sensitivity result');
html=html.replace('<h2>The Cubs built what every fan wanted. They just did not build it twice before the window closed.</h2>','<h2>The Cubs built a powerhouse, not a dynasty.</h2>');
html=html.replace('160 sourced records · 300,000 model tests · private research workbook','186 sourced records · 300,000 model tests · private research workbook');

await writeFile(reportPath,html);

let method=await readFile(methodPath,'utf8');
method=method
  .replaceAll('<strong>135</strong><span>core evidence records</span>','<strong>186</strong><span>core evidence records</span>')
  .replaceAll('<strong>135 / 135</strong><span>records source-linked</span>','<strong>186 / 186</strong><span>records source-linked</span>')
  .replaceAll('135 of 135 core records carry a source.','186 of 186 core records carry a source.')
  .replaceAll('The 80.7 score explicitly classifies the lifecycle as a championship-caliber rebuild and great window.','The 83.7 score classifies the lifecycle as championship-successful; dynasty status is evaluated by a separate historical gate.')
  .replaceAll('80.7','83.7');
method=method.replace('<article><b>5</b><h3>Try to manufacture a dynasty</h3><p>Named philosophies, leave-one-out tests and 300,000 random-weight models test how hard the priorities must be bent to reach a dynasty-level score.</p></article>','<article><b>5</b><h3>Separate lifecycle quality from the dynasty label</h3><p>Named philosophies, leave-one-out tests and 300,000 random-weight models test the lifecycle score. A separate historical gate asks whether the window produced repeated pennants/titles and replenished championship-level quality.</p></article>');
method=requiredRegex(method,
  /<section class="research-section" id="sources">[\s\S]*?<\/section>/,
  `<section class="research-section" id="sources"><div class="research-heading"><p>Evidence integrity</p><h2>186 of 186 core records carry a source.</h2></div><div class="source-audit"><div><strong>14 / 14</strong><span>Season results</span></div><div><strong>19 / 19</strong><span>Core asset records</span></div><div><strong>29 / 29</strong><span>Major acquisitions</span></div><div><strong>12 / 12</strong><span>Trade conversions</span></div><div><strong>14 / 14</strong><span>Draft classes</span></div><div><strong>23 / 23</strong><span>Prospect records</span></div><div><strong>11 / 11</strong><span>Free-agent signings</span></div><div><strong>8 / 8</strong><span>Roster-architecture rows</span></div><div><strong>7 / 7</strong><span>Peak-team rows</span></div><div><strong>6 / 6</strong><span>Postseason cases</span></div><div><strong>7 / 7</strong><span>Durability seasons</span></div><div><strong>10 / 10</strong><span>Retention decisions</span></div><div><strong>7 / 7</strong><span>Decline signals</span></div><div><strong>9 / 9</strong><span>Teardown moves</span></div><div><strong>6 / 6</strong><span>Teardown asset-tree rows</span></div><div><strong>4 / 4</strong><span>Second-build seasons</span></div></div><p class="research-callout"><strong>Source families:</strong> MLB.com/Cubs official history and transaction records, Baseball Reference season pages and rights-reviewed Wikimedia Commons photography. Summary/formula rows are excluded; the public audit counts these 16 structured evidence registers only.</p></section>`,
  'methodology evidence section');
method=requiredRegex(method,
  /<section class="research-section" id="robustness">[\s\S]*?<\/section>/,
  `<section class="research-section" id="robustness"><div class="research-heading"><p>Does a strong lifecycle score make it a dynasty?</p><h2>No. Those are two different questions.</h2></div><div class="stress-grid"><article><strong>83.7</strong><span>published lifecycle score</span></article><article><strong>77.6</strong><span>sustainability-first model</span></article><article><strong>86.2</strong><span>highest leave-one-out result</span></article><article><strong>0 / 100,000</strong><span>bounded models below 75</span></article></div><p class="research-callout"><strong>300,000 random-weight tests:</strong> 200,000 unrestricted plus 100,000 bounded models where every dimension receives 5–25% weight. The lifecycle conclusion is robust: bounded models are never below 75 and 92.764% score 80+. Dynasty status is evaluated separately: championship and sustained elite regular-season quality pass; repeated pennants/titles and championship-level replenishment do not.</p><div class="stress-grid"><article><strong>82.61</strong><span>unrestricted mean</span></article><article><strong>82.79</strong><span>unrestricted median</span></article><article><strong>82.60</strong><span>bounded mean</span></article><article><strong>82.66</strong><span>bounded median</span></article></div></section>`,
  'methodology robustness section');
await writeFile(methodPath,method);

console.log('Finalized Report 004 from the locked 83.7 lifecycle model, 186/186 sourced evidence records and separate historical dynasty gate.');
