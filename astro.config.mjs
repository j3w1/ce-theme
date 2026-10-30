import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// The site is the documentation and showcase. Vue components come from @casaelida/vue and render on the server
// to static HTML. The one exception is the /mensajeria/ example, a client-side island that needs JavaScript to run
// its in-memory fixture conversation.
export default defineConfig({
  srcDir: './site',
  output: 'static',
  trailingSlash: 'always',
  integrations: [vue()],
});
