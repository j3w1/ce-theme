/** Types for price.mjs. PEN display only; amounts are decimal strings, never numbers. */
export type PriceVariant = 'regular' | 'offer' | 'inverse' | 'sale';
export type CurrencyStyle = 'baseline' | 'joined' | 'raised';

export interface PriceInput {
  amount: string;
  previousAmount?: string;
  discountLabel?: string;
  unitLabel?: string;
  unitShortLabel?: string;
  packLabel?: string;
  presentationLabel?: string;
  variant?: PriceVariant;
  currencyStyle?: CurrencyStyle;
}

export interface PreparedPrice {
  current: string;
  previous?: string;
  discountLabel?: string;
  unitLabel?: string;
  unitShort?: string;
  presentationLabel?: string;
  packLabel?: string;
  currencyStyle: CurrencyStyle;
  variant: PriceVariant;
}

export function formatAmount(amount: string): string;
export function amountInCents(amount: string): bigint;
export function preparePrice(input: PriceInput): PreparedPrice;
