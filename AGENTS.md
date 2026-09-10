# Agent notes — abherbs-web

Public encyclopedia at https://whatsthatflower.com/ (also https://abherbs-backend.web.app/). Vite + React. Repo: `~/WebstormProjects/abherbs-web`, workspace link `~/whatsthatflower/web`.

UI chrome and About/Help copy live in `src/locales.json`. Do not fetch Firebase `web/{lang}` for strings. Regenerating locales keeps extra keys already in that file. Plant labels and the slim index come from RTDB `web/catalog` and `web/labels/{lang}`.

## Language URLs

Indexed languages (official body text): **en** unprefixed, **sk / de / fr / cs** as the first path segment.

- `https://whatsthatflower.com/plant/Bellis%20perennis/` English (`hreflang` + `x-default`)
- `https://whatsthatflower.com/de/plant/Bellis%20perennis/` German

Other UI languages stay on `?lang=pl` (not in the sitemap). `/en/...` 301s to the unprefixed URL (Firebase Hosting). Old `?lang=de` is rewritten in the client to `/de/...`; a crawler 301 needs a Cloudflare Redirect Rule (Firebase cannot match query strings):

`(http.request.uri.query matches "(^|&)lang=(sk|de|fr|cs)(&|$)")` → 301 to `/{lang}` + path, stripping that `lang` param. Skip when the path already starts with `/{lang}`. `lang=en` → same path without the param.

`scripts/generate_seo.js` writes shells + sitemap hreflang for the five indexed languages. Keep `INDEXED_LANGS` in sync with `src/lib.js`.

## Deploy Hosting

Only when the user asks to deploy the website. From this directory:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/Development/Keystore/abherbs-backend-firebase-adminsdk-l5787-839f896846.json"
npm run build
firebase deploy --only hosting --project abherbs-backend --non-interactive
```

`npm run build` is `vite build` then `scripts/generate_seo.js` (plant/family/genus HTML shells + sitemap from live RTDB). Output is `build/`. `.firebaserc` project is `abherbs-backend`. Confirm the new hashed `/assets/index-*.js` is on both live URLs after deploy.

Do not deploy database rules or Storage from this repo.

## Cloudflare (whatsthatflower.com)

Live: NS `leo`/`jule.ns.cloudflare.com`, apex A orange-clouded (origin `151.101.1.195` and `151.101.65.195`), SSL **Full (strict)**. Deploy is unchanged: still `firebase deploy --only hosting`. Registrar is Squarespace Domains; do not drop Mailgun MX/SPF/`pic._domainkey` or the Google site-verification TXT.

WAF custom rule: `(ip.src.country eq "SG" and not cf.client.bot)` → **Managed Challenge**. Tighten to Block from the dashboard if Security Events still show SG scrapers. Do not enable Bot Fight Mode, Rocket Loader, Email Obfuscation, Mirage/Polish, Auto Minify, or “Cache Everything”.

`www` is still a grey CNAME to Squarespace (`ext-sq.squarespace.com`); optional later: proxied A to the Fastly origin + 301 to the apex. `abherbs-backend.web.app`, RTDB, and GCS photos are not behind this proxy.

DNSSEC is off (`unsigned`). To turn it back on: enable DNSSEC in Cloudflare, then add Cloudflare’s DS at Squarespace.

Rollback: grey-cloud the apex A records. Full rollback: restore `ns-cloud-e{1-4}.googledomains.com` from `dns-snapshot-pre-cloudflare.txt` (re-add the old DS only after Google Cloud DNS is authoritative again). If origin TLS 526s, grey-cloud until Firebase renews the custom-domain cert, then orange-cloud again.
