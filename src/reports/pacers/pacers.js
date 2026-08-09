const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#pacers-mobile-nav');
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  mobileNav.hidden = expanded;
});
mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const methodologyDialog = document.querySelector('#pacers-methodology-dialog');
document.querySelectorAll('[data-open-methodology]').forEach(button => button.addEventListener('click', () => methodologyDialog?.showModal()));
methodologyDialog?.querySelector('.dialog-close')?.addEventListener('click', () => methodologyDialog.close());
methodologyDialog?.addEventListener('click', event => { if (event.target === methodologyDialog) methodologyDialog.close(); });

const dimensions = [
  { key:'team', label:'Team strength', long:'Team Strength & Results' },
  { key:'post', label:'Postseason', long:'Postseason Ceiling & Conversion' },
  { key:'star', label:'Star conversion', long:'Star Succession & Asset Conversion' },
  { key:'draft', label:'Development', long:'Draft & Development' },
  { key:'resource', label:'Resources', long:'Roster-Resource Strategy' },
  { key:'system', label:'System', long:'Coaching & System Identity' },
  { key:'resilience', label:'Resilience', long:'Availability & Resilience' }
];

const cores = [
  { id:'pg', name:'Paul George Core', score:73.481759, values:[69.4855,67.142857,96.5,36.285714,76.875,89,83] },
  { id:'os', name:'Oladipo / Sabonis Core', score:54.963578, values:[55.833376,20,88.45,25.8,81.285714,58,71] },
  { id:'hali', name:'Haliburton Core', score:80.508265, values:[62.022866,84.5,97.285714,74,86.076923,94,57.4] }
];

const presets = {
  published:{ label:'Published model', weights:[15,20,20,15,10,10,10], note:'The balanced published model rewards the Finals ceiling and the synchronized Haliburton build.' },
  equal:{ label:'Everything equal', weights:[14.2857,14.2857,14.2857,14.2857,14.2857,14.2857,14.2858], note:'Equal weighting still favors Haliburton.' },
  results:{ label:'Results heavy', weights:[30,25,10,10,10,10,5], note:'Giving regular-season and playoff outcomes 55% still leaves Haliburton first.' },
  postseason:{ label:'Postseason heavy', weights:[15,35,15,10,10,10,5], note:'A playoff-first fan pushes the Haliburton advantage wider.' },
  star:{ label:'Star conversion heavy', weights:[10,15,35,10,10,10,10], note:'If preserving and replacing stars is the main question, Haliburton remains first.' },
  development:{ label:'Development heavy', weights:[10,10,15,30,10,15,10], note:'This rewards the 2022 Mathurin/Nembhard class and the young supporting core.' },
  system:{ label:'Resources + system', weights:[10,10,15,10,20,25,10], note:'Roster fit and Carlisle alignment are another strong Haliburton path.' },
  resilience:{ label:'Resilience heavy', weights:[10,10,15,10,10,15,30], note:'This is the real counterargument: make resilience 30% and Paul George moves narrowly into first.' }
};

function score(values, weights) {
  const total = weights.reduce((sum, value) => sum + value, 0) || 1;
  return values.reduce((sum, value, index) => sum + value * weights[index] / total, 0);
}

function renderScorecards() {
  const root = document.querySelector('#pacers-scorecards');
  if (!root) return;
  root.innerHTML = cores.map(core => `
    <article class="era-card ${core.id}">
      <header><h3>${core.name}</h3><span>${core.score.toFixed(1)}</span></header>
      ${dimensions.map((dimension,index) => `
        <div class="metric">
          <label>${dimension.label}</label>
          <div class="metric-track"><span style="width:${Math.min(100,core.values[index])}%"></span></div>
          <output>${core.values[index].toFixed(1)}</output>
        </div>`).join('')}
    </article>`).join('');
}

function polar(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
function points(values, cx, cy, radius) {
  return values.map((value,index) => {
    const [x,y] = polar(cx,cy,radius*(value/100),index*360/values.length);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}
function renderRadar() {
  const svg = document.querySelector('#pacers-radar');
  if (!svg) return;
  const cx=280, cy=250, radius=178;
  const rings=[20,40,60,80,100].map(level => `<polygon points="${points(Array(7).fill(level),cx,cy,radius)}" fill="none" stroke="rgba(255,255,255,.11)" stroke-width="1"/>`).join('');
  const axes=dimensions.map((_,i)=>{const [x,y]=polar(cx,cy,radius,i*360/7);return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.11)"/>`;}).join('');
  const labels=dimensions.map((d,i)=>{const [x,y]=polar(cx,cy,radius+35,i*360/7);return `<text x="${x}" y="${y}" fill="#aebdcc" font-size="12" text-anchor="middle" dominant-baseline="middle">${d.label}</text>`;}).join('');
  const shapes=[
    {core:cores[0],stroke:'#75b9e7',fill:'rgba(117,185,231,.10)'},
    {core:cores[1],stroke:'#a5aeb8',fill:'rgba(165,174,184,.08)'},
    {core:cores[2],stroke:'#fdbb30',fill:'rgba(253,187,48,.12)'}
  ].map(item=>`<polygon points="${points(item.core.values,cx,cy,radius)}" fill="${item.fill}" stroke="${item.stroke}" stroke-width="3"/>`).join('');
  svg.innerHTML=`${rings}${axes}${shapes}${labels}<g transform="translate(18 18)"><circle cx="6" cy="6" r="5" fill="#75b9e7"/><text x="17" y="10" fill="#dbe6ef" font-size="12">George</text><circle cx="92" cy="6" r="5" fill="#a5aeb8"/><text x="103" y="10" fill="#dbe6ef" font-size="12">O/S</text><circle cx="156" cy="6" r="5" fill="#fdbb30"/><text x="167" y="10" fill="#dbe6ef" font-size="12">Haliburton</text></g>`;
}

const scenarioSelect=document.querySelector('#pacers-scenario');
const weightList=document.querySelector('#pacers-weight-list');
let activeWeights=[...presets.published.weights];

function renderScenarioOptions(){
  if(!scenarioSelect)return;
  scenarioSelect.innerHTML=Object.entries(presets).map(([key,p])=>`<option value="${key}">${p.label}</option>`).join('');
}
function renderWeights(){
  if(!weightList)return;
  weightList.innerHTML=dimensions.map((d,i)=>`<div class="weight-row"><label for="pacers-weight-${i}">${d.label}</label><input id="pacers-weight-${i}" type="range" min="0" max="40" step="1" value="${Math.round(activeWeights[i])}"/><output>${Math.round(activeWeights[i])}%</output></div>`).join('');
  weightList.querySelectorAll('input').forEach((input,index)=>input.addEventListener('input',()=>{activeWeights[index]=Number(input.value);input.nextElementSibling.textContent=`${input.value}%`;scenarioSelect.value='';renderModel('Your custom priorities.');}));
}
function renderModel(note){
  const results=cores.map(core=>({core,value:score(core.values,activeWeights)})).sort((a,b)=>b.value-a.value);
  const winner=results[0];
  const winnerEl=document.querySelector('#pacers-model-winner');
  const bars=document.querySelector('#pacers-model-bars');
  const reading=document.querySelector('#pacers-model-reading');
  if(winnerEl)winnerEl.textContent=winner.core.name;
  if(bars)bars.innerHTML=results.map(item=>`<div class="model-bar-row"><span>${item.core.id==='pg'?'George':item.core.id==='os'?'O/S':'Haliburton'}</span><div class="model-bar-track"><span style="width:${Math.min(100,item.value)}%"></span></div><b>${item.value.toFixed(1)}</b></div>`).join('');
  if(reading){
    const total=activeWeights.reduce((s,v)=>s+v,0);
    reading.textContent=`${note} Weights currently total ${Math.round(total)}; the calculator normalizes them automatically. ${winner.core.name} leads by ${(winner.value-results[1].value).toFixed(1)} points.`;
  }
}
function applyPreset(key){
  const preset=presets[key]||presets.published;
  activeWeights=[...preset.weights];
  renderWeights();
  renderModel(preset.note);
}

scenarioSelect?.addEventListener('change',()=>applyPreset(scenarioSelect.value));
document.querySelector('#pacers-model-controls')?.addEventListener('submit',event=>{event.preventDefault();renderModel(presets[scenarioSelect?.value]?.note||'Your custom priorities.');});
document.querySelector('#pacers-reset-model')?.addEventListener('click',()=>{if(scenarioSelect)scenarioSelect.value='published';applyPreset('published');});

renderScorecards();
renderRadar();
renderScenarioOptions();
if(scenarioSelect)scenarioSelect.value='published';
applyPreset('published');
