// The retail reference used for design research is kept out of this public repository by name. This pattern is the only
// place that knows it, spelled by character codes so the name never appears in a file; scripts/validate.mjs checks the
// tracked files and tests/dist/public-output.test.mjs the built site with it.
export const WITHHELD = new RegExp(String.fromCharCode(105, 107, 101, 97), 'i');
