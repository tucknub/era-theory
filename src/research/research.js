const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#research-mobile-nav');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    mobileNav.hidden = expanded;
  });

  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function startYearFor(report) {
  if (report.slug === 'colts') return 1998;
  if (report.slug === 'lions') return 2001;
  return null;
}

function reportCard(report, mode) {
  const start = startYearFor(report);
  const end = Number(report.lastCompletedSeason);
  const seasons = start && end ? end - start + 1 : '—';
  const score = Number(report.finalScore).toFixed(1);
  const href = mode === 'detail' ? '#evidence' : `../${escapeHtml(report.methodologyRoute)}`;
  const label = mode === 'detail' ? 'View the Report 001 worked example below' : 'Open this report’s proof';
  return `<article>
    <span>REPORT ${escapeHtml(report.number)}</span>
    <strong>${escapeHtml(report.coreEvidenceRecords)}</strong>
    <h3>${escapeHtml(report.subject)}</h3>
    <p>${seasons} completed seasons · ${Number(report.randomWeightSimulations).toLocaleString()} model tests · winner: ${escapeHtml(report.finalLeader)} (${score})</p>
    <a href="${href}">${label} →</a>
  </article>`;
}

async function hydrateResearchHub() {
  try {
    const response = await fetch('../data/reports.json', { cache: 'no-store' });
    if (!response.ok) return;
    const registry = await response.json();
    const published = (registry.reports || [])
      .filter(report => report.status === 'published')
      .sort((a, b) => String(a.number).localeCompare(String(b.number)));
    if (published.length < 2) return;

    const colts = published.find(report => report.slug === 'colts');
    const lions = published.find(report => report.slug === 'lions');
    if (!colts || !lions) return;

    const totalEvidence = published.reduce((sum, report) => sum + (Number(report.coreEvidenceRecords) || 0), 0);
    const totalSimulations = published.reduce((sum, report) => sum + (Number(report.randomWeightSimulations) || 0), 0);
    const totalSeasons = published.reduce((sum, report) => {
      const start = startYearFor(report);
      const end = Number(report.lastCompletedSeason);
      return sum + (start && end ? end - start + 1 : 0);
    }, 0);

    const headerAction = document.querySelector('.site-header .header-action');
    const mobileAction = mobileNav?.querySelector('a:last-child');
    if (headerAction) {
      headerAction.textContent = 'Explore stories';
      headerAction.setAttribute('href', '../index.html#quick-verdict');
    }
    if (mobileAction) {
      mobileAction.textContent = 'Explore stories';
      mobileAction.setAttribute('href', '../index.html#quick-verdict');
    }

    const heroActions = document.querySelector('.research-hero .hero-actions');
    if (heroActions) {
      heroActions.innerHTML = '<a class="button primary" href="#quick">Show me the simple version</a><a class="button secondary" href="#report-proof">Choose a report’s proof</a>';
    }

    const audit = document.querySelector('.audit-strip');
    if (audit) {
      audit.setAttribute('aria-label', 'Era Theory published research audit summary');
      audit.innerHTML = `
        <div><strong>${totalSeasons}</strong><span>completed NFL seasons studied</span></div>
        <div><strong>${totalEvidence}</strong><span>core evidence records</span></div>
        <div><strong>${totalEvidence} / ${totalEvidence}</strong><span>core records carry a source</span></div>
        <div><strong>${totalSimulations.toLocaleString()}</strong><span>alternate model tests</span></div>`;
    }

    const quick = document.querySelector('#quick');
    if (quick && !document.querySelector('#report-proof')) {
      const chooser = document.createElement('section');
      chooser.className = 'research-section';
      chooser.id = 'report-proof';
      chooser.innerHTML = `
        <div class="research-heading"><p>Choose the proof you want</p><h2>Same research philosophy. Separate report audits.</h2></div>
        <p class="research-intro">The method is shared, but the evidence and judgment calls are report-specific. The Colts detail remains the first worked example below; Detroit has its own methodology page.</p>
        <div class="result-proof report-proof-grid">
          ${reportCard(colts, 'detail')}
          ${reportCard(lions, 'separate')}
          <article><span>ALL PUBLISHED REPORTS</span><strong>${totalEvidence}</strong><h3>Combined audit trail</h3><p>${totalSeasons} completed seasons · ${totalSimulations.toLocaleString()} model tests · ${totalEvidence} / ${totalEvidence} core records source-linked.</p><a href="../index.html#reports">Choose a story →</a></article>
        </div>`;
      quick.insertAdjacentElement('afterend', chooser);
    }

    const evidenceHeading = document.querySelector('#evidence .research-heading');
    const evidenceIntro = document.querySelector('#evidence .research-intro');
    if (evidenceHeading) {
      evidenceHeading.innerHTML = '<p>Report 001 worked example</p><h2>How deep did the Colts audit go?</h2>';
    }
    if (evidenceIntro) {
      evidenceIntro.innerHTML = `The ${colts.coreEvidenceRecords} count below is the Colts report’s row-level evidence base. Detroit is a separate ${lions.coreEvidenceRecords}-record audit; <a href="lions/index.html">open the Detroit methodology →</a>`;
    }

    const modelIntro = document.querySelector('#model .research-intro');
    if (modelIntro) {
      modelIntro.textContent = 'Reports 001 and 002 use the same seven NFL dimensions and weights so the framework is comparable, while the underlying evidence, context and judgments remain report-specific.';
    }
    const resultProof = document.querySelector('#model .result-proof');
    if (resultProof) {
      resultProof.innerHTML = `
        <article><span>Report 001 result</span><strong>${Number(colts.finalScore).toFixed(1)}</strong><h3>${escapeHtml(colts.finalLeader)}</h3><p>Indianapolis Colts · ${escapeHtml(colts.subtitle)}</p></article>
        <article><span>Report 002 result</span><strong>${Number(lions.finalScore).toFixed(1)}</strong><h3>${escapeHtml(lions.finalLeader)}</h3><p>Detroit Lions · ${escapeHtml(lions.subtitle)}</p></article>
        <article><span>Robustness work</span><strong>${totalSimulations.toLocaleString()}</strong><h3>Model tests</h3><p>${Number(colts.randomWeightSimulations).toLocaleString()} per published NFL report, plus named scenarios and leave-one-out tests.</p></article>`;
    }
    const counterexample = document.querySelector('.counterexample-box');
    if (counterexample) {
      counterexample.innerHTML = '<h3>Can a different definition change the winner?</h3><p>Yes in Indianapolis: Ballard wins a deliberately narrow drafting-and-transactions model, while Grigson wins a narrow roster-plus-adversity model. Detroit is different: Holmes remained first even in the extreme named models. The point is not to force every report toward the same robustness story—it is to show how fragile or durable each conclusion really is.</p>';
    }

    const sourceHeading = document.querySelector('#sources .research-heading');
    const sourceIntro = document.querySelector('#sources .research-intro');
    const sourceLines = document.querySelector('#sources .source-lines');
    if (sourceHeading) sourceHeading.innerHTML = '<p>Where does the information come from?</p><h2>Every core evidence row in both published reports has a source.</h2>';
    if (sourceIntro) sourceIntro.textContent = 'We prefer official or primary organizational sources, established historical/statistical databases and explicit attribution for every rights-reviewed photograph. Judgment calls stay labeled as judgment calls.';
    if (sourceLines) {
      sourceLines.innerHTML = `
        <article><h3>Indianapolis Colts</h3><p>Official transaction releases, coaching announcements, season retrospectives and organizational history for Report 001.</p><a href="https://www.colts.com/" target="_blank" rel="noreferrer">Visit Colts source material ↗</a></article>
        <article><h3>Detroit Lions</h3><p>Official leadership, transaction and historical material supporting Report 002.</p><a href="https://www.detroitlions.com/" target="_blank" rel="noreferrer">Visit Lions source material ↗</a></article>
        <article><h3>Pro Football Reference</h3><p>Year-by-year team records, draft history, coaching context and player-honor reference tables across both reports.</p><a href="https://www.pro-football-reference.com/" target="_blank" rel="noreferrer">Open historical database ↗</a></article>
        <article><h3>nflverse</h3><p>A structured reference used to cross-check master NFL draft-pick history.</p><a href="https://github.com/nflverse/nfldata" target="_blank" rel="noreferrer">Open nflverse data ↗</a></article>
        <article><h3>Authentic imagery</h3><p>Real people and historical moments use rights-reviewed real photography with creator, license and modification records.</p><a href="../image-credits.html">See image credits & rights →</a></article>`;
    }
    const privateWorkbook = document.querySelector('.private-workbook');
    if (privateWorkbook) {
      privateWorkbook.innerHTML = '<strong>Why aren’t the full research workbooks public?</strong><p>Each report’s organized native research workbook is kept private so the underlying research asset is not simply handed away. Public transparency comes from publishing evidence counts, formulas, source policies, exclusions, limitations and interactive model tests.</p>';
    }

    const limitsHeading = document.querySelector('#limits .research-heading');
    const limitLines = document.querySelector('#limits .limit-lines');
    if (limitsHeading) limitsHeading.innerHTML = '<p>What can’t these projects know?</p><h2>The framework has limits, and every report has to show them.</h2>';
    if (limitLines) {
      limitLines.innerHTML = `
        <article><h3>No private team information</h3><p>We do not have internal scouting boards, medical files, ownership discussions, contract negotiations or private coaching evaluations.</p></article>
        <article><h3>Recent players need time</h3><p>Young draft classes and recent acquisitions are not forced into mature grades before enough NFL evidence exists.</p></article>
        <article><h3>Unresolved future assets stay unresolved</h3><p>Trades involving future picks or incomplete on-field returns can be recorded without pretending the final value is already known.</p></article>
        <article><h3>Active seasons do not rewrite finished history</h3><p>Both published NFL verdicts currently stop after completed 2025 seasons. Active 2026 evidence does not move those historical scores yet.</p></article>
        <article><h3>Some categories require judgment</h3><p>Draft, transaction, coaching and adversity grades include evidence-coded judgment. The rules stay explicit so readers can disagree with them.</p></article>
        <article><h3>Stress tests are not truth probabilities</h3><p>Random-weight simulations measure ranking fragility when priorities change. They do not convert a sports-history conclusion into an objective probability of truth.</p></article>`;
    }

    const next = document.querySelector('.research-next');
    if (next) {
      next.innerHTML = '<div><p class="research-kicker">Ready to go back to football?</p><h2>The methodology should explain the stories—not replace them.</h2></div><a class="button primary" href="../index.html#quick-verdict">Choose a story</a>';
    }

    const footer = document.querySelector('footer p');
    if (footer) footer.textContent = 'Reports 001 and 002 are complete through the 2025 NFL season. Full research workbooks retained privately; public methodology and source trails remain auditable.';
  } catch {
    // Keep the server-rendered Report 001 worked example if the report registry cannot load.
  }
}

hydrateResearchHub();
