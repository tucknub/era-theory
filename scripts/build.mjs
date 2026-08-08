import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const src = resolve(root, 'src');
const dist = resolve(root, 'dist');
const baseUrl = 'https://era-theory.pages.dev';
const siteName = 'Era Theory';
const siteDescription = 'Era Theory publishes research-driven visual reports comparing leadership eras across sports.';

const registry = JSON.parse(await readFile(resolve(src, 'data', 'reports.json'), 'utf8'));
if (registry.schemaVersion !== 1 || !Array.isArray(registry.reports)) {
  throw new Error('Invalid report registry schema.');
}

const published = registry.reports.filter(report => report.status === 'published');
const numbers = new Set();
const slugs = new Set();
for (const report of published) {
  if (!report.number || !report.slug || !report.route) throw new Error('Published report is missing number, slug, or route.');
  if (numbers.has(report.number)) throw new Error(`Duplicate report number: ${report.number}`);
  if (slugs.has(report.slug)) throw new Error(`Duplicate report slug: ${report.slug}`);
  if (report.route.startsWith('/') || report.route.includes('..')) throw new Error(`Unsafe report route: ${report.route}`);
  if (report.methodologyRoute && (report.methodologyRoute.startsWith('/') || report.methodologyRoute.includes('..'))) {
    throw new Error(`Unsafe methodology route: ${report.methodologyRoute}`);
  }
  numbers.add(report.number);
  slugs.add(report.slug);
}

function publicUrl(route = '') {
  const clean = route.replace(/index\.html$/i, '').replace(/^\/+/, '');
  return clean ? `${baseUrl}/${clean}` : `${baseUrl}/`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function metadataBlock({ title, description, url, type = 'website', structuredData }) {
  const jsonLd = JSON.stringify(structuredData).replaceAll('<', '\\u003c');
  return [
    `  <link rel="canonical" href="${escapeHtml(url)}" />`,
    '  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
    '  <link rel="manifest" href="/site.webmanifest" />',
    `  <meta property="og:site_name" content="${siteName}" />`,
    `  <meta property="og:title" content="${escapeHtml(title)}" />`,
    `  <meta property="og:description" content="${escapeHtml(description)}" />`,
    `  <meta property="og:type" content="${type}" />`,
    `  <meta property="og:url" content="${escapeHtml(url)}" />`,
    '  <meta name="twitter:card" content="summary" />',
    `  <meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `  <meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `  <script type="application/ld+json">${jsonLd}</script>`
  ].join('\n');
}

async function injectMetadata(relativePath, metadata) {
  const path = resolve(dist, relativePath);
  let html = await readFile(path, 'utf8');
  if (!html.includes('</head>')) throw new Error(`Cannot inject metadata into ${relativePath}: missing </head>.`);
  html = html.replace('</head>', `${metadataBlock(metadata)}\n</head>`);
  await writeFile(path, html);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(src, dist, { recursive: true });

await injectMetadata('index.html', {
  title: 'Era Theory — Sports leadership, measured',
  description: siteDescription,
  url: `${baseUrl}/`,
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: `${baseUrl}/`,
    description: siteDescription
  }
});

for (const report of published) {
  const url = publicUrl(report.route);
  const description = `Era Theory Report ${report.number}: ${report.title}. ${report.subtitle || report.subject || ''} ${report.scoringCutoff || ''}`.replace(/\s+/g, ' ').trim();
  await injectMetadata(report.route, {
    title: `${report.title} — Era Theory`,
    description,
    url,
    type: 'article',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: report.title,
      description,
      mainEntityOfPage: url,
      about: report.subject || report.sport,
      author: { '@type': 'Organization', name: siteName, url: `${baseUrl}/` },
      isPartOf: { '@type': 'WebSite', name: siteName, url: `${baseUrl}/` }
    }
  });
}

const methodologyRoutes = [...new Set(published.map(report => report.methodologyRoute).filter(Boolean))];
for (const route of methodologyRoutes) {
  await injectMetadata(route, {
    title: 'Methodology & Sources — Era Theory',
    description: 'Public methodology, evidence inventory, source policy, robustness tests and limitations for Era Theory reports.',
    url: publicUrl(route),
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Methodology & Sources — Era Theory',
      url: publicUrl(route),
      isPartOf: { '@type': 'WebSite', name: siteName, url: `${baseUrl}/` }
    }
  });
}

const sitemapUrls = [
  `${baseUrl}/`,
  ...published.map(report => publicUrl(report.route)),
  ...methodologyRoutes.map(route => publicUrl(route))
];
const uniqueSitemapUrls = [...new Set(sitemapUrls)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniqueSitemapUrls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(resolve(dist, 'sitemap.xml'), sitemap);
await writeFile(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`);

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Era Theory"><rect width="64" height="64" rx="12" fill="#030b16"/><path d="M13 14h38v8H22v7h24v8H22v7h29v8H13V14Z" fill="#69c6ff"/><path d="M35 22h16v8h-4v22h-9V30h-3v-8Z" fill="#f4c95d"/></svg>\n`;
await writeFile(resolve(dist, 'favicon.svg'), favicon);
await writeFile(resolve(dist, 'site.webmanifest'), JSON.stringify({
  name: siteName,
  short_name: 'Era Theory',
  start_url: '/',
  display: 'standalone',
  background_color: '#030b16',
  theme_color: '#030b16',
  icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
}, null, 2) + '\n');

const notFound = `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1" />\n  <meta name="robots" content="noindex" />\n  <meta name="theme-color" content="#030b16" />\n  <title>Page not found — Era Theory</title>\n  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />\n  <link rel="stylesheet" href="/styles.css" />\n  <link rel="stylesheet" href="/home.css" />\n</head>\n<body class="home-page">\n  <main id="main">\n    <section class="roadmap-section" style="min-height:70vh;margin-top:8vh">\n      <div><p class="report-label">404 · OUTSIDE THE EVIDENCE</p><h1>That page is not part of this era.</h1><p>The route may have moved, or the report has not been published.</p></div>\n      <a class="button primary" href="/">Return to Era Theory</a>\n    </section>\n  </main>\n</body>\n</html>\n`;
await writeFile(resolve(dist, '404.html'), notFound);

const headers = `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n`;
await writeFile(resolve(dist, '_headers'), headers);

console.log(`Built Era Theory into dist/ with ${published.length} published report${published.length === 1 ? '' : 's'}, SEO metadata, sitemap, robots, favicon, 404, and security headers.`);
