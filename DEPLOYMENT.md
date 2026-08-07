# Era Theory deployment

Era Theory is a static multi-route site in the public repository:

`https://github.com/tucknub/era-theory`

The build output is `dist/`.

## Automated Cloudflare Pages deployment

The repository includes `.github/workflows/deploy-cloudflare.yml`.

Add these GitHub Actions repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The API token should have **Account → Cloudflare Pages → Edit** permission.

Then open the repository's **Actions** tab, choose **Deploy Era Theory to Cloudflare Pages**, and run the workflow. The workflow will:

1. Build the site.
2. Run the route and interaction verification script.
3. Create the `era-theory` Pages project when needed.
4. Deploy `dist/` to Cloudflare Pages.
5. Print the deployment URL.

The expected production alias is:

`https://era-theory.pages.dev`

## Cloudflare Pages repository integration

The repository can instead be connected directly from the Cloudflare dashboard using these settings:

- Repository: `tucknub/era-theory`
- Root directory: `/`
- Build command: `npm run build && npm run verify`
- Build output directory: `dist`
- Production branch: `main`

## Direct Wrangler deployment

Prerequisites:

- Node.js 20+
- An authenticated Cloudflare account
- Wrangler 4.x

```bash
npm run build
npm run verify
npx wrangler pages project create era-theory --production-branch main
npx wrangler pages deploy dist --project-name era-theory --branch main
```

Subsequent releases require:

```bash
npm run build
npm run verify
npx wrangler pages deploy dist --project-name era-theory --branch main
```

## Continuous verification

`.github/workflows/validate.yml` runs on every push to `main` and every pull request. It executes:

```bash
npm run build
npm run verify
```

## Routes

- `/` — Era Theory report library
- `/reports/colts/` — Colts Era Lab

## Release gate

Do not publish a new report until its desktop and mobile views pass visual review, all interactions pass, the research cutoff remains visible, and unresolved evidence is explicitly excluded or labeled.
