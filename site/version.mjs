// What every page says it was built from: the source commit (read when the site is built) and the versions of the
// foundation (package.json) and of @casaelida/vue (packages/vue/package.json).
import { execFileSync } from 'node:child_process';
import foundation from '../package.json';
import vue from '../packages/vue/package.json';

export const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
export const commitUrl = `https://github.com/j3w1/ce-theme/commit/${commit}`;
export const foundationVersion = foundation.version;
export const vueVersion = vue.version;
