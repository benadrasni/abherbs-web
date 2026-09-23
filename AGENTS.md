# Agent notes — abherbs-web

Public encyclopedia at https://whatsthatflower.com/ (also https://abherbs-backend.web.app/). Vite + React. Repo: `~/whatsthatflower/web`.

UI chrome and About/Help copy live in `src/locales.json`. Do not fetch Firebase `web/{lang}` for strings. Regenerating locales keeps extra keys already in that file. Plant labels and the slim index come from RTDB `web/catalog` and `web/labels/{lang}`.

## Language URLs

Indexed languages (official body text): **en** unprefixed, **sk / de / fr / cs / pl / ru / es / pt / ja / it / nl / uk / hu / da / sv / no / fi / et / lv / lt / hr / sl** as the first path segment.

- `https://whatsthatflower.com/plant/Bellis%20perennis/` English (`hreflang` + `x-default`)
- `https://whatsthatflower.com/de/plant/Bellis%20perennis/` German
- `https://whatsthatflower.com/pl/plant/Bellis%20perennis/` Polish
- `https://whatsthatflower.com/ru/plant/Bellis%20perennis/` Russian
- `https://whatsthatflower.com/es/plant/Bellis%20perennis/` Spanish
- `https://whatsthatflower.com/pt/plant/Bellis%20perennis/` Portuguese
- `https://whatsthatflower.com/ja/plant/Bellis%20perennis/` Japanese
- `https://whatsthatflower.com/it/plant/Bellis%20perennis/` Italian
- `https://whatsthatflower.com/nl/plant/Bellis%20perennis/` Dutch
- `https://whatsthatflower.com/uk/plant/Bellis%20perennis/` Ukrainian
- `https://whatsthatflower.com/hu/plant/Bellis%20perennis/` Hungarian
- `https://whatsthatflower.com/da/plant/Bellis%20perennis/` Danish
- `https://whatsthatflower.com/sv/plant/Bellis%20perennis/` Swedish
- `https://whatsthatflower.com/no/plant/Bellis%20perennis/` Norwegian
- `https://whatsthatflower.com/fi/plant/Bellis%20perennis/` Finnish
- `https://whatsthatflower.com/et/plant/Bellis%20perennis/` Estonian
- `https://whatsthatflower.com/lv/plant/Bellis%20perennis/` Latvian
- `https://whatsthatflower.com/lt/plant/Bellis%20perennis/` Lithuanian
- `https://whatsthatflower.com/hr/plant/Bellis%20perennis/` Croatian
- `https://whatsthatflower.com/sl/plant/Bellis%20perennis/` Slovenian

Other UI languages stay on `?lang=` (not in the sitemap). `/en/...` 301s to the unprefixed URL (Firebase Hosting). The `/en/:path*` destination must keep the trailing slash (`/:path/`) so Google does not get a second hop from `trailingSlash: true`. Old `?lang=de` is rewritten in the client to `/de/...`; a crawler 301 needs a Cloudflare Redirect Rule (Firebase cannot match query strings):

`(http.request.uri.query matches "(^|&)lang=(sk|de|fr|cs|pl|ru|es|pt|ja|it|nl|uk|hu|da|sv|no|fi|et|lv|lt|hr|sl)(&|$)")` → 301 to `/{lang}` + path, stripping that `lang` param. Skip when the path already starts with `/{lang}`. `lang=en` → same path without the param.

Old homepage query `?plant=Bellis%20perennis` is rewritten in the client to `/plant/Bellis%20perennis/`. A crawler 301 also needs a Cloudflare Redirect Rule (keep **Preserve query string** off so `plant` is dropped):

- When: `len(http.request.uri.args["plant"]) > 0` and path is `/` or `/{lang}/` for an indexed path lang (`sk|de|fr|cs|pl|ru|es|pt|ja|it|nl|uk|hu|da|sv|no|fi|et|lv|lt|hr|sl`).
- Then: Dynamic 301 to `concat("https://whatsthatflower.com", <lang prefix or empty>, "/plant/", url_encode(http.request.uri.args["plant"][0]), "/")`. If `lang` is also in the query, use that prefix (same codes); `lang=en` stays unprefixed.
- Place this next to the `?lang=` rule. If both `plant` and `lang` are present, one hop to `/{lang}/plant/{name}/` is better than `?lang=` first then `?plant=`.

`scripts/generate_seo.js` writes shells + sitemap hreflang for the twenty-three indexed languages. Keep `INDEXED_LANGS` in sync with `src/lib.js`. Client `withLang` / `plantPath` links include a trailing slash so they match the sitemap and do not 301.

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
