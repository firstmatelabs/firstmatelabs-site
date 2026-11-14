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
    "We're building a levelling overlay for Path of Exile 1 and 2. It reads the game's own log file and draws on top of the screen. It doesn't touch the game, read its memory or press any keys, just the way GGG likes it.",
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
  receiveRawLabel: "A raw line from the log",
  receiveSentLabel: "What the page sends",
  // Real lines from a 2026-11-04 Client.txt capture on the box (mm-text). Not Marketing's sample numbers.
  receiveGeneratingRaw: '2026/11/04 21:40:10 34023296 1186a8a3 [DEBUG Client 11356] Generating level 1 area "1_1_1" with seed 1217117143',
  receiveGeneratingSent: '2026/11/04 21:40:10 Generating level 1 area "1_1_1" with seed 1217117143',
  receiveTileRaw: "2026/11/04 21:40:11 34024078 f22b6a02 [INFO Client 11356] Tile hash: 722565776",
  receiveTileSent: "2026/11/04 21:40:11 Tile hash: 722565776",
  labels: { time: "time", level: "level", areaId: "area id", seed: "seed", check: "check numbers" },

  collectHeading: "What's collected and what isn't",
  collectWhat: "What we collect",
  collectWhatBody:
    "For each zone you entered, the time, the zone id, its level, the seed, and two numbers the game writes after it (tile hash and doodad hash).",
  collectDont: "What we don't",
  collectDontBody:
    "Chat, whispers, trade messages, character names, account names, or anything else from the log. We don't store your IP with your upload. No sign-up, no account.",
  collectFor: "What it's for",
  collectForBody:
    "Building a levelling overlay that reads the game's log file and draws on top of the screen. The same zone can be laid out a few different ways, and the seed and two hash numbers tell us which version you got, so the overlay can learn the routes through each version.",
  // designer: only said because it is true of this page
  noCookies: "This page doesn't use cookies or analytics.",

  scriptHeading: "Prefer to do it yourself? The one-line command",
  scriptIntro:
    "This does the same filtering on your own PC with a command built into Windows. It only reads the log and writes a new text file to your Desktop. Nothing is changed and nothing is sent. You open the file, check it, then drop that file on this page instead.",
  scriptHow:
    "Open Command Prompt (Start, type cmd, press Enter), paste the line for your game, and press Enter.",
  scriptTabs: [
    {
      id: "poe2-steam",
      label: "Path of Exile 2 (Steam)",
      command: String.raw`findstr /C:"Generating level" /C:"Tile hash" /C:"Doodad hash" "C:\Program Files (x86)\Steam\steamapps\common\Path of Exile 2\logs\Client.txt" > "%USERPROFILE%\Desktop\poe2-zones.txt"`,
    },
    {
      id: "poe2-standalone",
      label: "Path of Exile 2 (standalone)",
      command: String.raw`findstr /C:"Generating level" /C:"Tile hash" /C:"Doodad hash" "C:\Program Files (x86)\Grinding Gear Games\Path of Exile 2\logs\Client.txt" > "%USERPROFILE%\Desktop\poe2-zones.txt"`,
    },
    {
      id: "poe1-steam",
      label: "Path of Exile 1 (Steam)",
      command: String.raw`findstr /C:"Generating level" /C:"Tile hash" /C:"Doodad hash" "C:\Program Files (x86)\Steam\steamapps\common\Path of Exile\logs\Client.txt" > "%USERPROFILE%\Desktop\poe-zones.txt"`,
    },
    {
      id: "poe1-standalone",
      label: "Path of Exile 1 (standalone)",
      command: String.raw`findstr /C:"Generating level" /C:"Tile hash" /C:"Doodad hash" "C:\Program Files (x86)\Grinding Gear Games\Path of Exile\logs\Client.txt" > "%USERPROFILE%\Desktop\poe-zones.txt"`,
    },
  ],
  scriptPartsHeading: "What each part does:",
  scriptParts: [
    "findstr is Windows' own \"find text in a file\" command. It's been part of Windows for decades.",
    "/C:\"Generating level\", /C:\"Tile hash\" and /C:\"Doodad hash\" are the three bits of text to look for. A line is kept if it contains any of them. Every other line is skipped.",
    "\"C:\\...\\logs\\Client.txt\" is the file to read: your game's log. If your game is installed somewhere else (for example D:\\SteamLibrary\\steamapps\\common\\...), change this part to match.",
    "> means \"write the results to this file instead of the screen\".",
    "\"%USERPROFILE%\\Desktop\\poe2-zones.txt\" is the new file, on your Desktop. If you get \"The system cannot find the path specified\", your Desktop may be inside OneDrive. Change it to \"%USERPROFILE%\\OneDrive\\Desktop\\poe2-zones.txt\".",
  ],
  scriptDifference:
    "One difference from the page: findstr keeps whole lines, so each line also has a couple of internal log numbers before the zone text. They're just log counters, not names or chat. The page trims those off automatically when you drop the file in. And if you ever typed one of those three phrases in chat, that line would match too, so give the file a quick read first.",
  scriptDropNote:
    "Drop that file on the box above. The page strips it the same way. The raw findstr file is not accepted on its own if you send it without dropping it here first.",
  scriptCheckHeading: "Check it yourself",
  scriptCheck:
    "Not sure about the command or this page? Paste the command into any chatbot (ChatGPT, Claude, Grok, whatever you use) and ask \"what does this do, and does it send anything anywhere?\" You can also open the text file in Notepad before you share it.",

  faqHeading: "Questions",
  faq: [
    { q: "Do I need an account?", a: "No. No sign-up, no email, nothing." },
    { q: "Does the whole log get uploaded?", a: "No. Your browser trims it first, and only the lines shown in the box are sent." },
    { q: "Can I send logs from both games?", a: "Yes. Drop each one in. The page shows which game it looks like." },
    { q: "Is my log too big?", a: "Logs can be hundreds of MB. The page reads it in pieces, so it may take a few seconds." },
    { q: "How long do you keep uploads?", a: "We keep uploads while we build the overlay. They hold no names, chat or account details, so there's nothing that ties one back to you." },
    { q: "Can I get my upload deleted?", a: "We don't store your IP or your name with the upload, so we can't match an upload to a person." },
    { q: "Who's behind this?", a: "A small team that makes tools for games. Not affiliated with or endorsed by Grinding Gear Games." },
  ],

  readTheCode: "Read the code that runs on this page",
  navHome: "First Mate Labs, home",
  navContact: "Contact",
  footerEmail: "hello@firstmatelabs.com",
  footerPrivacy: "Privacy Policy",
  footerLegal: "This site isn't affiliated with or endorsed by Grinding Gear Games in any way.",
};
