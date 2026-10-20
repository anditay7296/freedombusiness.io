# Landing page checklist — "follow my register2u page"

When a landing-page repo (e.g. `kiwi-link/aia-lp`, `kiwi-link/aial-lp-aug-mcn`) is updated, or a new one comes in, it must match **freedombusiness.io/register2u** on these points before it goes into GHL.

---

## 1. No auto popup

- No exit-intent popup (mouse leaving the page), no timer popup (e.g. "after 20s / 25s / 45s"), no popup on page load.
- The signup popup opens **only when a visitor taps a button**.
- If a repo has one, remove it. Example: aia-lp's `StepModal` had exit-intent + a 25-second mobile timer.

## 2. Button action — every signup button opens the GHL form popup

- **Which buttons:** all of them — hero, every section CTA, the signup section, and the sticky bottom bar.
- **What opens:** a popup with the GHL form `EodgI0gvzRubFNIZ7JUD` (`https://link.atheonos.com/widget/form/EodgI0gvzRubFNIZ7JUD`).
- **Popup wording (exact):**
  - Title: `STEP #1 : Confirm Your Details`
  - Subtitle: `（领取学习链接 + 免费AI工具）`
  - Note under the form: `**请稍等片刻，表格正在准备中...`
- **Closing:** ✕, tap outside, or Esc. It must reopen on the next tap.
- **Ad tracking:** pass these from the page URL into the form: `utm_source utm_medium utm_campaign utm_content utm_term utm_id fbclid gclid ttclid ad_id adset_id campaign_id`.
- **Never ship a design-only form.** The MCN page's original form showed "success" but sent nothing anywhere — every signup was lost.

### On the website (Vercel)
- Embed the GHL form as an iframe with `id="inline-<formId>"`, `data-form-id`, `data-layout-iframe-id`, and load `https://link.msgsndr.com/js/form_embed.js` so the form sets its own height.
- Submissions create GHL contacts but **do not count as funnel opt-ins**.

### In GHL (custom code)
- Opt-ins only count from GHL's **native** popup + native Form element. The GHL page needs:
  1. A native Popup with the STEP #1 heading and the native Form, with **all display triggers off**.
  2. **One** hidden builder Button whose action is **Show Popup** (the only builder button on the page).
- The custom code clicks that hidden button the first time, then re-shows the same popup itself afterwards. It never clicks it twice, because a second click closes the popup.
- It intercepts GHL's close button (`.closeLPModal`) so the popup is hidden, not deleted. Deleting it also deletes the form's styles. It hides the `#overlay` backdrop too; otherwise the page stays dimmed and buttons stop working.
- If the GHL page has no native popup, the code falls back to its own popup with the iframe form.

## 3. Footer — company, address, phone numbers

```
Copyright © 2026 · All Rights Reserved.
Funnel Duo Media Sdn. Bhd. 201901011215 (1320543-M)
Tower 1, Mercu Mustapha Kamal, No. 1, Jalan PJU 8/1, Bandar Damansara Perdana, Petaling Jaya, Selangor
Contact: 60176482897 / 60172364096 / 60184090953 / 60162827333
```

- Each number is tap-to-call: `<a href="tel:+60176482897">60176482897</a>`.
- The address starts with **"Tower 1,"**.

## 4. Class dates update automatically

- Always show **next Wednesday & Thursday**, in Malaysia time (GMT+8), whatever the visitor's timezone.
- Switch to the following week at **Wednesday 21:00 MYT** (class starts 8pm; one hour in, latecomers see next week).
- Update **every** place a date appears: info cards, signup card, sticky bar, any one-line summary (e.g. "📅 OCT 21 & 22 · 8PM…"), and the countdown target (that Wednesday 20:00 +08:00).
- Formats:

| Where | Same month | Across months |
|---|---|---|
| Short / long | `OCT 21 & 22` or `OCT 21 & OCT 22` | `SEP 30 & OCT 1` |
| Card | `OCT 21 & 22（三 & 四）` | `SEP 30 & OCT 1（三 & 四）` |
| Sticky bar | `OCT 21–22（三 & 四）` | `SEP 30–OCT 1（三 & 四）` |

- The date written in the code is only a placeholder that shows before the script runs.
- Test with a fake clock set to Wednesday 21:30 MYT and check that it jumps a week.

## 5. Student profile photos (where a testimonial wall or mini cards exist)

- Use real photos instead of letter avatars for these 15 people:
  Zhi Tian Ho, Lynette Ng, Wan Chang ("Chow Wan Chang.png"), Woan Tieng, Andrew Lee, Nicholas Sim, Vik Chng, Angelina, KC Gan, Sherlyn Foo, George Chang, Shinru Yeoh, Zed Hoo, CG Nah, Henrick Chow.
- Source files are in this folder (`<Name>.png`, `Henrick Chow.jpg`). Resize to 96×96 WebP.
- Henrick Chow's photo is full-length, so crop to the head first.
- Everyone else stays on letters until a photo is supplied.

## 6. GHL custom-code file

- Build it **from the repo**: `npm run build:ghl` → `ghl/ghl-custom-code.html`.
- One self-contained file: page HTML + all styles inline + plain JavaScript in place of the site's React behaviour.
- Contain the page's global styles (`*`, `body`, `button`, `:root`) inside a wrapper so they can't break the GHL page or its native popup/form.
- Make it full-width (100vw) so GHL's section padding doesn't squeeze it.
- Images and videos load from the repo's Vercel site. New images only show in GHL after that site is redeployed. **Deploys are manual** (`npx vercel --prod` by the repo owner) — merging to `main` does not publish.
- Deliver a `.md` copy that is **byte-identical** to the `.html`: no code fences, no text outside HTML comments. That way "select all → paste" is always safe.

## 7. How to do the work

1. `git fetch` the repo and check for new commits from colleagues **before** building.
2. Work on a branch and open a PR. Don't push to `main`, and ask before merging.
3. If a colleague updates `main` while PRs are open, **merge `main` into the PR branches** (no force-push) and keep both sides' changes.
4. Test locally at phone width (375px) and desktop:
   - Nothing pops up on its own.
   - Every button opens the popup; ✕ / outside / Esc closes it; it reopens.
   - Tracking parameters reach the form.
   - Dates, rollover and footer numbers are correct.
   - Videos, animations and marquees work.
   - The console shows no errors.
5. Regenerate the GHL file, save the `.md` copy in this folder, and send it.
6. After publishing, check the live page with `?cb=<anything>` to get past the CDN cache.

---

### Repos so far
| Repo | GHL page | GHL file | Assets from |
|---|---|---|---|
| `kiwi-link/aia-lp` | freedombusiness.io/register2u | `ghl-custom-code.md` | aia-lp.vercel.app |
| `kiwi-link/aial-lp-aug-mcn` | MCN referral page | `ghl-custom-code-mcn.md` | ai-agency-lp-five.vercel.app |
