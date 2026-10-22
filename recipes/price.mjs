/** PEN display only. Inputs remain decimal strings; no business discount calculation. */
export function formatAmount(amount) {
  if (typeof amount !== 'string' || !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(amount)) {
    throw new TypeError('Price must be a nonnegative decimal string with at most two decimal places.');
  }
  return amount.includes('.') ? amount.replace(/0+$/, '').replace(/\.$/, '') : amount;
}

export function amountInCents(amount) {
  formatAmount(amount);
  const [whole, fraction = ''] = amount.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}

export function preparePrice({ amount, previousAmount, discountLabel, unitLabel, variant }) {
  const current = formatAmount(amount);
  const previous = previousAmount === undefined ? undefined : formatAmount(previousAmount);
  if (previous !== undefined && amountInCents(previousAmount) <= amountInCents(amount)) {
    throw new RangeError('Previous price must exceed the current price.');
  }
  if (discountLabel !== undefined && (previous === undefined || typeof discountLabel !== 'string' ||
    !/^(\d{1,2}(\.\d{1,2})?|100)%$/.test(discountLabel) || Number.parseFloat(discountLabel) <= 0)) {
    throw new TypeError('Supply a positive percentage label without a sign and a valid previous price.');
  }
  if (unitLabel !== undefined && (typeof unitLabel !== 'string' || !unitLabel.trim())) throw new TypeError('Unit label must be text.');
  const style = variant ?? (previous === undefined ? 'regular' : 'offer');
  if (!['regular', 'offer', 'inverse'].includes(style)) throw new TypeError('Unknown price variant.');
  return { current, previous, discountLabel, unitLabel, variant: style };
}
