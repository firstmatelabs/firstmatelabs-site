# Vendored voice SDK

Pinned builds, served from this site. Nothing is loaded from a CDN.

| File | Source | Version | License |
|---|---|---|---|
| `elevenlabs-client.js` | `@elevenlabs/client` (bundles `livekit-client` 2.23.0 and `@elevenlabs/types` 0.26.0) | 1.32.0 | MIT, Apache-2.0 (see the two LICENSE files) |
| `libsamplerate.worklet.js` | `@alexanderolsen/libsamplerate-js` | 2.1.2 | MIT |

The SDK would fetch `libsamplerate.worklet.js` from jsDelivr by default. `demo.js` passes `libsampleratePath` so it comes from here instead.

## Rebuild `elevenlabs-client.js`

```sh
mkdir build && cd build && npm init -y
npm i --save-exact @elevenlabs/client@1.32.0 esbuild
echo 'export { Conversation } from "@elevenlabs/client";' > entry.js
npx esbuild entry.js --bundle --minify --format=esm --platform=browser --target=es2020 --legal-comments=none --outfile=elevenlabs-client.js
```
