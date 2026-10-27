// Voice demo: business picker, call states and the ElevenLabs session.
// Everything is switched by config.js. With config.enabled false the page keeps its
// static "Demo Opens Soon" button and the SDK is never loaded.
import config from "./config.js";

const EMAIL = "hello@firstmatelabs.com";
const BIZ = [
  { key: "dental", health: true, name: "Alder Creek Dental", persona: "A calm front-desk assistant. Books cleanings and exams, answers hours and insurance questions, and flags dental emergencies.", greet: "Thanks for calling Alder Creek Dental. I'm the practice's AI assistant, and this is a demo. Are you calling to book a visit, or do you have a question?" },
  { key: "hvac", name: "Ridgeline Heating & Air", persona: "A practical dispatcher. Finds out if the system is down, who is at home and how urgent it is, then books a visit.", greet: "Ridgeline Heating and Air, demo line. I'm an AI assistant. Is your system down right now, or do you want to schedule a visit?" },
  { key: "roofing", name: "Cedar Line Roofing", persona: "Direct and unhurried. Separates leaks and storm damage from planned replacements and books an estimate.", greet: "Cedar Line Roofing, this is the demo assistant. Are you dealing with a leak right now, or planning a new roof?" },
  { key: "medspa", health: true, name: "Juniper Skin & Wellness", persona: "Warm and low-pressure. Books consultations, explains treatments in general terms and gives no medical advice.", greet: "Welcome to Juniper Skin and Wellness. I'm an AI assistant for this demo. Would you like to book a consultation, or ask about a treatment?" },
  { key: "law", name: "Halden Law Group", persona: "Formal intake. Collects the caller's details and the type of matter, gives no legal advice and offers a consultation.", greet: "Halden Law Group. I'm an AI assistant in a demo, and I can't give legal advice. I can take your details and set up a consultation. What is this regarding?" },
];

const stage = document.getElementById("demo-stage");
const picks = [...document.querySelectorAll("#demo-biz [data-biz]")];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const svg = (w, body, extra = "") => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ${extra}>${body}</svg>`;
const MIC_BODY = '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>';
const MIC = svg(20, MIC_BODY, 'stroke-linejoin="round"');
const NOTE_MIC = svg(15, MIC_BODY, 'stroke-linejoin="round"');
const NOTE_INFO = svg(15, '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>');
const NOTE_CLOCK = svg(15, '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
const STOP = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>';

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const mail = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;

let bizIdx = 0;
let view = "idle";
let attempt = 0;
let conv = null;
let call = null; // { t0, mode, muted, userEnded, tick, raf, last }
let sdk = null;
let consented = false; // click-to-consent given for the next call; cleared once a call goes live or the business changes

const biz = () => BIZ[bizIdx];
const ready = (b) => config.enabled && (config.tokenEndpoint ? !!config.turnstileSiteKey : !!config.agentIds[b.key]);
const locked = () => ["mic", "connecting", "live", "ending"].includes(view);

// ---- templates ----
const chip = (text, cls = "") => `<span class="chip ${cls}">${text}</span>`;
const fictional = chip("Fictional Demo");
const elfoot = (left = "Demo agents. Calls end after 3 minutes.") =>
  `<div class="elfoot"><span>${left}</span><span class="el">Powered by ElevenLabs</span></div>`;
const LINKS = '<a class="inline" href="privacy/" target="_blank" rel="noopener">Privacy Policy</a> · <a class="inline" href="ai-voice-disclosure/" target="_blank" rel="noopener">AI and Voice Disclosure</a>';
const note = (...rows) => `<div class="note">${rows.filter(Boolean).map(([icon, text]) => `<div>${icon}<span>${text}</span></div>`).join("")}</div>`;
const startBtn = (label) => `<button class="btn primary big" type="button" data-act="start">${MIC}${label}</button>`;
const emailBtn = (label, cls) => `<a class="btn ${cls}" href="mailto:${EMAIL}">${label}</a>`;
const barsHTML = (n, h = 0.08) => `<i style="--h:${h}"></i>`.repeat(n);

const TEMPLATES = {
  idle(b, go) {
    go ??= ready(b)
      ? `<div class="go">${startBtn("Start Talking")}<span class="limit">Up to 3:00</span></div>`
      : `<div class="go"><button class="btn primary big" type="button" disabled>${MIC}Demo Opens Soon</button><span class="limit">Up to 3:00</span></div>`;
    return `<div class="meta">${fictional}<span>Not a real business</span></div><h3>${esc(b.name)}</h3><p class="persona">${esc(b.persona)}</p>
<div class="greet"><small>Opening Line</small><q>${esc(b.greet)}</q></div>
${go}
${note([NOTE_MIC, "Your browser will ask to use your microphone. We only use it for this call."], [NOTE_INFO, `Calls are with an AI and are transcribed. ${LINKS}`], b.health && [NOTE_INFO, "This is a demo. Please don't share health details."])}${elfoot()}`;
  },
  consent(b) {
    return `<div class="meta">${fictional}<span>${esc(b.name)}</span></div><h3>Before You Start</h3>
<div class="consent" role="group" aria-label="Demo call consent"><p>You're about to talk to an <strong>AI</strong>, not a person. Your voice is sent to ElevenLabs, and the call is <strong>transcribed</strong>. We keep the transcript for 30 days. Don't share personal, health or payment information. By clicking <strong>Start Call</strong> you agree to this and confirm you are 18 or older.</p><p class="lk">${LINKS}</p></div>
<div class="go"><button class="btn primary big" type="button" data-act="consent-yes">${MIC}Start Call</button><button class="btn big2" type="button" data-act="consent-no">Cancel</button></div>${elfoot()}`;
  },
  mic(b) {
    return TEMPLATES.idle(b, `<div class="go"><button class="btn primary big dis" type="button" aria-disabled="true">${MIC}Allow Microphone</button><span class="limit">Choose Allow in your browser's prompt.</span></div>`);
  },
  unsupported(b) {
    return TEMPLATES.idle(b, `<div class="alert"><p>This demo needs a current version of Chrome, Edge, Safari or Firefox. You can also email ${mail}.</p></div>`);
  },
  denied(b) {
    return `<div class="meta">${chip("Microphone Blocked", "warn")}<span>${esc(b.name)}</span></div><h3>We can't hear you yet.</h3>
<div class="alert"><p>Your browser blocked the microphone, so the call can't start. To allow it:</p><ol><li>Select the lock icon next to the address bar.</li><li>Set Microphone to Allow.</li><li>Come back here and select Try Again.</li></ol></div>
<div class="go">${startBtn("Try Again")}${emailBtn("Email Us Instead", "big2")}</div>
${note([NOTE_MIC, "We only use the microphone for this call, and you can stop it at any time."])}${elfoot()}`;
  },
  connecting(b) {
    return `<div class="meta">${fictional}<span class="conn"><i class="spin"></i>Connecting</span></div><h3>${esc(b.name)}</h3>
<div class="live-body one"><div class="wave still" aria-hidden="true" data-wave></div><div class="tx idle"><p class="c"><b></b><span>Calling ${esc(b.name)}. This takes a few seconds.</span></p></div></div>
<div class="go tight"><span class="btn primary big dis"><i class="spin"></i>Connecting</span><span class="limit">Timer starts when the line is open</span></div>
${note([NOTE_CLOCK, "Demo agents. Calls end after 3 minutes."])}${elfoot("")}`;
  },
  live(b) {
    return `<div class="meta">${fictional}<span class="live" id="d-state"><i></i>Agent Speaking</span></div><h3>${esc(b.name)}</h3>
<div class="live-body one"><div class="wave drive" id="d-wave" aria-hidden="true"></div><div class="tx" id="d-log" role="log" aria-live="polite"></div></div>
<div class="callbar"><div class="timer" id="d-time"></div><div class="bar" id="d-bar"><i></i></div><button class="btn mute" type="button" data-act="mute">Mute</button><button class="btn end" type="button" data-act="end">${STOP}End Call</button></div>${elfoot()}`;
  },
  busy(b) {
    return `<div class="meta">${chip("Demo Busy", "warn")}<span>${esc(b.name)}</span></div><h3>The demo is busy right now.</h3>
<p class="persona">Either today's demo calls are used up or every line is in use. Try again in a few minutes, or tomorrow.</p>
<div class="alert"><p>Want to hear it on your own business? Email <span class="mono">${EMAIL}</span> and we will set up a call.</p></div>
<div class="go">${emailBtn("Email Us", "primary big")}<button class="btn big2" type="button" data-act="start">Try Again</button></div>${elfoot()}`;
  },
  error(b) {
    return `<div class="meta">${fictional}<span>${esc(b.name)}</span></div><h3>The demo could not connect.</h3>
<p class="persona">Try again in a moment, or email ${mail}.</p>
<div class="go">${startBtn("Retry")}</div>${elfoot()}`;
  },
};

// ---- rendering ----
function show(next) {
  view = next;
  stage.innerHTML = TEMPLATES[next](biz());
  picks.forEach((p, i) => {
    const off = locked() && i !== bizIdx;
    p.setAttribute("aria-pressed", i === bizIdx);
    p.disabled = off;
    p.classList.toggle("dim", off);
  });
  const wave = stage.querySelector("[data-wave]");
  if (wave) wave.innerHTML = barsHTML(waveCount(wave));
}

function waveCount(wave) {
  if (reduced) return 3;
  return Math.max(3, Math.min(60, Math.floor((wave.clientWidth - 36 + 3) / 6)));
}

const $ = (id) => document.getElementById(id);
const bars = () => [...$("d-wave").children];

function setBars(levels) {
  const els = bars();
  els.forEach((el, i) => el.style.setProperty("--h", Math.max(0.06, Math.min(1, levels[i] ?? 0)).toFixed(2)));
}

function setClock(sec) {
  const max = config.maxSeconds;
  const warn = sec >= config.warnSeconds;
  $("d-time").innerHTML = `${mmss(sec)} <span>${warn && sec < max ? `${max - config.warnSeconds} seconds left` : `/ ${mmss(max)}`}</span>`;
  const bar = $("d-bar");
  bar.classList.toggle("w", warn);
  bar.firstElementChild.style.width = `${Math.min(100, (sec / max) * 100)}%`;
}

function setMode(mode, muted = false) {
  const el = $("d-state");
  const wave = $("d-wave");
  if (muted) {
    el.className = "lis";
    el.innerHTML = "<i></i>Mic Muted";
  } else if (mode === "speaking") {
    el.className = "live";
    el.innerHTML = "<i></i>Agent Speaking";
  } else {
    el.className = "lis";
    el.innerHTML = "<i></i>Listening";
  }
  wave.classList.toggle("in", mode !== "speaking" && !muted);
  wave.classList.toggle("still", muted);
  const log = $("d-log");
  log.querySelector(".caret")?.remove();
  const last = [...log.querySelectorAll("p.a span")].pop();
  if (mode === "speaking" && !muted && last) last.insertAdjacentHTML("beforeend", '<span class="caret"></span>');
}

function addLine(role, text) {
  const log = $("d-log");
  const p = document.createElement("p");
  p.className = role === "user" ? "c" : "a";
  const who = document.createElement("b");
  who.textContent = role === "user" ? "You" : "Agent";
  const body = document.createElement("span");
  body.textContent = text;
  p.append(who, body);
  log.append(p);
  log.scrollTop = log.scrollHeight;
  if (call) setMode(call.mode, call.muted);
}

function showLive() {
  show("live");
  const wave = $("d-wave");
  wave.innerHTML = barsHTML(waveCount(wave));
  setClock(0);
  call = { t0: performance.now(), mode: "speaking", muted: false, userEnded: false, last: 0 };
}

const ENDED = {
  user: (b) => `<b>That was a demo.</b> Want this for your business?`,
  cap: () => `<b>You reached the 3-minute demo limit.</b> A line set up for your business runs as long as the call does.`,
  silence: () => `<b>The call ended because we couldn't hear anything.</b>`,
};

function showEnded(kind, seconds) {
  const log = $("d-log");
  const lines = log && log.children.length ? log.innerHTML : "";
  const b = biz();
  view = "ended";
  const sec = Math.min(seconds, config.maxSeconds);
  stage.innerHTML = `<div class="meta">${fictional}<span class="endl">Call Ended</span></div><h3>${esc(b.name)}</h3>
<div class="live-body one"><div class="wave still" aria-hidden="true" data-wave></div>${lines ? `<div class="tx" role="log">${lines}</div>` : ""}</div>
<div class="alert end"><p>${ENDED[kind](b)}</p></div>
<div class="callbar"><div class="timer">${mmss(sec)} <span>/ ${mmss(config.maxSeconds)}</span></div><div class="bar${kind === "cap" ? " w" : ""}"><i style="width:${Math.min(100, (sec / config.maxSeconds) * 100)}%"></i></div>${kind === "silence" ? "" : '<a class="btn" href="#contact">Contact Us</a>'}${startBtn("Call Again").replace('class="btn primary big"', 'class="btn primary"').replace(MIC, "")}</div>${elfoot()}`;
  stage.querySelector(".tx .caret")?.remove();
  const wave = stage.querySelector("[data-wave]");
  wave.innerHTML = barsHTML(waveCount(wave));
  picks.forEach((p) => { p.disabled = false; p.classList.remove("dim"); });
}

// ---- mic check, token and session ----
async function checkMic() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((t) => t.stop());
}

const isDenied = (e) => /NotAllowedError|SecurityError|PermissionDenied/.test(`${e?.name} ${e?.message}`);

function classify(e) {
  if (e?.busy) return "busy";
  if (isDenied(e)) return "denied";
  if (/429|limit|concurren|too many|quota|capacity|busy/i.test(`${e?.message ?? e}`)) return "busy";
  return "error";
}

function turnstileToken() {
  const load = window.turnstile
    ? Promise.resolve()
    : new Promise((ok, fail) => {
        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.onload = ok;
        s.onerror = () => fail(new Error("turnstile script"));
        document.head.append(s);
      });
  return load.then(() => new Promise((ok, fail) => {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:10";
    document.body.append(host);
    const done = () => { window.turnstile.remove(id); host.remove(); };
    const id = window.turnstile.render(host, {
      sitekey: config.turnstileSiteKey,
      appearance: "interaction-only",
      execution: "execute",
      callback: (t) => { done(); ok(t); },
      "error-callback": () => { done(); fail(new Error("turnstile")); },
      "timeout-callback": () => { done(); fail(new Error("turnstile timeout")); },
    });
    window.turnstile.execute(id);
  }));
}

async function credential(b) {
  if (!config.tokenEndpoint) return { agentId: config.agentIds[b.key] };
  const res = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ business: b.key, turnstileToken: await turnstileToken() }),
  });
  if (res.status === 429) throw Object.assign(new Error("busy"), { busy: true });
  if (!res.ok) throw new Error(`session ${res.status}`);
  return { conversationToken: (await res.json()).conversationToken };
}

function ask() {
  if (!ready(biz()) || locked()) return;
  if (consented) return begin();
  show("consent");
  stage.querySelector('[data-act="consent-yes"]')?.focus();
}

async function begin() {
  if (!ready(biz()) || locked()) return;
  if (!navigator.mediaDevices?.getUserMedia) return show("unsupported");
  const mine = ++attempt;
  const b = biz();
  show("mic");
  try {
    await checkMic();
  } catch (e) {
    return mine === attempt && show(isDenied(e) ? "denied" : "error");
  }
  if (mine !== attempt) return;
  show("connecting");
  try {
    const cred = await credential(b);
    if (mine !== attempt) return;
    const timeout = setTimeout(() => { if (mine === attempt && view === "connecting") { attempt++; show("error"); } }, config.connectTimeoutMs);
    sdk ??= await import("./vendor/elevenlabs-client.js");
    const session = await sdk.Conversation.startSession({
      ...cred,
      connectionType: "webrtc",
      libsampleratePath: new URL("./vendor/libsamplerate.worklet.js", import.meta.url).href,
      onConnect: () => mine === attempt && enterLive(),
      onDisconnect: (details) => mine === attempt && onEnd(details),
      onError: (message) => { if (mine === attempt && view === "connecting") fail(message); },
      onMessage: ({ role, message }) => mine === attempt && view === "live" && addLine(role, message),
      onModeChange: ({ mode }) => { if (call) { call.mode = mode; setMode(mode, call.muted); } },
    });
    clearTimeout(timeout);
    if (mine !== attempt) return session.endSession();
    conv = session;
    if (view === "connecting") enterLive();
  } catch (e) {
    if (mine === attempt) fail(e);
  }
}

function fail(e) {
  attempt++;
  conv?.endSession().catch(() => {});
  conv = null;
  console.warn("demo:", e?.message ?? e);
  show(classify(e));
}

// ---- live call ----
function enterLive() {
  if (view === "live") return;
  consented = false;
  showLive();
  call.tick = setInterval(() => {
    const sec = (performance.now() - call.t0) / 1000;
    setClock(sec);
    if (sec > config.maxSeconds + 5) endCall(); // the agent's own limit should have ended it already
  }, 250);
  call.raf = requestAnimationFrame(frame);
}

function frame(now) {
  if (!call) return;
  call.raf = requestAnimationFrame(frame);
  if (reduced && now - call.last < 100) return;
  call.last = now;
  const n = $("d-wave").children.length;
  const out = new Array(n).fill(0);
  if (conv && !call.muted) {
    const speaking = call.mode === "speaking";
    const scale = speaking ? 1.6 : 0.5;
    try {
      const data = speaking ? conv.getOutputByteFrequencyData() : conv.getInputByteFrequencyData();
      const vol = speaking ? conv.getOutputVolume() : conv.getInputVolume();
      if (data?.some((v) => v)) {
        for (let i = 0; i < n; i++) {
          const from = Math.floor((i * data.length) / n);
          const to = Math.max(from + 1, Math.floor(((i + 1) * data.length) / n));
          let sum = 0;
          for (let j = from; j < to; j++) sum += data[j];
          out[i] = (sum / (to - from) / 255) * scale;
        }
      } else {
        for (let i = 0; i < n; i++) out[i] = vol * scale * (0.6 + Math.random() * 0.4);
      }
    } catch { /* audio not ready yet: flat bars */ }
  }
  setBars(reduced ? out.map(() => Math.max(...out)) : out);
}

function stopLoops() {
  if (!call) return;
  clearInterval(call.tick);
  cancelAnimationFrame(call.raf);
}

async function endCall() {
  if (!conv || !call) return;
  call.userEnded = true;
  view = "ending";
  const end = stage.querySelector('[data-act="end"]');
  end.textContent = "Ending call";
  end.disabled = true;
  await conv.endSession().catch(() => {});
}

function onEnd(details) {
  if (!call) return fail(details?.message ?? "disconnected");
  const seconds = (performance.now() - call.t0) / 1000;
  const mine = call.userEnded;
  stopLoops();
  call = null;
  conv = null;
  attempt++;
  if (mine) return showEnded("user", seconds);
  if (seconds >= config.maxSeconds - 2) return showEnded("cap", seconds);
  if (details?.reason === "error") return show("error");
  showEnded("silence", seconds);
}

function toggleMute() {
  if (!conv || !call) return;
  call.muted = !call.muted;
  conv.setMicMuted(call.muted);
  stage.querySelector('[data-act="mute"]').textContent = call.muted ? "Unmute" : "Mute";
  setMode(call.mode, call.muted);
}

// ---- wiring ----
const actions = {
  start: ask,
  "consent-yes": () => { consented = true; begin(); },
  "consent-no": () => show("idle"),
  end: endCall,
  mute: toggleMute,
};
stage.addEventListener("click", (e) => actions[e.target.closest("[data-act]")?.dataset.act]?.());
picks.forEach((p, i) => p.addEventListener("click", () => {
  if (locked()) return;
  bizIdx = i;
  consented = false;
  show("idle");
}));
addEventListener("pagehide", () => conv?.endSession());

// Dev only: ?demo-state=... draws sample states when config.preview is on.
const sample = new URLSearchParams(location.search).get("demo-state");
if (config.preview && sample) {
  const { draw } = await import("./preview.js");
  const i = Number(new URLSearchParams(location.search).get("biz"));
  if (i >= 0 && i < BIZ.length) bizIdx = i;
  draw(sample, { show, showLive, showEnded, setMode, addLine, setClock, setBars });
} else if (config.enabled) {
  show("idle");
}
