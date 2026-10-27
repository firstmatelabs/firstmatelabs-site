// Dev only. Loaded when config.preview is true and the URL has ?demo-state=...
// Draws each state with sample content so it can be reviewed without a call.
// Never ships switched on: config.preview is false by default.

const LINES = [
  ["agent", "Ridgeline Heating and Air, demo line. I'm an AI assistant. Is your system down right now, or do you want to schedule a visit?"],
  ["user", "My furnace is blowing cold air."],
  ["agent", "Sorry to hear that. Is the system running at all, and is anyone in the home without heat right now?"],
];
const CAP_LINES = [
  ["agent", "Understood. I'll mark this as a no-heat call for today. What's the address, and the best number to reach you?"],
  ["user", "It's 41 Marlow Road. The number is on my…"],
  ["agent", "I have to end the demo here. That was the 3-minute limit."],
];

// Deterministic bar levels so screenshots repeat.
function levels(n, peak, seed) {
  return Array.from({ length: n }, (_, i) => {
    const x = Math.sin(i * 0.37 + seed) * 0.5 + Math.sin(i * 0.11 + seed * 2) * 0.5;
    return peak * (0.35 + 0.65 * Math.abs(x));
  });
}

function live(api, { mode, muted = false, lines = LINES, sec = 34 }) {
  api.showLive();
  for (const [role, text] of lines) api.addLine(role, text);
  api.setMode(mode, muted);
  api.setClock(sec);
  const n = document.getElementById("d-wave").children.length;
  api.setBars(muted ? [] : mode === "speaking" ? levels(n, 1, 1) : levels(n, 0.35, 4));
}

export function draw(name, api) {
  switch (name) {
    case "idle": case "mic": case "unsupported": case "denied": case "connecting": case "busy": case "error":
      return api.show(name);
    case "speaking": return live(api, { mode: "speaking" });
    case "listening": return live(api, { mode: "listening", sec: 72 });
    case "muted": return live(api, { mode: "listening", muted: true, sec: 72 });
    case "warning": return live(api, { mode: "speaking", sec: 152 });
    case "ended": case "ended-cap": case "silence": {
      const cap = name === "ended-cap";
      live(api, { mode: "listening", lines: cap ? CAP_LINES : LINES, sec: cap ? 180 : 72 });
      return api.showEnded(name === "silence" ? "silence" : cap ? "cap" : "user", cap ? 180 : 72);
    }
    default: return api.show("idle");
  }
}
