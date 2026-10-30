/** Types for product.mjs. Display only: supplied values are never rewritten or inferred. */
export interface CodeSegment {
  text: string;
  part: 'period' | 'number' | 'ending' | 'whole';
}

export interface ProductRecord {
  name?: string;
  description?: string;
  specs?: string[];
  code?: string;
  image?: string;
  imageAlt?: string;
  [field: string]: unknown;
}

export interface ProductView {
  name: string;
  description?: string;
  specs: string[];
  code?: string;
  image?: string;
  imageAlt: string;
  accessibleName: string;
}

export function formatName(name?: string | null): string | undefined;
export function formatDescription(description?: string | null): string | undefined;
export function codeSegments(code: string): CodeSegment[];
export function formatSpec(spec?: string | null, options?: { preserve?: string[] }): string | undefined;
export function productView(record: ProductRecord, options?: { maxSpecs?: number; preserve?: string[] }): ProductView;
