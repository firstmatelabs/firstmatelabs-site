// A&A Towing demo: voice dispatcher (same SDK and consent step as the firstmatelabs.com demo) and the mobile call bar.
// The agent ID is set in index.html: <div id="voice-agent" data-agent-id="...">.

// ---- visit log: page views and demo call start/end, sent to our own endpoint. No cookies, no form contents. ----
const LOG_URL = "https://fml-visits.noisy-night-24ec.workers.dev/v";
const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch { return null; } };
const VID = store("fml_vid") || (() => {
  const id = crypto.randomUUID?.() || Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
  store("fml_vid", id);
  return id;
})();
{
  const q = new URLSearchParams(location.search);
  const me = q.get("me");
  if (me !== null) {
    if (/^[a-z0-9]{8}$/.test(me)) store("fml_me", me);
    q.delete("me");
    const qs = q.toString();
    history.replaceState(history.state, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
  }
}
function track(t, extra = {}) {
  const body = JSON.stringify({ t, p: location.pathname, v: VID, me: store("fml_me") || undefined, r: t === "view" ? document.referrer || undefined : undefined, ...extra });
  try {
    fetch(LOG_URL, { method: "POST", body, keepalive: true, mode: "cors", headers: { "content-type": "text/plain" } }).catch(() => {});
  } catch {
    navigator.sendBeacon?.(LOG_URL, new Blob([body], { type: "text/plain" }));
  }
}
track("view");

// ---- sticky call bar: shown once the hero call button scrolls away ----
const bar = document.getElementById("callbar");
const heroCall = document.getElementById("hero-call");
if (bar && heroCall && "IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => {
    const on = !e.isIntersecting && e.boundingClientRect.top < 0;
    bar.classList.toggle("on", on);
    bar.setAttribute("aria-hidden", String(!on));
    bar.tabIndex = on ? 0 : -1;
  }).observe(heroCall);
}

// ---- voice dispatcher ----
const box = document.getElementById("voice-agent");
const stage = document.getElementById("v-stage");
const AGENT_ID = (box?.dataset.agentId || "").trim();
const READY = /^agent_[A-Za-z0-9]+$/.test(AGENT_ID);
const MAX_SECONDS = 180;
const CONNECT_TIMEOUT_MS = 10000;
const TEL = '<a href="tel:+15629892375"><span class="mono nowrap">(562) 989-2375</span></a>';
const LINE = "Ask about a tow, an impounded car or a property account. Answers instantly, any hour.";
const MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';

let sdk = null;
let conv = null;
let attempt = 0;
let timer = null;
let t0 = 0;
let vol = 0.5;
let muted = false;
let convId = null;
let callStarted = false;

const row = (btn, note) => `<div class="vrow">${btn}<div><p class="vline">${LINE}</p><p class="vnote">${note}</p></div></div>`;
const micBtn = (act, label, extra = "") => `<button class="mic ${extra}" type="button" data-act="${act}" aria-label="${label}">${extra === "live" ? STOP : MIC}</button>`;

const VIEWS = {
  idle: () => row(micBtn("start", "Start talking to Jess, the dispatcher"), "Talk to Jess, our 24/7 dispatcher. Tap the mic. Your browser will ask to use your microphone. Calls end after 3 minutes."),
  consent: () => `<div class="consent" role="group" aria-label="Demo call consent"><h3>Before you start</h3><p>You're about to talk to an <strong>AI</strong>, not a person. Your voice is sent to ElevenLabs, and the call is <strong>transcribed</strong>. We keep the transcript for 30 days. Don't share personal, health or payment information. By clicking <strong>Start call</strong> you agree to this and confirm you are 18 or older.</p>
<div class="go"><button class="btn yel big" type="button" data-act="consent-yes">Start call</button><button class="btn line big" type="button" data-act="consent-no">Cancel</button></div></div>`,
  mic: () => row(micBtn("", "Waiting for microphone").replace("<button", "<button disabled"), "Choose Allow in your browser's prompt."),
  connecting: () => row(micBtn("", "Connecting").replace("<button", "<button disabled"), "Connecting to the dispatcher…"),
  live: () => row(micBtn("end", "End call", "live"), '<span class="ok">● Live</span> · <span class="mono" id="v-time">00:00</span> / 03:00 · tap to end') +
    `<div class="vvol"><label for="v-vol">Volume</label><input id="v-vol" type="range" min="0" max="1" step="0.05" value="${vol}"><button class="btn line vmute" type="button" data-act="mute" aria-pressed="${muted}">${muted ? "Unmute" : "Mute"}</button></div>`,
  denied: () => row(micBtn("start", "Try again"), '<span class="bad">Microphone blocked.</span> Allow the microphone in your browser settings, then tap the mic. Or call ' + TEL + "."),
  error: () => row(micBtn("start", "Retry"), '<span class="bad">The demo could not connect.</span> Try again, or call ' + TEL + "."),
  ended: () => row(micBtn("start", "Call again"), "Call ended. Tap the mic to talk again."),
};

function show(v) {
  stage.dataset.view = v;
  stage.innerHTML = VIEWS[v]();
}

// Output volume: starts at 0.5 each call; mute sets 0 and restores the slider level.
function applyVol() {
  conv?.setVolume({ volume: muted ? 0 : vol });
}

function syncMute() {
  const b = stage.querySelector('[data-act="mute"]');
  if (!b) return;
  b.textContent = muted ? "Unmute" : "Mute";
  b.setAttribute("aria-pressed", String(muted));
}

const isDenied = (e) => /NotAllowedError|SecurityError|PermissionDenied/.test(`${e?.name} ${e?.message}`);
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

async function begin() {
  if (!READY) return;
  if (!navigator.mediaDevices?.getUserMedia) return show("error");
  const mine = ++attempt;
  vol = 0.5;
  muted = false;
  show("mic");
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach((t) => t.stop());
  } catch (e) {
    return mine === attempt && show(isDenied(e) ? "denied" : "error");
  }
  if (mine !== attempt) return;
  show("connecting");
  const to = setTimeout(() => { if (mine === attempt && stage.dataset.view === "connecting") { attempt++; conv?.endSession().catch(() => {}); show("error"); } }, CONNECT_TIMEOUT_MS);
  try {
    sdk ??= await import("../demo/vendor/elevenlabs-client.js");
    const session = await sdk.Conversation.startSession({
      agentId: AGENT_ID,
      userId: VID,
      connectionType: "webrtc",
      libsampleratePath: new URL("../demo/vendor/libsamplerate.worklet.js", import.meta.url).href,
      onConnect: (c) => { if (mine !== attempt) return; convId = c?.conversationId || convId; live(); },
      onDisconnect: () => mine === attempt && ended(),
      onError: (m) => { if (mine === attempt && stage.dataset.view === "connecting") fail(m); },
    });
    clearTimeout(to);
    if (mine !== attempt) return session.endSession();
    conv = session;
    convId ||= session.getId?.() || null;
    applyVol();
    if (stage.dataset.view === "connecting") live();
  } catch (e) {
    clearTimeout(to);
    if (mine === attempt) fail(e);
  }
}

function live() {
  if (stage.dataset.view === "live") return;
  show("live");
  applyVol();
  t0 = performance.now();
  callStarted = true;
  track("call_start", { c: convId || undefined });
  clearInterval(timer);
  timer = setInterval(() => {
    const sec = (performance.now() - t0) / 1000;
    const el = document.getElementById("v-time");
    if (el) el.textContent = mmss(Math.min(sec, MAX_SECONDS));
    if (sec > MAX_SECONDS + 5) end();
  }, 250);
}

function ended() {
  clearInterval(timer);
  if (callStarted) track("call_end", { c: convId || undefined, d: (performance.now() - t0) / 1000 });
  callStarted = false;
  convId = null;
  conv = null;
  attempt++;
  show("ended");
}

function fail(e) {
  attempt++;
  conv?.endSession().catch(() => {});
  conv = null;
  console.warn("dispatcher demo:", e?.message ?? e);
  show(isDenied(e) ? "denied" : "error");
}

async function end() {
  if (!conv) return;
  await conv.endSession().catch(() => {});
}

const actions = {
  start: () => { show("consent"); stage.querySelector('[data-act="consent-yes"]')?.focus(); },
  "consent-yes": begin,
  "consent-no": () => show("idle"),
  end,
  mute: () => { muted = !muted; applyVol(); syncMute(); },
};

if (box && stage && READY) {
  stage.addEventListener("click", (e) => actions[e.target.closest("[data-act]")?.dataset.act]?.());
  stage.addEventListener("input", (e) => {
    if (e.target.id !== "v-vol") return;
    vol = Number(e.target.value);
    muted = false;
    applyVol();
    syncMute();
  });
  addEventListener("pagehide", () => conv?.endSession());
  show("idle");
  // Hero "Talk to our dispatcher": scroll to the demo and open the consent step (href="#voice" is the no-JS fallback).
  document.getElementById("hero-talk")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("voice")?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (["idle", "ended", "error", "denied"].includes(stage.dataset.view)) {
      show("consent");
      stage.querySelector('[data-act="consent-yes"]')?.focus({ preventScroll: true });
    }
  });
}
// Without a real agent ID the static markup stays: mic disabled, "Dispatcher demo connecting soon."
