// Visible copy for /share-zones/. Edit this file to change wording.
// Marketing: /workspace/firstmate/marketing/logshare-copy-2026-11-14.md section 5.
// Extra lines marked "designer" come from /workspace/logshare/design/LAYOUT.md
// and have no Marketing counterpart.

export const strings = {
  title: "Help us build a better leveling overlay",
  metaDescription:
    "Drop your Client.txt here. Your browser keeps only the zone lines and throws the rest away before anything is sent.",

  h1: "Help us build a better leveling overlay",
  intro: [
    "Drop your Client.txt here. Your browser keeps only the lines about zones you've entered and strips out things like your character names and chat before anything is sent.",
    "We're building a leveling overlay for Path of Exile 1 and 2. It reads the game's own log file and draws on top of the screen. It doesn't touch the game, read its memory or press any keys, just the way GGG likes it.",
    "To get it right we need lots of examples of zones people have entered. The game writes a few lines to its log file, Client.txt, every time you enter a zone. Just drop your whole Client.txt below. The page keeps those lines, throws the rest away in your browser, and sends only what you see in the preview.",
  ],

  dropLabel: "Drag your Client.txt here",
  chooseFile: "or choose the file",
  dropFine: "Your file stays on your PC. This page reads it in your browser and keeps only the zone lines.",
  // Two easy steps, shown above the drop zone.
  stepsHeading: "Two easy steps",
  stepCopy: "Copy your Client.txt location.",
  stepOpen: "Click the box below, paste it into the File name field, then click Open.",
  installLabel: "Where the game is installed",
  installs: [
    { id: "steam", label: "Steam" },
    { id: "standalone", label: "Standalone" },
  ],
  // Client.txt locations per install, Path of Exile 1 first.
  paths: {
    steam: [
      { label: "Path of Exile 1", path: String.raw`C:\Program Files (x86)\Steam\steamapps\common\Path of Exile\logs\Client.txt` },
      { label: "Path of Exile 2", path: String.raw`C:\Program Files (x86)\Steam\steamapps\common\Path of Exile 2\logs\Client.txt` },
    ],
    standalone: [
      { label: "Path of Exile 1", path: String.raw`C:\Program Files (x86)\Grinding Gear Games\Path of Exile\logs\Client.txt` },
      { label: "Path of Exile 2", path: String.raw`C:\Program Files (x86)\Grinding Gear Games\Path of Exile 2\logs\Client.txt` },
    ],
  },
  copyPath: "Copy",
  copied: "Copied",

  // designer: designed reading state
  reading: "Reading on your computer. Nothing sent.",
  readingHint: "Big logs can take a few seconds.",
  readingProgress: (done, total) => `${done} of ${total} read`,

  nothingFound: "No zone lines found. Check that this is Client.txt from the game's logs folder.",
  wrongFile: "That doesn't look like a Client.txt. Nothing was sent.",
  tryAgain: "Choose a different file",

  // designer: phone note (Marketing did not provide this line)
  phoneNote: "This needs the PC you play on. Open this page there to drop your Client.txt.",

  // designer: Wi-Fi line, specified in LAYOUT.md
  wifiLine: "Want proof? Turn off your Wi-Fi and drop the file. It still works, because it all happens in your browser.",

  countLine: (n, game) =>
    `Found ${n.toLocaleString("en-US")} zone lines from Path of Exile ${game}. Things like your character names and chat were stripped out.`,
  gameUnknown: "an unknown game",
  game1: "1",
  game2: "2",
  gameBoth: "1 and 2",
  previewLead: "This is everything that will be sent. Scroll through it if you like.",
  send: "Submit",
  previewFine: "Only the lines in this box are sent. The rest of your log never leaves your PC.",
  sending: "Sending...",
  sendError: "That didn't go through. Nothing was saved. Try again in a minute.",
  thanks: (n) => `Got it, thank you! ${n.toLocaleString("en-US")} lines received. That genuinely helps.`,
  sendAnother: "Send another file",
  // designer: size-drop format
  sizeDrop: (read, send) => `Read ${read} · Sending ${send}`,
  dateRange: (from, to) => (from === to ? from : `${from} – ${to}`),
  dateRangeUnknown: "Dates not found",
  factLines: "Lines",
  factGame: "Game",
  factDates: "Dates",

  collectHeading: "What's collected and what isn't",
  collectWhat: "What we collect",
  collectWhatBody:
    "For each zone you entered, the time, the zone id, its level, the seed, and two numbers the game writes after it (tile hash and doodad hash).",
  collectDont: "What we don't",
  collectDontBody:
    "Chat, whispers, trade messages, character names, account names, or anything else from the log. We don't store your IP with your upload. No sign-up, no account.",
  collectFor: "What it's for",
  collectForBody:
    "Building a leveling overlay that reads the game's log file and draws on top of the screen. The same zone can be laid out a few different ways, and the seed and two hash numbers tell us which version you got, so the overlay can learn the routes through each version.",
  // designer: only said because it is true of this page
  noCookies: "This page doesn't use cookies or analytics.",

  faqHeading: "Questions",
  faq: [
    { q: "Do I need an account?", a: "No." },
    { q: "Does my whole log get uploaded?", a: "No. Only the lines you see in the preview box." },
    { q: "Where's my Client.txt?", a: "In your game folder, inside the logs folder." },
    { q: "Who's behind this?", a: "A small team that makes tools for games. Not affiliated with or endorsed by Grinding Gear Games." },
  ],

  readTheCode: "Read the code that runs on this page",
  // Absolute, unminified, so a chatbot reading the raw HTML can follow it.
  scriptUrl: "https://firstmatelabs.com/share-zones/strip.js",

  // Security check pill + popover. Words: Marketing. Look: Designer.
  secPill: "Concerned about security?",
  secEyebrow: "Check it yourself",
  secTitle: "Don't take our word for it. Ask your favorite AI.",
  secCopy: "Copy check prompt",
  secCopied: "Copied. Now paste it into any chatbot.",
  secChipsLabel: "Open a chatbot:",
  secReadCode: "Read the page code",
  secClose: "Close",
  secChatbots: [
    { label: "ChatGPT", href: "https://chatgpt.com/" },
    { label: "Claude", href: "https://claude.ai/new" },
    { label: "Gemini", href: "https://gemini.google.com/app" },
    { label: "Grok", href: "https://grok.com/" },
  ],
  secPromptIntro:
    "Please check this page for me: https://firstmatelabs.com/share-zones/ . Below is the script that runs in my browser and strips my Path of Exile Client.txt before anything is sent, followed by an example of exactly what gets sent.",
  secPromptScriptUrl: "Script URL:",
  secPromptScript: "The script:",
  secPromptRaw: "Example raw line:",
  // Real line from a 2026-11-04 Client.txt capture; the prompt shows it and its stripped form.
  secPromptExampleLine:
    '2026/11/04 21:40:10 34023296 1186a8a3 [DEBUG Client 11356] Generating level 1 area "1_1_1" with seed 1217117143',
  secPromptSent: "What gets sent:",
  secPromptQuestion:
    "Read the script and the example, then tell me in plain words: is this safe to use, and does it send anything besides zone lines?",
  navHome: "First Mate Labs, home",
  navContact: "Contact",
  footerEmail: "hello@firstmatelabs.com",
  footerPrivacy: "Privacy Policy",
  footerLegal: "This site isn't affiliated with or endorsed by Grinding Gear Games in any way.",

  // Portrait clip cards (5:7). slot "hero" sits beside the intro; slot "lower"
  // sits beside the drop zone. A slot with no items renders nothing.
  // Each item: { src, poster, label, slot }
  clipCards: [
    { src: "cards/route-1.mp4", poster: "cards/route-1.png", label: "Overlay route clip 1", slot: "hero" },
    { src: "cards/route-2.mp4", poster: "cards/route-2.png", label: "Overlay route clip 2", slot: "hero" },
    { src: "cards/route-3.mp4", poster: "cards/route-3.png", label: "Overlay route clip 3", slot: "lower" },
    { src: "cards/route-4.mp4", poster: "cards/route-4.png", label: "Overlay route clip 4", slot: "lower" },
  ],
};

