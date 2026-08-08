const dimensions = [
  { key: 'team', label: 'Who won the most?' },
  { key: 'post', label: 'Who won in January?' },
  { key: 'qb', label: 'Who solved quarterback?' },
  { key: 'dev', label: 'Who found good players?' },
  { key: 'roster', label: 'Who made smart roster moves?' },
  { key: 'coach', label: 'Who built the best coaching setup?' },
  { key: 'injury', label: 'Who survived when stars went down?' }
];

const eras = [
  { id: 'polian', name: 'Bill Polian', score: 70.5, values: [68.25892857142857, 48.21428571428571, 95.71428571428572, 75.3651948051948, 66.18928571428572, 80.5, 70.1], color: '#62b5ff' },
  { id: 'grigson', name: 'Ryan Grigson', score: 61.1, values: [60.875, 35.0, 85.625, 59.62138835725677, 64.26764705882353, 65.8, 81.2], color: '#b7c2cf' },
  { id: 'ballard', name: 'Chris Ballard', score: 47.8, values: [46.454138702460845, 7.777777777777777, 45.71282679738562, 73.17626804482067, 74.47678571428571, 68.12222222222222, 49.81], color: '#1769e0' }
];

const scenarioWeights = {
  published: { label: 'Our balanced model', weights: [25, 20, 15, 15, 10, 10, 5] },
  results: { label: 'I mostly care about winning and titles', weights: [25, 30, 15, 10, 5, 10, 5] },
  evaluator: { label: 'I mostly care about finding and acquiring talent', weights: [10, 10, 10, 30, 25, 10, 5] },
  qb: { label: 'I think quarterback stability matters most', weights: [15, 15, 30, 10, 10, 10, 10] },
  sustainable: { label: 'I care most about a stable long-term organization', weights: [15, 15, 15, 15, 10, 20, 10] },
  equal: { label: 'Treat everything equally', weights: [14.285714285714286, 14.285714285714286, 14.285714285714286, 14.285714285714286, 14.285714285714286, 14.285714285714286, 14.285714285714286] },
  draftOnly: { label: 'Only drafting and roster moves matter', weights: [0, 0, 0, 50, 50, 0, 0] },
  resilienceOnly: { label: 'Only roster value and surviving adversity matter', weights: [0, 0, 0, 0, 50, 0, 50] }
};

const qbs = [
  ['1998–2011', 'Peyton Manning', 'A thirteen-season answer. The 2011 backup plan collapsed when Manning was lost.'],
  ['2012–2018', 'Andrew Luck', 'An immediate franchise reset. Injuries and early retirement ended the plan.'],
  ['2019', 'Jacoby Brissett', 'The emergency answer after Luck retired.'],
  ['2020', 'Philip Rivers', 'The best one-year bridge; Indianapolis returned to the playoffs.'],
  ['2021', 'Carson Wentz', 'A costly reclamation bet that lasted one season.'],
  ['2022', 'Matt Ryan', 'Another veteran reset; the offense and roster unraveled.'],
  ['2023–2025', 'Richardson / Jones', 'A high-upside draft bet followed by another bridge; still no durable solution by the cutoff.']
];

function renderScorecards() {
  const container = document.querySelector('#scorecards-container');
  if (!container) return;
  container.innerHTML = eras.map((era, index) => `
    <article class="era-card ${era.id}">
      <header><h3>${era.name}</h3><span class="${index === 0 ? 'winner-tag' : ''}">${era.score.toFixed(1)}</span></header>
      <div class="metric-list">
        ${dimensions.map((dim, i) => `<div class="metric"><label>${dim.label}</label><div class="metric-track" aria-hidden="true"><span style="width:${Math.max(2, era.values[i])}%"></span></div><output>${era.values[i].toFixed(1)}</output></div>`).join('')}
      </div>
    </article>
  `).join('');
}

function polarPoint(cx, cy, radius, angle) {
  return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
}

function renderRadar() {
  const svg = document.querySelector('#radar');
  if (!svg) return;
  const cx = 280, cy = 245, maxR = 165, count = dimensions.length;
  const angleFor = i => -Math.PI / 2 + (i * Math.PI * 2 / count);
  const grid = [20, 40, 60, 80, 100].map(level => {
    const points = dimensions.map((_, i) => polarPoint(cx, cy, maxR * level / 100, angleFor(i)).join(',')).join(' ');
    return `<polygon points="${points}" fill="none" stroke="#24425d" stroke-width="1" />`;
  }).join('');
  const axes = dimensions.map((dim, i) => {
    const [x, y] = polarPoint(cx, cy, maxR, angleFor(i));
    const [lx, ly] = polarPoint(cx, cy, maxR + 42, angleFor(i));
    const anchor = lx < cx - 10 ? 'end' : lx > cx + 10 ? 'start' : 'middle';
    const shortLabels = ['Winning', 'Playoffs', 'Quarterback', 'Player finding', 'Roster moves', 'Coaching', 'Adversity'];
    const words = shortLabels[i].split(' ');
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#24425d" /><text x="${lx}" y="${ly}" fill="#98abc0" font-size="12" text-anchor="${anchor}">${words.map((w,j)=>`<tspan x="${lx}" dy="${j===0?0:14}">${w}</tspan>`).join('')}</text>`;
  }).join('');
  const polygons = eras.map(era => {
    const points = era.values.map((value, i) => polarPoint(cx, cy, maxR * value / 100, angleFor(i)).join(',')).join(' ');
    const circles = era.values.map((value, i) => { const [x,y] = polarPoint(cx,cy,maxR*value/100,angleFor(i)); return `<circle cx="${x}" cy="${y}" r="3" fill="${era.color}" />`; }).join('');
    return `<polygon points="${points}" fill="${era.color}22" stroke="${era.color}" stroke-width="2" />${circles}`;
  }).join('');
  svg.innerHTML = `${grid}${axes}${polygons}`;
}

function renderQbs() {
  const timeline = document.querySelector('#qb-timeline');
  if (!timeline) return;
  timeline.innerHTML = qbs.map(([years,name,note]) => `<div class="qb-item"><span>${years}</span><strong>${name}</strong><small>${note}</small></div>`).join('');
}

function computeScores(weights) {
  return eras.map(era => ({ ...era, modelScore: era.values.reduce((sum, val, i) => sum + val * (weights[i] / 100), 0) }));
}

function renderModel(weights) {
  const winnerNode = document.querySelector('#model-winner');
  const barsNode = document.querySelector('#model-bars');
  const readingNode = document.querySelector('#model-reading');
  if (!winnerNode || !barsNode || !readingNode) return;
  const scores = computeScores(weights).sort((a,b) => b.modelScore - a.modelScore);
  const winner = scores[0];
  winnerNode.textContent = winner.name;
  barsNode.innerHTML = eras.map(era => {
    const result = scores.find(item => item.id === era.id);
    return `<div class="model-bar-row ${era.id}"><label>${era.name.replace('Chris ','').replace('Ryan ','').replace('Bill ','')}</label><div class="model-bar-track"><span style="width:${result.modelScore}%"></span></div><output>${result.modelScore.toFixed(1)}</output></div>`;
  }).join('');
  const margin = scores[0].modelScore - scores[1].modelScore;
  const complete = weights.filter(Boolean).length >= 5;
  readingNode.textContent = complete
    ? `${winner.name} still wins this complete version by ${margin.toFixed(1)} points.`
    : `${winner.name} wins this deliberately narrow test by ${margin.toFixed(1)} points. That does not make it a complete front-office model.`;
}

function setupSensitivity() {
  const select = document.querySelector('#scenario');
  const list = document.querySelector('#weight-list');
  const form = document.querySelector('#model-controls');
  const reset = document.querySelector('#reset-model');
  if (!select || !list || !form || !reset) return;
  select.innerHTML = Object.entries(scenarioWeights).map(([key, scenario]) => `<option value="${key}">${scenario.label}</option>`).join('');

  function loadWeights(weights) {
    list.innerHTML = dimensions.map((dim, i) => `<div class="weight-row"><label for="weight-${dim.key}">${dim.label}</label><input id="weight-${dim.key}" type="range" min="0" max="50" step="1" value="${weights[i]}" data-weight-index="${i}" /><output>${Math.round(weights[i])}%</output></div>`).join('');
    list.querySelectorAll('input').forEach(input => input.addEventListener('input', () => { input.nextElementSibling.textContent = `${input.value}%`; }));
  }
  loadWeights(scenarioWeights.published.weights);
  renderModel(scenarioWeights.published.weights);

  select.addEventListener('change', () => loadWeights(scenarioWeights[select.value].weights));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const raw = [...list.querySelectorAll('input')].map(input => Number(input.value));
    const total = raw.reduce((a,b) => a+b,0) || 1;
    const normalized = raw.map(value => value / total * 100);
    renderModel(normalized);
  });
  reset.addEventListener('click', () => {
    select.value = 'published'; loadWeights(scenarioWeights.published.weights); renderModel(scenarioWeights.published.weights);
  });
}

function setupNavigation() {
  const button = document.querySelector('.menu-button');
  const nav = document.querySelector('#mobile-nav');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    nav.hidden = expanded;
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.hidden = true; button.setAttribute('aria-expanded','false'); }));
}

function setupDialog() {
  const dialog = document.querySelector('#methodology-dialog');
  if (!dialog) return;
  document.querySelectorAll('[data-open-methodology]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
  dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
}

renderScorecards();
renderRadar();
renderQbs();
setupSensitivity();
setupNavigation();
setupDialog();
