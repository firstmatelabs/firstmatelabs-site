// Menu below 1100px: a sheet under the sticky header, built from the inline nav links.
import { enhanceEmailCopies } from "./copy-email.js";

(() => {
  const nav = document.querySelector("nav");
  const btn = nav && nav.querySelector(".menu-btn");
  if (!btn) return;
  const tel = nav.querySelector(".right .tel");
  const links = [...nav.querySelectorAll(".wrap > ul a")];
  const icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>';

  const sheet = document.createElement("div");
  sheet.id = "menu";
  sheet.className = "navsheet";
  sheet.hidden = true;
  let html = '<div class="wrap"><ul>' +
    links.map((a) => `<li><a href="${a.getAttribute("href")}">${a.textContent}</a></li>`).join("") +
    "</ul>";
  if (tel) {
    html += `<a class="tel-row nowrap" href="${tel.getAttribute("href")}">${icon}${tel.textContent}</a>`;
  }
  html += '<div class="navsheet-email" data-email="hello@firstmatelabs.com" data-variant="nav"></div></div>';
  sheet.innerHTML = html;
  nav.append(sheet);
  enhanceEmailCopies(sheet);

  const items = () => [btn, ...sheet.querySelectorAll("a, button")];
  const isOpen = () => btn.getAttribute("aria-expanded") === "true";
  let y = 0; // page scroll when the sheet opened

  function open() {
    y = scrollY;
    btn.setAttribute("aria-expanded", "true");
    sheet.hidden = false;
    sheet.offsetHeight; // start the slide from the closed position
    sheet.classList.add("in");
    document.documentElement.classList.add("menu-open");
    const first = sheet.querySelector("a, button");
    if (first) first.focus({ preventScroll: true });
  }
  function close(refocus = true) {
    if (!isOpen()) return;
    btn.setAttribute("aria-expanded", "false");
    sheet.classList.remove("in");
    sheet.hidden = true;
    document.documentElement.classList.remove("menu-open");
    if (scrollY !== y) scrollTo({ top: y, behavior: "instant" });
    if (refocus) btn.focus({ preventScroll: true });
  }

  btn.addEventListener("click", () => (isOpen() ? close() : open()));
  // A link closes the sheet first, so the page can scroll to the section.
  // Copy is a button, so it does not close the sheet.
  sheet.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
  document.addEventListener("pointerdown", (e) => {
    if (isOpen() && !sheet.contains(e.target) && !btn.contains(e.target)) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    e.preventDefault();
    const list = items();
    const i = list.indexOf(document.activeElement) + (e.shiftKey ? -1 : 1);
    list[(i + list.length) % list.length].focus({ preventScroll: true });
  });
  matchMedia("(min-width: 1100px)").addEventListener("change", (e) => { if (e.matches) close(false); });

  // Arriving at /#section from another page: the demo renders after the first jump, so land on the section again.
  addEventListener("load", () => requestAnimationFrame(() => {
    const t = location.hash && document.getElementById(location.hash.slice(1));
    const off = t && t.getBoundingClientRect().top - nav.offsetHeight;
    if (off && Math.abs(off) > 2) scrollTo({ top: scrollY + off, behavior: "instant" });
  }));
})();
