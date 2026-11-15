// Vercel serves a physical /ce-theme/ tree. The ordinary Astro/Pages build stays in dist/ unchanged.
import { cp, mkdir, rm } from 'node:fs/promises';

const output = new URL('../dist-vercel/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(new URL('../dist/', import.meta.url), new URL('ce-theme/', output), { recursive: true });
