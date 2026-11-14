// Shared clipboard helper. Show the address as visible text with a Copy
// button. No mail links, no app prompt.
export const DEFAULT_EMAIL = "hello@firstmatelabs.com";

export async function copyText(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the execCommand path.
    }
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.setAttribute("aria-hidden", "true");
  ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;border:0;padding:0;margin:0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, ta.value.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } finally {
    ta.remove();
  }
  if (!ok) throw new Error("copy failed");
}

export function wireCopyButton(btn, address) {
  const original = btn.getAttribute("data-copy-label") || btn.textContent || "Copy";
  btn.type = "button";
  btn.setAttribute("data-copy-label", original);
  let timer = 0;
  btn.addEventListener("click", async () => {
    await copyText(address);
    btn.textContent = "Copied";
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      btn.textContent = original;
    }, 2000);
  });
}

export function mountEmailCopy(root, opts = {}) {
  const address = opts.address || root.getAttribute("data-email") || DEFAULT_EMAIL;
  const variant = opts.variant || root.getAttribute("data-variant") || "";
  const btnClass = opts.buttonClass || root.getAttribute("data-button-class") || (variant === "nav" ? "btn" : "btn sm");
  root.classList.add("email-copy");
  if (variant) root.setAttribute("data-variant", variant);
  if (!root.getAttribute("data-email")) root.setAttribute("data-email", address);
  const addr = document.createElement("span");
  addr.className = "email-addr";
  addr.textContent = address;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = btnClass;
  btn.textContent = opts.copyLabel || "Copy";
  root.replaceChildren(addr, btn);
  wireCopyButton(btn, address);
  return root;
}

export function enhanceEmailCopies(scope = document) {
  for (const el of scope.querySelectorAll("[data-email]")) {
    if (el.querySelector("button")) continue;
    mountEmailCopy(el);
  }
  for (const btn of scope.querySelectorAll("[data-copy-email]")) {
    if (btn.getAttribute("data-copy-wired") === "1") continue;
    btn.setAttribute("data-copy-wired", "1");
    wireCopyButton(btn, btn.getAttribute("data-copy-email"));
  }
}

export function emailCopyHTML(address = DEFAULT_EMAIL, buttonClass = "btn sm") {
  const esc = String(address)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
  const cls = String(buttonClass).replace(/"/g, "");
  return `<span class="email-copy" data-email="${esc}" data-button-class="${cls}"></span>`;
}

function boot() {
  enhanceEmailCopies();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
