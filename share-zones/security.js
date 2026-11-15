// "Concerned about security?" pill and popover (bottom sheet on phones).
// The copied prompt quotes the stripping code from strip.js at runtime, so
// it always matches what this page runs.
import { strings as S } from "./strings.js";
import { copyText } from "../copy-email.js";
import { stripLine, MATCH_RE, TIMESTAMP_LENGTH } from "./strip.js";
import { discordPopoverLine } from "./discord.js";

const PULSE_KEY = "share-zones-sec-pulsed";
const SHEET_MQ = "(max-width: 640px), (pointer: coarse)";
const svg = (body, size = 14) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const ICON_SHIELD = svg('<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>');
const ICON_CHECK = svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 16);
const ICON_X = svg('<path d="M6 6l12 12M18 6L6 18"/>', 16);

export function strippingCode() {
  return [
    `const TIMESTAMP_LENGTH = ${TIMESTAMP_LENGTH};`,
    "",
    `const MATCH_RE =\n  ${MATCH_RE.toString()};`,
    "",
    stripLine.toString(),
  ].join("\n");
}

export function checkPrompt() {
  const raw = S.secPromptExampleLine;
  return [
    S.secPromptIntro,
    "",
    `${S.secPromptScriptUrl} ${S.scriptUrl}`,
    S.secPromptScript,
    strippingCode(),
    "",
    S.secPromptRaw,
    raw,
    S.secPromptSent,
    stripLine(raw),
    "",
    S.secPromptQuestion,
  ].join("\n");
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export function renderSecurityCheck() {
  const anchor = el("div", "sec");
  const pill = el("button", "sec-pill");
  pill.type = "button";
  pill.innerHTML = ICON_SHIELD;
  pill.append(el("span", null, S.secPill));
  pill.setAttribute("aria-expanded", "false");
  pill.setAttribute("aria-controls", "sec-pop");
  pill.setAttribute("aria-haspopup", "dialog");

  const pop = el("div", "sec-pop");
  pop.id = "sec-pop";
  pop.hidden = true;
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-labelledby", "sec-title");
  const handle = el("div", "sec-handle");
  handle.setAttribute("aria-hidden", "true");
  const close = el("button", "sec-x");
  close.type = "button";
  close.innerHTML = ICON_X;
  close.setAttribute("aria-label", S.secClose);
  const eyebrow = el("p", "sec-eyebrow", S.secEyebrow);
  const title = el("h3", "sec-title", S.secTitle);
  title.id = "sec-title";
  const copy = el("button", "sec-copy", S.secCopy);
  copy.type = "button";
  const label = el("p", "sec-label", S.secChipsLabel);
  const chips = el("div", "sec-chips");
  for (const c of S.secChatbots) {
    const a = el("a", "sec-chip", c.label);
    a.href = c.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    chips.append(a);
  }
  const code = el("a", "sec-code", S.secReadCode);
  code.href = S.scriptUrl;
  code.target = "_blank";
  code.rel = "noopener noreferrer";
  pop.append(handle, close, eyebrow, title, copy, label, chips, code);
  const discord = discordPopoverLine();
  if (discord) pop.append(discord);

  const backdrop = el("div", "sec-backdrop");
  backdrop.hidden = true;
  anchor.append(pill, pop, backdrop);

  let copyTimer = 0;
  copy.addEventListener("click", async () => {
    try {
      await copyText(checkPrompt());
    } catch {
      return;
    }
    copy.innerHTML = ICON_CHECK;
    copy.append(el("span", null, S.secCopied));
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copy.textContent = S.secCopy; }, 2000);
  });

  // open: "hover" (no focus move) or "click" (focus moves in)
  let mode = null;
  let hoverTimer = 0;
  let closeTimer = 0;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isOpen = () => mode !== null;
  function open(how) {
    clearTimeout(hoverTimer);
    if (isOpen()) {
      if (how === "click" && mode === "hover") { mode = "click"; copy.focus(); }
      return;
    }
    mode = how;
    clearTimeout(closeTimer);
    const sheet = window.matchMedia(SHEET_MQ).matches;
    anchor.classList.toggle("as-sheet", sheet);
    pop.hidden = false;
    backdrop.hidden = !sheet;
    pop.offsetHeight; // start the transition from the closed state
    anchor.classList.add("open");
    pill.setAttribute("aria-expanded", "true");
    if (how === "click") copy.focus({ preventScroll: true });
  }
  function shut(refocus) {
    if (!isOpen()) return;
    const hadFocus = pop.contains(document.activeElement);
    mode = null;
    anchor.classList.remove("open");
    pill.setAttribute("aria-expanded", "false");
    backdrop.hidden = true;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { if (!isOpen()) pop.hidden = true; }, reduce ? 0 : 130);
    if (refocus || hadFocus) pill.focus({ preventScroll: true });
  }

  pill.addEventListener("click", () => {
    if (isOpen() && mode === "click") shut(true);
    else open("click");
  });
  close.addEventListener("click", () => shut(true));
  backdrop.addEventListener("click", () => shut(true));

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const hoverIn = () => { if (fine.matches && !window.matchMedia(SHEET_MQ).matches) open("hover"); };
  const hoverOut = () => {
    if (mode !== "hover") return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => { if (mode === "hover") shut(false); }, 250);
  };
  for (const t of [pill, pop]) {
    t.addEventListener("mouseenter", hoverIn);
    t.addEventListener("mouseleave", hoverOut);
  }

  document.addEventListener("pointerdown", (e) => {
    if (isOpen() && !anchor.contains(e.target)) shut(false);
  });
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") { e.preventDefault(); shut(true); return; }
    if (e.key === "Tab" && pop.contains(document.activeElement)) {
      const items = [...pop.querySelectorAll("button, a[href]")];
      const i = items.indexOf(document.activeElement);
      const next = e.shiftKey ? i - 1 : i + 1;
      if (next < 0 || next >= items.length) {
        e.preventDefault();
        items[(next + items.length) % items.length].focus();
      }
    }
  });

  // One gentle pulse per session, 1.2s after load.
  let pulsed = false;
  try { pulsed = sessionStorage.getItem(PULSE_KEY) === "1"; } catch {}
  if (!reduce && !pulsed) {
    setTimeout(() => {
      try { sessionStorage.setItem(PULSE_KEY, "1"); } catch {}
      pill.classList.add("pulse");
      pill.addEventListener("animationend", () => pill.classList.remove("pulse"), { once: true });
    }, 1200);
  }

  return anchor;
}
