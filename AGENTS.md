# Agent notes — abherbs-web

Public encyclopedia at https://whatsthatflower.com/ (also https://abherbs-backend.web.app/). Vite + React. Repo: `~/WebstormProjects/abherbs-web`, workspace link `~/whatsthatflower/web`.

UI chrome and About/Help copy live in `src/locales.json`. Do not fetch Firebase `web/{lang}` for strings. Regenerating locales keeps extra keys already in that file. Plant labels and the slim index come from RTDB `web/catalog` and `web/labels/{lang}`.

## Deploy Hosting

Only when the user asks to deploy the website. From this directory:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/Development/Keystore/abherbs-backend-firebase-adminsdk-l5787-839f896846.json"
npm run build
firebase deploy --only hosting --project abherbs-backend --non-interactive
```

`npm run build` is `vite build` then `scripts/generate_seo.js` (plant/family/genus HTML shells + sitemap from live RTDB). Output is `build/`. `.firebaserc` project is `abherbs-backend`. Confirm the new hashed `/assets/index-*.js` is on both live URLs after deploy.

Do not deploy database rules or Storage from this repo.
