import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// The site is the documentation and showcase. Vue components come from @casaelida/vue and render on the server
// to static HTML. The one exception is the /mensajeria/ example, a client-side island that needs JavaScript to run
// its in-memory fixture conversation.
// GitHub Pages serves the site at https://j3w1.github.io/ce-theme/, so every page lives under `base`; hand-written
// internal URLs go through `url()` in site/url.mjs.
export default defineConfig({
  site: 'https://j3w1.github.io',
  base: '/ce-theme/',
  srcDir: './site',
  output: 'static',
  trailingSlash: 'always',
  integrations: [vue()],
});
