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
        <span>The next franchise and eras will be chosen after the current published stories are fully audited as one site.</span>
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

function getReport(published, slug) {
  return published.find(report => report.slug === slug);
}

function renderStoryLane(report) {
  const score = Number.isFinite(Number(report.finalScore)) ? Number(report.finalScore).toFixed(1) : '—';
  return `
    <article class="verdict-lane">
      <div><span>Report ${escapeHtml(report.number)}</span><strong>${score}</strong></div>
      <h3>${escapeHtml(report.subject || report.title)}</h3>
      <p><b>${escapeHtml(report.publicQuestion || report.title)}</b> ${escapeHtml(report.fanSummary || report.summary || '')}</p>
      <small>Winner: ${escapeHtml(report.finalLeader || 'See report')} · <a href="${escapeHtml(report.route)}">Start the story →</a></small>
    </article>`;
}

function updateProofTotals(published) {
  const proof = document.querySelector('.proof-after-story');
  if (!proof) return;

  const completedSeasons = published.reduce((sum, report) => {
    const startYear = report.slug === 'colts' ? 1998 : report.slug === 'lions' ? 2001 : null;
    const endYear = Number(report.lastCompletedSeason);
    return sum + (startYear && endYear ? endYear - startYear + 1 : 0);
  }, 0);
  const evidence = published.reduce((sum, report) => sum + (Number(report.coreEvidenceRecords) || 0), 0);
  const simulations = published.reduce((sum, report) => sum + (Number(report.randomWeightSimulations) || 0), 0);

  proof.innerHTML = `
    <div><strong>${completedSeasons}</strong><span>completed NFL seasons studied</span></div>
    <div><strong>${evidence}</strong><span>core evidence records</span></div>
    <div><strong>${simulations.toLocaleString()}</strong><span>model stress tests</span></div>
    <div><strong>${evidence} / ${evidence}</strong><span>core records source-linked</span></div>`;

  const explainer = document.querySelector('.proof-explainer');
  if (explainer) {
    explainer.innerHTML = '<strong>Why these numbers are down here:</strong> the research supports the stories. Fans should understand the argument first and only go into the audit trail when they want it.';
  }
}

function hydrateHomeIntro(published) {
  const colts = getReport(published, 'colts');
  const lions = getReport(published, 'lions');
  if (!colts || !lions) return;

  const kicker = document.querySelector('.fan-kicker');
  const title = document.querySelector('#home-title');
  const lede = document.querySelector('.fan-lede');
  const heroActions = document.querySelector('.fan-hero .hero-actions');
  const authenticNote = document.querySelector('.authentic-note');
  const headerAction = document.querySelector('.site-header .header-action');
  const mobileHeaderAction = nav?.querySelector('a:last-child');

  if (kicker) kicker.textContent = 'ERA THEORY · SPORTS STORIES · FULL CONTEXT';
  if (title) title.textContent = 'Sports debates, researched all the way through.';
  if (lede) {
    lede.textContent = 'Pick a story. We research the entire era—results, quarterbacks, drafts, trades, coaching, star players and adversity—then guide you through what actually changed in plain English.';
  }
  if (heroActions) {
    heroActions.innerHTML = '<a class="button primary" href="#quick-verdict">Choose a story</a><a class="button secondary" href="#how-it-works">How it works</a>';
  }
  if (authenticNote) {
    authenticNote.innerHTML = '<strong>Real history, real photography.</strong> The hero artwork features Report 001. Era Theory now has two published NFL stories; choose Colts or Lions below. Real people use rights-reviewed source photography, never AI stand-ins.';
  }
  if (headerAction) {
    headerAction.textContent = 'Explore stories';
    headerAction.setAttribute('href', '#quick-verdict');
  }
  if (mobileHeaderAction) {
    mobileHeaderAction.textContent = 'Explore stories';
    mobileHeaderAction.setAttribute('href', '#quick-verdict');
  }

  const quickHeading = document.querySelector('.quick-verdict-heading');
  const lanes = document.querySelector('.verdict-lanes');
  const quickLink = document.querySelector('.quick-verdict > .text-link');
  if (quickHeading) {
    quickHeading.innerHTML = `
      <p>Choose a story</p>
      <h2 id="verdict-title">Two franchises. Two very different organizational questions.</h2>
      <p>You do not need to learn our model first. Pick the argument you care about and the report will walk you through the answer.</p>`;
  }
  if (lanes) lanes.innerHTML = `${renderStoryLane(colts)}${renderStoryLane(lions)}`;
  if (quickLink) {
    quickLink.textContent = 'See the full story library →';
    quickLink.setAttribute('href', '#reports');
  }

  const guide = document.querySelector('.story-guide');
  if (guide) {
    const heading = guide.querySelector('.section-heading');
    const rail = guide.querySelector('.story-question-rail');
    if (heading) {
      heading.innerHTML = `
        <div><p>Start with the fan question</p><h2 id="guide-title">You should always know what you are learning next.</h2></div>
        <p class="section-intro">Every report starts with the quick answer, then moves through recognizable players, decisions and moments before exposing the technical proof.</p>`;
    }
    if (rail) {
      rail.innerHTML = `
        <a href="${escapeHtml(colts.route)}#polian"><b>COLTS</b><span>Was Polian really just Peyton?</span></a>
        <a href="${escapeHtml(colts.route)}#ballard"><b>COLTS</b><span>Why didn't Ballard's talent become wins?</span></a>
        <a href="${escapeHtml(lions.route)}#millen"><b>LIONS</b><span>How bad was Millen really?</span></a>
        <a href="${escapeHtml(lions.route)}#stafford"><b>LIONS</b><span>Who actually gets credit for Stafford?</span></a>
        <a href="${escapeHtml(lions.route)}#holmes"><b>LIONS</b><span>What did Holmes actually fix?</span></a>`;
    }
  }

  updateProofTotals(published);

  const footerCopy = document.querySelector('footer p');
  if (footerCopy) {
    footerCopy.textContent = 'Reports 001 and 002 are complete through the 2025 NFL season. Real people and historical moments use authentic source photography.';
  }
}

async function hydrateHomepage() {
  const library = document.querySelector('.report-library');

  try {
    const response = await fetch('data/reports.json', { cache: 'no-store' });
    if (!response.ok) return;
    const registry = await response.json();
    const published = (registry.reports || [])
      .filter(report => report.status === 'published')
      .sort((a, b) => String(a.number).localeCompare(String(b.number)));
    if (!published.length) return;

    hydrateHomeIntro(published);

    if (library) {
      const highest = Math.max(...published.map(report => Number(report.number) || 0));
      const nextNumber = String(highest + 1).padStart(3, '0');
      library.innerHTML = `${published.map(renderPublishedTile).join('')}${renderPlannedTile(nextNumber)}${beltTheoryTile}`;
    }
  } catch {
    // Keep the server-rendered fallback if the registry cannot be loaded.
  }
}

hydrateHomepage();
