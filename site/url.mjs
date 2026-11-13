// The site is served under Astro's `base` (/ce-theme/ on GitHub Pages). Every hand-written internal URL goes through
// url(): page links, form actions, assets, downloads and the URLs inside island data. Imported CSS and fonts are rebased by
// the bundler. Write the path from the site root: url('/fundamentos/'), url('/assets/logo-wordmark-color.png').
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

export const url = (path = '/') => BASE + path.replace(/^\//, '');
