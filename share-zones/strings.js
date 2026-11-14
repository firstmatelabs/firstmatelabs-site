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
  whereToFind: "In your game folder, inside logs. Common spots are listed below.",
  paths: [
    { label: "Path of Exile 2 (Steam)", path: String.raw`C:\Program Files (x86)\Steam\steamapps\common\Path of Exile 2\logs\Client.txt` },
    { label: "Path of Exile 2 (standalone)", path: String.raw`C:\Program Files (x86)\Grinding Gear Games\Path of Exile 2\logs\Client.txt` },
    { label: "Path of Exile 1 (Steam)", path: String.raw`C:\Program Files (x86)\Steam\steamapps\common\Path of Exile\logs\Client.txt` },
    { label: "Path of Exile 1 (standalone)", path: String.raw`C:\Program Files (x86)\Grinding Gear Games\Path of Exile\logs\Client.txt` },
  ],
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
  send: (n) => `Send these ${n.toLocaleString("en-US")} lines`,
  clear: "Cancel",
  previewFine: "Only the lines in this box are sent. The rest of your log never leaves your PC.",
  sending: "Sending...",
  sendError: "That didn't go through. Nothing was saved. Try again in a minute.",
  thanks: (n) => `Got it, thank you! ${n.toLocaleString("en-US")} lines received. That genuinely helps.`,
  thanksMore: "If you play more and want to send a newer log later, you're welcome to.",
  sendAnother: "Send another file",
  copyLines: "Copy",
  saveTxt: "Save as .txt",
  // designer: size-drop format
  sizeDrop: (read, send) => `Read ${read} · Sending ${send}`,
  dateRange: (from, to) => (from === to ? from : `${from} – ${to}`),
  dateRangeUnknown: "Dates not found",
  factLines: "Lines",
  factGame: "Game",
  factDates: "Dates",

  receiveHeading: "What we receive",
  // Real lines from a 2026-11-04 Client.txt capture on the box (mm-text). Not Marketing's sample numbers.
  receiveGeneratingRaw: '2026/11/04 21:40:10 34023296 1186a8a3 [DEBUG Client 11356] Generating level 1 area "1_1_1" with seed 1217117143',
  receiveGeneratingSent: '2026/11/04 21:40:10 Generating level 1 area "1_1_1" with seed 1217117143',
  receiveTileRaw: "2026/11/04 21:40:11 34024078 f22b6a02 [INFO Client 11356] Tile hash: 722565776",
  receiveTileSent: "2026/11/04 21:40:11 Tile hash: 722565776",
  receiveCaption: "Grey parts are removed in your browser. Only the bright parts are sent.",

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
  navHome: "First Mate Labs, home",
  navContact: "Contact",
  footerEmail: "hello@firstmatelabs.com",
  footerPrivacy: "Privacy Policy",
  footerLegal: "This site isn't affiliated with or endorsed by Grinding Gear Games in any way.",

  // Portrait clip cards (5:7) shown between the intro and the drop zone.
  // Leave this list empty until Video Editor Bot delivers files into cards/.
  // Each item: { src, poster, label }
  clipCards: [],
};

