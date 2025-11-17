# Cloudflare Worker + GitHub Pages setup

This project uses a Cloudflare Worker as a CORS-friendly proxy for public HK datasets, and GitHub Pages to host the static dashboard.

## 1) Deploy the Worker

1. Open Cloudflare Dashboard → Workers & Pages → Create → Worker (Modules syntax).
2. Replace the default code with `worker/worker.js` from this repo.
3. Deploy, then note the workers.dev URL (e.g., `https://YOUR-SUBDOMAIN.workers.dev`).
4. Optional: add a custom Route (e.g., `https://api.yourdomain.tld/hk*`).

### Update CORS allowlist
Edit `ALLOWED_ORIGINS` in `worker/worker.js` to include your production origin:

- Local dev: `http://localhost`, `http://127.0.0.1`, your XAMPP URL
- GitHub Pages: `https://romski28.github.io`

The dashboard will call these feeds via:

- `?feed=aqhi` → upstream AQHI JSON
- `?feed=pollutants` → `24pc_Eng.xml` (24-hour pollutants)
- `?feed=windcsv` → `latest_10min_wind.csv`
- `?feed=pressure` → `latest_1min_pressure.csv`
- `?feed=visibility` → LTMV visibility CSV

## 2) Point the front-end at the Worker

In `script.js`, the base is already set to your workers.dev URL:

```js
const workerBase = "https://purple-river-7d7a.trials-9f5.workers.dev/?feed=";
```

If you add a custom route/domain, update it here.

## 3) Publish to GitHub Pages

Because the remote repo is currently empty, push your local files and enable Pages.

### Push local project (Windows PowerShell)

```powershell
# From your project root (folder that contains index.html)
cd c:\Xampp_webserver\htdocs\HKDashboard

# Initialize repo if not already
if (!(Test-Path .git)) { git init }

git remote add origin https://github.com/romski28/hkdash.git 2>$null

# Typical ignores for static site
"node_modules/`n.DS_Store`nThumbs.db`n" | Out-File -Encoding utf8 -NoNewline .gitignore -Force

git add -A
git commit -m "Initial commit: HK Dashboard"

git branch -M main

git push -u origin main
```

### Enable GitHub Pages

- Repo → Settings → Pages
- Source: Deploy from a branch
- Branch: `main` / root
- Save; Pages URL will be `https://romski28.github.io/hkdash/`

## 4) Verify with the test harness

Open `test-worker.html` on Pages and click each button:

- AQHI (JSON) → 200 OK, content-type `application/json`
- Pollutants (XML) → 200 OK, content-type `application/xml`
- Wind, Pressure, Visibility (CSV) → 200 OK, proper CORS headers

Headers to expect in responses (from the Worker):

- `Access-Control-Allow-Origin: https://romski28.github.io` (or `*` in dev)
- `Access-Control-Allow-Methods: GET, OPTIONS`
- `Vary: Origin`

## 5) Notes & troubleshooting

- If you see CORS errors on Pages, confirm your Worker added `https://romski28.github.io` to `ALLOWED_ORIGINS` and redeploy.
- If `aqhi` feed shape changes upstream, the Worker normalizes common structures into `{ station, aqhi, health_risk, publish_date }`.
- You can safely increase TTLs for CSVs to reduce upstream load (e.g., 300–600 seconds). Update the `ttl` values in `worker.js`.
- For local dev without the Worker, direct CSV fetches may be blocked by the browser; that’s expected—use the Worker.
