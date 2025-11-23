# CORS Error Debugging Guide for GitHub Pages

## Quick Diagnosis Steps

### 1. Check Browser Console
Open DevTools (F12) → Console tab and look for:
- "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
- Check which specific request is failing

### 2. Network Tab Inspection
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Find failed requests to `purple-river-7d7a.trials-9f5.workers.dev`
4. Click on the request and check:
   - **Headers → Response Headers**: Look for `access-control-allow-origin`
   - **Headers → Request Headers**: Check if `origin` header is present
   - **Preview/Response**: See if data was actually returned despite CORS error

### 3. Verify Worker Deployment
Check which worker version is deployed:

#### In Browser Console on your GitHub Pages site:
```javascript
fetch('https://purple-river-7d7a.trials-9f5.workers.dev/?feed=aqhi')
  .then(r => {
    console.log('Worker Version:', r.headers.get('x-worker-version'));
    console.log('Debug Origin:', r.headers.get('x-debug-origin'));
    console.log('CORS Origin:', r.headers.get('access-control-allow-origin'));
    console.log('All Headers:', [...r.headers.entries()]);
  });
```

### 4. Check Cloudflare Dashboard
Go to: https://dash.cloudflare.com/
1. Select your account
2. Go to "Workers & Pages"
3. Click on "purple-river-7d7a"
4. Click "Quick Edit" to see current code
5. Verify it matches `worker-fixed.js` or `worker-debug.js`

## Common CORS Issues & Fixes

### Issue 1: Old Worker Code Still Deployed
**Symptom**: Intermittent failures, mix of working/non-working requests
**Cause**: Old worker version with inconsistent CORS handling
**Fix**: 
1. Deploy `worker-debug.js` to see detailed logs
2. Check Cloudflare Workers logs (Dashboard → Workers → purple-river-7d7a → Logs)
3. If no `X-Worker-Version` header, redeploy fixed worker

### Issue 2: Cloudflare Edge Cache
**Symptom**: Some requests work, others fail, pattern seems random
**Cause**: Edge cache serving mixed responses (some with correct CORS, some without)
**Fix**:
1. Purge Cloudflare cache:
   ```bash
   # In Cloudflare Dashboard:
   # Workers → purple-river-7d7a → Settings → Purge Cache
   ```
2. Or add cache-busting to worker:
   ```javascript
   // In worker, change cache key:
   cf: {
     cacheTtl: CACHE_TTL[feed] || 300,
     cacheEverything: true,
     cacheKey: request.url + '?v=2' // Increment version
   }
   ```

### Issue 3: Preflight Request Failing
**Symptom**: Network tab shows OPTIONS request with status 0 or error
**Cause**: Preflight not returning correct headers
**Fix**: Ensure worker has proper OPTIONS handler (worker-fixed.js has this)

### Issue 4: GitHub Pages Domain Not in CORS Policy
**Symptom**: Only fails on GitHub Pages, works locally
**Cause**: Worker might be restricting origins
**Check**: Look for origin allowlist in worker code (worker-fixed.js allows all origins)

## Temporary Workaround
Add retry logic with cache-busting in simpledashboard.html:

```javascript
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const cacheBust = i > 0 ? `&_=${Date.now()}` : '';
      const response = await fetch(url + cacheBust);
      if (response.ok) return response;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
}
```

## Advanced Debugging

### Enable Worker Real-Time Logs
1. Go to Cloudflare Dashboard
2. Workers → purple-river-7d7a → Logs
3. Click "Begin log stream"
4. Open your GitHub Pages site in another tab
5. Watch logs in real-time as requests come in

### Test Worker Directly
```bash
# Test from command line (PowerShell):
curl -v "https://purple-river-7d7a.trials-9f5.workers.dev/?feed=aqhi" -H "Origin: https://romski28.github.io"

# Look for in response:
# access-control-allow-origin: https://romski28.github.io
# x-worker-version: debug-v1.0 (if debug worker deployed)
```

### Check Response Headers Match
The worker should return:
```
access-control-allow-origin: <your-github-pages-origin>
access-control-allow-methods: GET, HEAD, OPTIONS
access-control-allow-headers: Content-Type, If-None-Match, If-Modified-Since, Accept
vary: Origin (when origin header present)
```

## Deploy Debug Worker

1. Copy contents of `worker/worker-debug.js`
2. Go to Cloudflare Dashboard → Workers → purple-river-7d7a
3. Click "Quick Edit"
4. Replace all code with worker-debug.js
5. Click "Save and Deploy"
6. Test your GitHub Pages site
7. Check logs in Cloudflare Dashboard for detailed request/response info

## Most Likely Causes (in order)

1. **Old worker code still deployed** - Check version header
2. **Cloudflare edge cache** - Purge cache
3. **Upstream API timeout** - Check worker logs for upstream failures
4. **Browser cache** - Hard refresh (Ctrl+Shift+R)

## GitHub Pages Specific Issues

GitHub Pages serves from:
- `https://<username>.github.io/<repo-name>/`
- Make sure worker allows this origin
- Check if repo is public (private repos might have issues)

## Need More Help?

Check:
1. Cloudflare Worker Logs (real-time)
2. Browser Network tab (exact failed request)
3. Worker code deployed (Quick Edit view)
4. GitHub Pages deployment status (Settings → Pages)
