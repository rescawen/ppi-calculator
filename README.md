# PPI Calculator

A RedwoodSDK app for calculating display pixel density, physical display dimensions, dot pitch, aspect ratio, and megapixels from resolution and diagonal size.

The app also includes a clickable catalog of common devices and display presets.

## Local development

```sh
pnpm install
pnpm dev
```

## Useful commands

```sh
pnpm build
pnpm types
pnpm lint
pnpm lint:fix
pnpm format:check
pnpm format
pnpm check
```

## Deployment

This project uses RedwoodSDK on Cloudflare Workers. The Worker entrypoint is `src/worker.tsx`, and deploy/runtime configuration lives in `wrangler.jsonc`.
