import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// The site is the documentation and showcase. Vue components come from @casaelida/vue and render on the server
// to static HTML; none of them needs client-side JavaScript on these pages.
export default defineConfig({
  srcDir: './site',
  output: 'static',
  trailingSlash: 'always',
  integrations: [vue()],
});
