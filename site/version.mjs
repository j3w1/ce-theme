// What every page says it was built from: the source commit (read when the site is built) and the versions of the
// foundation (package.json) and of @casaelida/vue (packages/vue/package.json), with the Vue range the package needs.
import { execFileSync } from 'node:child_process';
import foundation from '../package.json';
import vue from '../packages/vue/package.json';

export const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
export const commitUrl = `https://github.com/j3w1/ce-theme/commit/${commit}`;
export const foundationVersion = foundation.version;
export const vueVersion = vue.version;
export const vuePeer = vue.peerDependencies.vue;
/** The B1-release asset of this package version on GitHub Releases. */
export const vueAsset = `https://github.com/j3w1/ce-theme/releases/download/vue-v${vue.version}/casaelida-vue-${vue.version}.tgz`;
