# firstmatelabs.com

Static site for First Mate Labs LLC. Plain HTML and CSS, no build step. Serve the folder with any static server, for example `python3 -m http.server`.

## Business address

The mailing address appears as one exact string:

    30 North Gould Street, Suite 70227, Sheridan, WY 82801

It is used in the footer of every page (`index.html`, `terms/`, `privacy/`, `refund/`, `ai-voice-disclosure/`), in the contact block on the home page, and in the body and contact sections of the legal pages. Keep it as a single string, with no line breaks or abbreviations, so one replace changes it everywhere:

    rg -l "30 North Gould Street, Suite 70227, Sheridan, WY 82801" | xargs sed -i 's/30 North Gould Street, Suite 70227, Sheridan, WY 82801/NEW ADDRESS/g'
