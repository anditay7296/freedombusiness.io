/**
 * Package this page as one file to paste into a GHL "Custom HTML/Javascript" element.
 *
 *   npm run build:ghl   ->   ghl/ghl-custom-code.html  (+ ghl/ghl-custom-code.md, byte-identical)
 *   Select all -> copy -> paste into GHL -> Save -> Publish.
 *
 * What it does (same approach as kiwi-link/aial-lp-aug-mcn's build-ghl.mjs):
 *   1. Takes the page markup from index.html (no GTM / pixel — the GHL page has its own).
 *   2. Inlines every stylesheet — GHL's page CSS, then css/custom.css — scoped inside
 *      .fb-ghl so none of it can restyle the GHL page or its native popup and form.
 *   3. Rewrites images to full URLs on the Vercel site (SITE).
 *   4. Inlines js/fx-cards.js and js/main.js. main.js is shared with the site; inside
 *      .fb-ghl it opens GHL's native popup (counts as an opt-in) instead of its own.
 *
 * GHL-only differences from the site:
 *   - The inline form (form-daxRYlzQNW) is left out: inside GHL its submissions would
 *     create contacts but never count as opt-ins. The YES button just below it opens
 *     the popup instead, as on the register2u and MCN pages.
 *
 * Images load from SITE: a new image only shows in GHL once the site is redeployed.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SITE = (process.env.SITE_URL || "https://aia-landing-page-sage.vercel.app").replace(/\/$/, "");
const ROOT = "fb-ghl";
const OUT = "ghl/ghl-custom-code.html";
const OUT_MD = "ghl/ghl-custom-code.md";

const html = readFileSync("index.html", "utf8");
const bodyAt = html.indexOf("<body");
const head = html.slice(0, bodyAt);
let body = html.slice(html.indexOf(">", bodyAt) + 1, html.lastIndexOf("</body>"));

/* ---------- helpers ---------- */

/** index just past the </div> that closes the <div> starting at i */
const divEnd = (s, i) => {
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = i;
  let depth = 0;
  for (let m; (m = re.exec(s)); ) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return re.lastIndex;
  }
  throw new Error("unbalanced <div> from " + i);
};
/** remove the element whose id is `id` (the <div> carrying it, wherever the attribute sits) */
const dropById = (s, id) => {
  const at = s.indexOf(`id="${id}"`);
  if (at < 0) throw new Error(`#${id} not found`);
  const start = s.lastIndexOf("<div", at);
  return s.slice(0, start) + s.slice(divEnd(s, start));
};
const resolve = (u, base) => {
  if (/^(?:[a-z]+:|\/\/|#)/i.test(u)) return u;
  return new URL(u, base).toString();
};
/** url(...) inside CSS -> absolute, resolved against the stylesheet's own location */
const absCssUrls = (css, base) =>
  css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (all, q, u) =>
    /^(?:data:|https?:|\/\/)/i.test(u) ? all : `url(${q}${resolve(u, base)}${q})`);

/* ---------- 1. CSS: every <style> block in order, then custom.css, all scoped ---------- */

let css = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
css = absCssUrls(css, SITE + "/");
css += "\n" + absCssUrls(readFileSync("css/custom.css", "utf8"), SITE + "/css/");
css = css.replace(/@import\s+url\([^)]*\)\s*;/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

/** matching } for the { at i — skips quoted strings so a brace inside content:"" can't derail it */
const closeOf = (s, i) => {
  let depth = 0;
  for (let j = i; j < s.length; j++) {
    const ch = s[j];
    if (ch === '"' || ch === "'") {
      j = s.indexOf(ch, j + 1);
      if (j < 0) throw new Error("unterminated string in CSS");
    } else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return j;
  }
  throw new Error("CSS braces don't balance");
};
/** split a selector list on top-level commas (not the ones inside :is(...) etc.) */
const splitSel = (sel) => {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of sel) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
};
/**
 * :root / html / body become the wrapper itself; everything else gets :where(.fb-ghl)
 * in front, which adds no specificity, so the page's own cascade is unchanged.
 * Unlike the MCN build, `html ...` rules are scoped too: GHL's CSS has
 * `html body .hl_wrapper{height:100vh;overflow:hidden}`, which must not reach the host.
 */
const scopeSel = (s) => {
  if (s === ":root") return `.${ROOT}`;
  const rest = s.replace(/^html(?![\w-])\s*/, "").replace(/^body(?![\w-])/, "\u0000");
  if (rest === "" || rest === "\u0000") return `.${ROOT}`;
  if (rest.startsWith("\u0000")) return `.${ROOT}` + rest.slice(1); // body.x, body > .y
  return `:where(.${ROOT}) ${rest}`;
};
/** collapse whitespace in a declaration block, leaving quoted strings untouched */
const tidy = (decl) =>
  decl.split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/).map((part, k) =>
    k % 2 ? part : part.replace(/\s+/g, " ").replace(/\s*([:;,])\s*/g, "$1")).join("").trim().replace(/;$/, "");
const scope = (s) => {
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (/\s/.test(s[i])) { i++; continue; }
    const brace = s.indexOf("{", i);
    const semi = s.indexOf(";", i);
    if (brace < 0) break;
    if (s[i] === "@" && semi >= 0 && semi < brace) { // @charset / @namespace
      out += s.slice(i, semi + 1);
      i = semi + 1;
      continue;
    }
    const close = closeOf(s, brace);
    const prelude = s.slice(i, brace).trim();
    const inner = s.slice(brace + 1, close);
    if (prelude.startsWith("@")) {
      // rules inside @media / @supports are scoped too; @keyframes / @font-face stay as they are
      if (/^@(media|supports|container|layer)\b/.test(prelude)) {
        const kids = scope(inner);
        if (kids) out += `${prelude}{${kids}}`;
      } else out += `${prelude}{${inner}}`;
    } else {
      const sels = splitSel(prelude);
      const live = sels.filter(alive);
      dropped += sels.length - live.length;
      kept += live.length;
      if (live.length) out += `${live.map(scopeSel).join(",")}{${tidy(inner)}}`;
    }
    i = close + 1;
  }
  return out;
};


/* ---------- 2. markup ---------- */

body = body
  .replace(/<noscript>[\s\S]*?<\/noscript>/g, "") // GTM / pixel fallbacks
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, (tag) => (/widget\.senja\.io/.test(tag) ? tag : "")) // keep the testimonial widget
  .replace(/<!--[\s\S]*?-->/g, "") // Vue hydration markers
  // page-level ids the GHL page has its own copies of (GHL looks some of them up)
  .replace(/\sid="(?:__nuxt|teleports|preview-container|nav-menu-popup|ft-track-hl-custom-code|gb-track-hl-custom-code)"/g, "")
  // GHL's page-background layer: position:fixed over the whole screen, so inside a GHL
  // page it would paint over the host page — the wrapper carries its colour instead
  .replace('<div class="bgCover bg-fixed"></div>', "");

body = dropById(body, "form-daxRYlzQNW");

body = body
  .replace(/\b(src|href|poster)="(?!(?:[a-z]+:|\/\/|#))([^"]+)"/gi, (_, a, u) => `${a}="${resolve(u, SITE + "/")}"`)
  .replace(/url\((&quot;|['"]?)(?!(?:data:|https?:|\/\/))([^'")&]+)\1\)/g, (_, q, u) => `url(${q}${resolve(u, SITE + "/")}${q})`);

/* ---------- 3. scripts ---------- */

const fx = readFileSync("js/fx-cards.js", "utf8");
const main = readFileSync("js/main.js", "utf8");
for (const [name, src] of [["fx-cards.js", fx], ["main.js", main]]) {
  try { new Function(src); } catch (e) { throw new Error(`${name}: ${e.message}`); } // fail here, not inside GHL
}

const fonts = [...new Set([...head.matchAll(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"/g)].map((m) => m[1]))];
const hls = (html.match(/<script src="(https:\/\/cdn\.jsdelivr\.net\/npm\/hls\.js@[^"]+)"/) || [])[1];
if (!hls) throw new Error("hls.js <script> not found in index.html");


/* ---------- 3b. drop CSS for things this page doesn't have ----------
   GHL ships styles for every element type it supports; most never match here.
   A selector is dropped only when it names a class or id that appears nowhere in
   the markup AND nowhere in the page's JavaScript (which covers classes the scripts
   add at runtime: show, ms-in, fx-*, …). Names inside :not()/:is()/… are ignored,
   and anything with an escape is kept — when unsure, keep. */
const present = new Set();
for (const m of body.matchAll(/\bclass="([^"]*)"/g)) m[1].split(/\s+/).forEach((c) => c && present.add(c));
for (const m of body.matchAll(/\bid="([^"]*)"/g)) present.add(m[1]);
for (const m of (fx + main).matchAll(/[A-Za-z_][\w-]*/g)) present.add(m[0]);
present.add(ROOT);
const topLevel = (sel) => { // the selector with every (...) group blanked out
  let depth = 0, out = "";
  for (const ch of sel) {
    if (ch === "(") depth++;
    out += depth ? " " : ch;
    if (ch === ")") depth--;
  }
  return out;
};
const alive = (sel) => {
  if (sel.includes("\\")) return true;
  for (const m of topLevel(sel).matchAll(/[.#]([A-Za-z_-][\w-]*)/g)) if (!present.has(m[1])) return false;
  return true;
};
let dropped = 0, kept = 0;

css = scope(css);
/* GHL-only additions. 100vw lets the page escape GHL's section padding; the overflow it
   causes (scrollbar width) is clipped. clip, not hidden: overflow-x:hidden turns body
   into a scroll container and position:sticky stops working on the whole page —
   the awards timeline's pinned columns, and any sticky header on the GHL page. */
css += `
.${ROOT}{width:100vw;max-width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);text-align:left;background-color:var(--black)}
html,body{overflow-x:clip}
`;

/* ---------- 4. assemble ---------- */

const header = `<!-- ============================================================
  FreedomBusiness register2s — GHL Custom HTML/Javascript block
  ⚠️ 这份是自动生成的，不要手改 —— 改原始码后跑 npm run build:ghl
  Source: https://github.com/anditay7296/freedombusiness.io  ·  图片来源: ${SITE}/

  用法：整份全选复制 → 贴进 GHL 的 Custom HTML/Javascript → Save → Publish
  （这段说明是 HTML 注释，页面上不会显示出来）

  GHL 页面需要的设置（才会算 opt-in）：
  · 原生 Popup，内容照这三行：
      标题  STEP #1 : Confirm Your Details
      副标题（领取学习链接 + 免费AI工具）
      原生 Form 元素，表格下面一行小字：**请稍等片刻，表格正在准备中...
    「显示触发器」全部关掉（不会自动弹）
  · 一颗藏起来的 builder Button，动作设成 Show Popup —— 整页只能有这一颗 builder 按钮
  · 没有设的话：按钮会开这页自己的弹窗（嵌 GHL 表格 EodgI0gvzRubFNIZ7JUD），
    资料一样进 GHL，但不算 opt-in
  · 行为：不自动弹窗；报名按钮点了才开 popup；✕ / 点外面 / Esc 关，能重开

  · 这个 Custom Code 元素要放在页面最后（底部报名条和弹窗是 fixed 的，后面的元素会被挡住或盖住它们）
  · 开课日期：自动算下一个星期三 & 四（星期三 21:00 MYT 一过就跳下一周），不用手改
  · GTM / Meta Pixel 不在这份里 —— 放在 GHL 页面的 Tracking Code 设定
  · 图片都从 ${SITE} 载入 —— 那个 Vercel 部署要一直在线
============================================================ -->
`;

const out =
  header +
  `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` +
  fonts.map((u) => `<link rel="stylesheet" href="${u}">`).join("") +
  `<script src="https://link.msgsndr.com/js/form_embed.js"></script><script src="${hls}"></script>\n` +
  `<style>${css}</style>\n` +
  `<div class="${ROOT}">${body.trim()}</div>\n` +
  `<script>\n${fx.trim()}\n</script>\n<script>\n${main.trim()}\n</script>\n`;

/* ---------- 5. checks ---------- */

const fail = (msg) => { throw new Error(msg); };
if (out.includes("```")) fail("output contains ``` — pasted into GHL it would show as text");
const stray = body.match(/(?:src|href|poster)="(?!(?:https?:|data:|tel:|mailto:|#|about:|javascript:))[^"]*"/);
if (stray) fail(`relative path left: ${stray[0]}`);
if (/url\((?!['"]?(?:https?:|data:|\/\/|#))/.test(css)) fail("relative url() left in CSS");
// GHL's reserved popup names may appear in main.js (that's how it finds GHL's popup),
// but never in this page's own markup or CSS, or the bridge would grab ours instead
for (const bad of ['id="overlay"', "#overlay", "hl_main_popup", "closeLPModal", "popup-body\""]) {
  if (body.includes(bad) || css.includes(bad)) fail(`page markup/CSS still contains ${bad}`);
}
for (const bad of ['id="form-daxRYlzQNW"', "googletagmanager", "fbq("]) {
  if (body.includes(bad)) fail(`page markup still contains ${bad}`);
}
const opens = (body.match(/<div\b/g) || []).length; // markup only: scripts may mention "<div" in comments
const closes = (body.match(/<\/div>/g) || []).length;
if (opens !== closes) fail(`<div> count off: ${opens} open vs ${closes} close`);
if (!out.includes('data-class-date="long"')) fail("class-date placeholders missing");
if (body.includes("bg-fixed")) fail("GHL's fixed page-background layer is still in the markup");
for (const id of ["__nuxt", "teleports", "preview-container"]) if (body.includes(`id="${id}"`)) fail(`page-level id #${id} still in the markup`);

mkdirSync("ghl", { recursive: true });
writeFileSync(OUT, out);
writeFileSync(OUT_MD, out); // byte-identical .md copy: select-all -> paste is always safe
console.log(`✓ ${OUT} (+ .md)  ${(Buffer.byteLength(out) / 1024).toFixed(0)}KB · CSS ${(css.length / 1024).toFixed(0)}KB (${dropped} unused selectors dropped, ${kept} kept) · markup ${(body.length / 1024).toFixed(0)}KB · images from ${SITE}`);
