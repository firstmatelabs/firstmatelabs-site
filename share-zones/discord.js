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

function inviteCard(cls, titleTag, title, paragraphs, note) {
  const card = document.createElement("div");
  card.className = "invite-card " + cls;
  const eyebrow = document.createElement("p");
  eyebrow.className = "invite-eyebrow";
  eyebrow.textContent = S.discordEyebrow;
  const h = document.createElement(titleTag);
  h.className = "invite-title";
  h.textContent = title;
  card.append(eyebrow, h);
  for (const text of paragraphs) {
    const p = document.createElement("p");
    p.className = "invite-body";
    p.textContent = text;
    card.append(p);
  }
  card.append(inviteLink("discord-btn", S.discordButton));
  if (note) {
    const n = document.createElement("p");
    n.className = "invite-note";
    n.textContent = note;
    card.append(n);
  }
  return card;
}

// Featured card in the thank-you state.
export function discordCard() {
  if (!DISCORD_INVITE) return null;
  return inviteCard("discord-card", "h4", S.discordTitle, [S.discordBody]);
}

// Always-visible beta section after the upload area. CSS hides it while
// the thank-you card is on screen, so the invite isn't shown twice.
export function renderBetaSection() {
  const block = document.getElementById("beta-block");
  if (!DISCORD_INVITE) {
    block.remove();
    return;
  }
  const card = inviteCard("beta-card", "h2", S.betaTitle, S.betaBody, S.betaNote);
  block.querySelector(".wrap").append(card);
}
