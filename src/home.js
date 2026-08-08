const button = document.querySelector('.menu-button');
const nav = document.querySelector('#home-mobile-nav');

button?.addEventListener('click', () => {
  const expanded = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!expanded));
  nav.hidden = expanded;
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.hidden = true;
  button.setAttribute('aria-expanded', 'false');
}));

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderPublishedTile(report, index) {
  const meta = `${report.league || report.sport || 'SPORT'} · ${report.scoringCutoff || 'Published'}`.toUpperCase();
  const score = Number.isFinite(Number(report.finalScore)) ? Number(report.finalScore).toFixed(1) : '—';
  return `
    <article class="report-tile ${index === 0 ? 'featured' : ''}">
      <div class="report-number">${escapeHtml(report.number)}</div>
      <div class="report-tile-body">
        <p>${escapeHtml(meta)}</p>
        <h3>${escapeHtml(report.publicQuestion || report.title)}</h3>
        <span>${escapeHtml(report.subtitle || report.subject || '')}</span>
        <p>${escapeHtml(report.summary || report.fanSummary || `${report.coreEvidenceRecords || 'Source-linked'} evidence records support this published Era Theory story.`)}</p>
      </div>
      <div class="report-tile-result">
        <strong>${score}</strong>
        <small>${escapeHtml(report.resultLabel || 'Final score')}</small>
        <a href="${escapeHtml(report.route)}">Start the story</a>
      </div>
    </article>`;
}

function renderPlannedTile(number) {
  return `
    <article class="report-tile planned">
      <div class="report-number">${escapeHtml(number)}</div>
      <div class="report-tile-body">
        <p>NEXT STORY · NOT YET SELECTED</p>
        <h3>Another sports argument, researched from scratch.</h3>
        <span>The next franchise and eras will be chosen after Report 001's redesign.</span>
        <p>Era Theory keeps the research standard but adapts the story and scoring to the sport instead of forcing every report into one template.</p>
      </div>
      <div class="report-tile-result"><strong>—</strong><small>Not researched</small><span>Coming later</span></div>
    </article>`;
}

const beltTheoryTile = `
  <article class="report-tile concept">
    <div class="report-number">BT</div>
    <div class="report-tile-body">
      <p>WRESTLING · COMPANION PROJECT</p>
      <h3>Like wrestling history too?</h3>
      <span>Belt Theory</span>
      <p>Championship history and promotion eras researched with the same evidence-first philosophy.</p>
    </div>
    <div class="report-tile-result"><strong>↗</strong><small>Companion project</small><span>Independent</span></div>
  </article>`;

async function hydrateReportLibrary() {
  const library = document.querySelector('.report-library');
  if (!library) return;

  try {
    const response = await fetch('data/reports.json', { cache: 'no-store' });
    if (!response.ok) return;
    const registry = await response.json();
    const published = (registry.reports || [])
      .filter(report => report.status === 'published')
      .sort((a, b) => String(a.number).localeCompare(String(b.number)));
    if (!published.length) return;

    const highest = Math.max(...published.map(report => Number(report.number) || 0));
    const nextNumber = String(highest + 1).padStart(3, '0');
    library.innerHTML = `${published.map(renderPublishedTile).join('')}${renderPlannedTile(nextNumber)}${beltTheoryTile}`;
  } catch {
    // The server-rendered fan-first library remains as a resilient fallback.
  }
}

hydrateReportLibrary();
