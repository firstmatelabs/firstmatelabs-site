// Beta-tester invites. Nothing renders while DISCORD_INVITE is empty.
import { strings as S, DISCORD_INVITE } from "./strings.js";

const ICON_ARROW =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>';

function inviteLink(cls, text) {
  const a = document.createElement("a");
  a.className = cls;
  a.href = DISCORD_INVITE;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  const span = document.createElement("span");
  span.textContent = text;
  a.append(span);
  a.insertAdjacentHTML("beforeend", ICON_ARROW);
  return a;
}

// Small link under the hero lead.
export function renderHeroDiscord() {
  if (!DISCORD_INVITE) return;
  const p = document.createElement("p");
  p.className = "discord-hero";
  p.append(inviteLink("discord-link", S.discordHeroLink));
  document.querySelector(".page-head .lead").after(p);
}

// Line at the bottom of the security popover / sheet.
export function discordPopoverLine() {
  if (!DISCORD_INVITE) return null;
  const p = document.createElement("p");
  p.className = "sec-discord";
  p.append(S.discordPopoverLead + " ", inviteLink("discord-link", S.discordPopoverLink));
  return p;
}

// Featured card in the thank-you state.
export function discordCard() {
  if (!DISCORD_INVITE) return null;
  const card = document.createElement("div");
  card.className = "discord-card";
  const eyebrow = document.createElement("p");
  eyebrow.className = "discord-eyebrow";
  eyebrow.textContent = S.discordEyebrow;
  const title = document.createElement("h4");
  title.className = "discord-title";
  title.textContent = S.discordTitle;
  const body = document.createElement("p");
  body.className = "discord-body";
  body.textContent = S.discordBody;
  card.append(eyebrow, title, body, inviteLink("discord-btn", S.discordButton));
  return card;
}
