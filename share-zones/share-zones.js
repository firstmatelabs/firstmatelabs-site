import { strings as S } from "./strings.js";
import { processFile, formatBytes, MATCH_RE, TIMESTAMP_LENGTH, stripLine } from "./strip.js";

// Preview Worker only. firstmatelabs.com is not on the allowlist.
export const UPLOAD_URL = "https://fml-share-zones.noisy-night-24ec.workers.dev/";

const $ = (sel, root = document) => root.querySelector(sel);
const panel = () => $("#panel");

function text(el, value) {
  if (el) el.textContent = value;
}

function annotatedLine(raw) {
  const sent = stripLine(raw);
  const match = MATCH_RE.exec(raw);
  const stamp = raw.slice(0, TIMESTAMP_LENGTH);
  const wrap = document.createElement("span");
  if (!sent || !match || !/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(stamp)) {
    const span = document.createElement("span");
    span.className = "dim";
    span.textContent = raw;
    wrap.append(span);
    return wrap;
  }
  const mid = raw.slice(TIMESTAMP_LENGTH, match.index);
  const after = raw.slice(match.index + match[0].length);
  const keep1 = document.createElement("span");
  keep1.className = "keep";
  keep1.textContent = stamp;
  wrap.append(keep1);
  if (mid) {
    const dim = document.createElement("span");
    dim.className = "dim";
    dim.textContent = mid;
    wrap.append(dim);
  }
  const keep2 = document.createElement("span");
  keep2.className = "keep";
  keep2.textContent = match[0];
  wrap.append(keep2);
  if (after) {
    const dim2 = document.createElement("span");
    dim2.className = "dim";
    dim2.textContent = after;
    wrap.append(dim2);
  }
  return wrap;
}

function renderChrome() {
  document.title = S.title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute("content", S.metaDescription);
  text($(".page-head h1"), S.h1);
  const lead = $(".page-head .lead");
  lead.replaceChildren();
  for (const p of S.intro) {
    const el = document.createElement("p");
    el.textContent = p;
    lead.append(el);
  }
  text($("#receive-block h2"), S.receiveHeading);
  text($("#collect-block h2"), S.collectHeading);
  text($("#faq-block h2"), S.faqHeading);
  const footLinks = document.querySelectorAll("footer .links a");
  if (footLinks[0]) {
    footLinks[0].textContent = S.footerEmail;
    footLinks[0].href = "mailto:" + S.footerEmail;
  }
  if (footLinks[1]) footLinks[1].textContent = S.footerPrivacy;
  text($("footer .fine"), S.footerLegal);
  const contact = $("nav .btn");
  if (contact) contact.textContent = S.navContact;
  const brand = $("nav .brand");
  if (brand) brand.setAttribute("aria-label", S.navHome);
}

function renderReceive() {
  const root = $("#receive");
  root.replaceChildren();
  const list = document.createElement("div");
  list.className = "receive-lines";
  for (const raw of [S.receiveGeneratingRaw, S.receiveTileRaw]) {
    const line = document.createElement("div");
    line.className = "ex-line";
    line.append(annotatedLine(raw));
    list.append(line);
  }
  const caption = document.createElement("p");
  caption.className = "receive-caption";
  caption.textContent = S.receiveCaption;
  root.append(list, caption);
}

function renderCollect() {
  const root = $("#collect");
  root.innerHTML = "";
  const pair = document.createElement("div");
  pair.className = "pair";
  const items = [
    [S.collectWhat, S.collectWhatBody],
    [S.collectDont, S.collectDontBody],
    [S.collectFor, S.collectForBody],
  ];
  items.forEach(([h, b], i) => {
    const d = document.createElement("div");
    if (i === 2) d.className = "span2";
    const h3 = document.createElement("h3");
    h3.textContent = h;
    const p = document.createElement("p");
    p.textContent = b;
    d.append(h3, p);
    if (i === 2) {
      const note = document.createElement("p");
      note.style.marginTop = "12px";
      note.textContent = S.noCookies;
      d.append(note);
    }
    pair.append(d);
  });
  root.append(pair);
}

function renderFaq() {
  const root = $("#faq");
  root.replaceChildren();
  for (const item of S.faq) {
    const d = document.createElement("details");
    const s = document.createElement("summary");
    s.textContent = item.q;
    const p = document.createElement("p");
    p.textContent = item.a;
    d.append(s, p);
    root.append(d);
  }
  const code = document.createElement("a");
  code.className = "read-code";
  code.href = "strip.js";
  code.textContent = S.readTheCode;
  root.append(code);
}

function gameLabel(game) {
  if (game === "1") return S.game1;
  if (game === "2") return S.game2;
  if (game === "1 and 2") return S.gameBoth;
  return S.gameUnknown;
}

function renderDropIdle() {
  const root = panel();
  root.replaceChildren();
  const wrap = document.createElement("div");
  wrap.className = "drop-wrap";
  const input = document.createElement("input");
  input.type = "file";
  input.id = "file";
  input.accept = ".txt,text/plain";
  input.hidden = true;

  const drop = document.createElement("div");
  drop.className = "drop";
  drop.tabIndex = 0;
  drop.setAttribute("role", "button");
  const h = document.createElement("h3");
  h.textContent = S.dropLabel;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn primary";
  btn.textContent = S.chooseFile;
  drop.append(h, btn);
  btn.addEventListener("click", (e) => { e.stopPropagation(); input.click(); });
  drop.addEventListener("click", () => input.click());
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
  });
  drop.addEventListener("dragenter", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("over"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("over");
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFile(f);
  });
  input.addEventListener("change", () => {
    const f = input.files && input.files[0];
    if (f) handleFile(f);
  });

  const fine = document.createElement("p");
  fine.className = "drop-fine";
  fine.textContent = S.dropFine;
  const wifi = document.createElement("p");
  wifi.className = "wifi";
  wifi.textContent = S.wifiLine;

  const paths = document.createElement("div");
  paths.className = "paths";
  const where = document.createElement("p");
  where.className = "where";
  where.textContent = S.whereToFind;
  paths.append(where);
  for (const p of S.paths) {
    const row = document.createElement("div");
    row.className = "path";
    const mid = document.createElement("div");
    const lbl = document.createElement("div");
    lbl.className = "lbl";
    lbl.textContent = p.label;
    const code = document.createElement("code");
    code.textContent = p.path;
    mid.append(lbl, code);
    const c = document.createElement("button");
    c.type = "button";
    c.className = "btn sm";
    c.textContent = S.copyPath;
    c.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(p.path);
        c.textContent = S.copied;
        setTimeout(() => { c.textContent = S.copyPath; }, 1500);
      } catch {}
    });
    row.append(mid, c);
    paths.append(row);
  }

  const phone = document.createElement("p");
  phone.className = "phone-note";
  phone.textContent = S.phoneNote;

  wrap.append(input, drop, fine, wifi, paths, phone);
  root.append(wrap);
}

function renderMessage(kind, message, extra) {
  const root = panel();
  root.replaceChildren();
  const box = document.createElement("div");
  box.className = "status";
  box.dataset.state = kind;
  const p = document.createElement("p");
  p.textContent = message;
  box.append(p);
  if (kind === "reading") {
    const hint = document.createElement("p");
    hint.style.marginTop = "8px";
    hint.textContent = S.readingHint;
    const row = document.createElement("div");
    row.className = "progress-row";
    const bar = document.createElement("div");
    bar.className = "progress";
    const i = document.createElement("i");
    i.id = "read-bar";
    bar.append(i);
    const count = document.createElement("span");
    count.id = "read-count";
    count.className = "read-count";
    row.append(bar, count);
    box.append(hint, row);
  }
  if (extra) box.append(extra);
  if (kind === "wrong" || kind === "empty") {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn";
    b.style.marginTop = "18px";
    b.textContent = S.tryAgain;
    b.addEventListener("click", renderDropIdle);
    box.append(b);
  }
  root.append(box);
}

function renderPreview(result) {
  const root = panel();
  root.replaceChildren();
  const box = document.createElement("div");
  box.dataset.state = "preview";

  const facts = document.createElement("div");
  facts.className = "facts";
  const factItems = [
    [S.factLines, result.lines.length.toLocaleString("en-US")],
    [S.factGame, "Path of Exile " + gameLabel(result.game)],
    [S.factDates, result.dateRange ? S.dateRange(result.dateRange.from, result.dateRange.to) : S.dateRangeUnknown],
  ];
  factItems.forEach(([k, v], i) => {
    if (i) {
      const sep = document.createElement("span");
      sep.className = "sep";
      sep.textContent = "·";
      facts.append(sep);
    }
    facts.append(k + " ");
    const b = document.createElement("b");
    b.textContent = v;
    facts.append(b);
  });
  const size = document.createElement("p");
  size.className = "size-drop";
  size.textContent = S.sizeDrop(formatBytes(result.readBytes), formatBytes(result.sendBytes));
  const count = document.createElement("p");
  count.textContent = S.countLine(result.lines.length, gameLabel(result.game));
  count.style.marginBottom = "8px";
  const lead = document.createElement("p");
  lead.className = "preview-lead";
  lead.textContent = S.previewLead;

  const listWrap = document.createElement("div");
  listWrap.className = "lines";
  const ol = document.createElement("ol");
  result.lines.forEach((line, idx) => {
    const li = document.createElement("li");
    const n = document.createElement("span");
    n.className = "n";
    n.textContent = String(idx + 1);
    const t = document.createElement("span");
    t.className = "t";
    t.textContent = line;
    li.append(n, t);
    ol.append(li);
  });
  listWrap.append(ol);

  const actions = document.createElement("div");
  actions.className = "line-actions";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "btn sm";
  copy.textContent = S.copyLines;
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(result.body);
      copy.textContent = S.copied;
      setTimeout(() => { copy.textContent = S.copyLines; }, 1500);
    } catch {}
  });
  const save = document.createElement("button");
  save.type = "button";
  save.className = "btn sm";
  save.textContent = S.saveTxt;
  save.addEventListener("click", () => {
    const blob = new Blob([result.body], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "zone-lines.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  actions.append(copy, save);

  const sendRow = document.createElement("div");
  sendRow.className = "send-row";
  const send = document.createElement("button");
  send.type = "button";
  send.className = "btn primary";
  send.id = "send-btn";
  send.textContent = S.send(result.lines.length);
  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "btn quiet";
  clear.id = "clear-btn";
  clear.textContent = S.clear;
  clear.addEventListener("click", renderDropIdle);
  send.addEventListener("click", () => sendLines(result, send, clear));
  sendRow.append(send, clear);
  const fine = document.createElement("p");
  fine.className = "send-fine";
  fine.textContent = S.previewFine;
  const err = document.createElement("p");
  err.className = "error";
  err.id = "send-error";
  err.hidden = true;
  err.textContent = S.sendError;

  box.append(count, facts, size, lead, listWrap, actions, sendRow, fine, err);
  root.append(box);
}

function renderThanks(n) {
  const root = panel();
  root.replaceChildren();
  const box = document.createElement("div");
  box.className = "thanks";
  box.dataset.state = "sent";
  const h = document.createElement("h3");
  h.textContent = S.thanks(n);
  const p = document.createElement("p");
  p.textContent = S.thanksMore;
  const b = document.createElement("button");
  b.type = "button";
  b.className = "btn";
  b.style.marginTop = "20px";
  b.textContent = S.sendAnother;
  b.addEventListener("click", renderDropIdle);
  box.append(h, p, b);
  root.append(box);
}

async function handleFile(file) {
  renderMessage("reading", S.reading);
  const bar = $("#read-bar");
  const readCount = $("#read-count");
  const result = await processFile(file, {
    onProgress(done, total) {
      if (bar && total) bar.style.width = Math.round((done / total) * 100) + "%";
      if (readCount && total) readCount.textContent = S.readingProgress(formatBytes(done), formatBytes(total));
    },
  });
  if (result.wrongFile) {
    renderMessage("wrong", S.wrongFile);
    return;
  }
  if (!result.lines.length) {
    renderMessage("empty", S.nothingFound);
    return;
  }
  renderPreview(result);
}

function setSendingUi(send, clear, on, lineCount) {
  send.disabled = on;
  if (clear) clear.disabled = on;
  if (on) {
    send.replaceChildren();
    const wait = document.createElement("span");
    wait.className = "send-wait";
    wait.setAttribute("aria-hidden", "true");
    send.append(wait, document.createTextNode(S.sending));
  } else {
    send.textContent = S.send(lineCount);
  }
}

async function sendLines(result, button, clear) {
  const err = $("#send-error");
  if (err) err.hidden = true;
  setSendingUi(button, clear || $("#clear-btn"), true, result.lines.length);
  try {
    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: { "content-type": "text/plain; charset=utf-8" },
      body: result.body,
    });
    if (!res.ok) throw new Error(String(res.status));
    renderThanks(result.lines.length);
  } catch {
    setSendingUi(button, clear || $("#clear-btn"), false, result.lines.length);
    if (err) err.hidden = false;
  }
}

function boot() {
  renderChrome();
  renderReceive();
  renderCollect();
  renderFaq();
  renderDropIdle();
}

// Used only for preview screenshots. Not shown on the page.
window.__shareZonesSetState = async function (name, opts = {}) {
  if (name === "empty") { renderDropIdle(); return; }
  if (name === "drag-over") {
    renderDropIdle();
    const drop = panel().querySelector(".drop");
    if (drop) drop.classList.add("over");
    return;
  }
  if (name === "reading") {
    renderMessage("reading", S.reading);
    const total = opts.readBytes || 0;
    const done = opts.doneBytes != null ? opts.doneBytes : Math.round(total * 0.34);
    const bar = $("#read-bar");
    const readCount = $("#read-count");
    if (bar && total) bar.style.width = Math.round((done / total) * 100) + "%";
    if (readCount && total) readCount.textContent = S.readingProgress(formatBytes(done), formatBytes(total));
    return;
  }
  if (name === "nothing-found") { renderMessage("empty", S.nothingFound); return; }
  if (name === "wrong-file") { renderMessage("wrong", S.wrongFile); return; }
  if (name === "sending" || name === "preview" || name === "send-failed") {
    if (!opts.result) throw new Error("screenshot fixture missing real processFile result");
    const demo = opts.result;
    renderPreview(demo);
    if (name === "sending") {
      setSendingUi($("#send-btn"), $("#clear-btn"), true, demo.lines.length);
    }
    if (name === "send-failed") {
      const e = $("#send-error");
      if (e) e.hidden = false;
    }
    return;
  }
  if (name === "sent") { renderThanks(opts.n); return; }
  if (name === "phone-note") { renderDropIdle(); return; }
};

boot();
