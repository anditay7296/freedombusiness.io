# FreedomBusiness — register2s Landing Page

Static clone of the GHL (GoHighLevel) funnel page `https://freedombusiness.io/register2s`,
built for GitHub + Vercel hosting.

## Structure

| Path | What it is |
|------|-----------|
| `index.html` | The full landing page (server-rendered GHL DOM + all original CSS, GHL/Nuxt runtime removed) |
| `css/custom.css` | Small overrides: popup, video player, mobile sticky CTA bar |
| `js/main.js` | Popup open/close, countdown display, FAQ accordion, HLS video player |
| `images/` | All ~50 page images, downloaded from the GHL CDN |

## How things work

- **Lead form**: every CTA opens the STEP #1 popup, which embeds the live GHL form
  (`2Or3z8LHnQJuvQKgwKz7` — "AS to WebinarKit") via iframe. Leads, reCAPTCHA,
  automations, and the form's redirect all continue to run in the GHL account.
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

## Deploy

Pushed to GitHub and connected to Vercel — every push to `main` deploys automatically.
