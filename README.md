# PPI Calculator

A RedwoodSDK app for calculating display pixel density, physical display dimensions, dot pitch, aspect ratio, and megapixels from resolution and diagonal size.

The app also includes a clickable catalog of common devices and display presets.

## Local development

```sh
npm install
npm run dev
```

## Useful commands

```sh
npm run build
npm run types
npm run lint
npm run lint:fix
npm run format:check
npm run format
npm run check
```

## Deployment

This project uses RedwoodSDK on Cloudflare Workers. The Worker entrypoint is `src/worker.tsx`, and deploy/runtime configuration lives in `wrangler.jsonc`.
