# FreedomBusiness — register2s Landing Page

Static clone of the GHL (GoHighLevel) funnel page `https://freedombusiness.io/register2s`,
built for GitHub + Vercel hosting.

## Structure

| Path | What it is |
|------|-----------|
| `index.html` | The full landing page (server-rendered GHL DOM + all original CSS, GHL/Nuxt runtime removed) |
| `css/custom.css` | Small overrides: popup, video player, mobile sticky CTA bar |
| `js/main.js` | Signup popup (GHL bridge + fallback), class dates, timeline, milestones, FAQ, slider, HLS video — shared by the site and the GHL build |
| `js/fx-cards.js` | Animated USD conversion cards |
| `images/` | All ~50 page images, downloaded from the GHL CDN |
| `scripts/build-ghl.mjs` | Builds the GHL custom-code file (`npm run build:ghl`) |
| `ghl/` | Generated GHL file: `ghl-custom-code.html` + byte-identical `.md` (don't edit by hand) |
| `landing-page-checklist.md` | The rules every landing page must meet before it goes into GHL |

## How things work

- **Signup popup**: opens only when a button is tapped (never on load / exit-intent / timer).
  On the site it embeds GHL form `EodgI0gvzRubFNIZ7JUD` via iframe, passing the page's ad
  parameters (utm_*, fbclid, gclid, ttclid, ad_id, adset_id, campaign_id). Inside GHL the same
  code opens the page's *native* GHL popup instead, so signups count as funnel opt-ins.
- **Class dates**: always the next Wednesday & Thursday in Malaysia time, rolling over at
  Wednesday 21:00 MYT. The date in the HTML is only a placeholder.
- **Video**: streams the original GHL-hosted HLS video via hls.js (native HLS on Safari),
  autoplay muted with a click-to-unmute button.
- **Tracking**: GTM `GTM-PHKJ7575` (loads GA4, Google Ads, TikTok, Clarity, FB pixel
  1672390346903739) plus the direct Meta pixel `1099349107804705`, same as the live page.
- **Testimonials**: Senja widget embed (same widget ID as live).
- **Mobile sticky bar**: the "免费继续 STEP #2" section is hidden on desktop and fixed
  to the bottom of the viewport on mobile, matching live behavior.

## Local preview

```bash
python3 -m http.server 8899
# open http://localhost:8899
```

## GHL custom-code build

```bash
npm run build:ghl
```

Writes `ghl/ghl-custom-code.html` (and an identical `.md`): one self-contained block —
page markup, every stylesheet scoped inside `.fb-ghl` so it can't touch the GHL page or its
popup, and the page's JS. Select all → paste into a GHL *Custom HTML/Javascript* element →
Save → Publish. The GHL page also needs a native Popup (STEP #1 + native Form, all display
triggers off) and one hidden builder Button set to *Show Popup*. Images load from the Vercel
site, so new images only appear in GHL after the site is redeployed. In the GHL version the
inline form is left out (its submissions wouldn't count as opt-ins); the YES button below it
opens the popup instead.

## Deploy

Pushed to GitHub and connected to Vercel — every push to `main` deploys automatically
(branches get preview deployments).
