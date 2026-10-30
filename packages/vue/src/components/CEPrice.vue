<script setup lang="ts">
import { computed } from 'vue';
import { preparePrice } from '../../../../recipes/price.mjs';

/**
 * Renders the `ce-price` recipe from supplied decimal strings, through the shared formatter in `recipes/price.mjs`.
 * Display only: it never calculates a discount. Invalid input throws, as the formatter does.
 */
export interface CEPriceProps {
  /** Current price as a decimal string: `"6.50"` shows `S/6.5`. */
  amount: string;
  /** Supplied previous price; shown as “Antes” with the amount struck. Makes the price an offer by default. */
  previousAmount?: string;
  /** Supplied discount percentage without a sign, such as `"20%"`. Needs `previousAmount`. */
  discountLabel?: string;
  /** Unit basis, such as “cada uno”. */
  unitLabel?: string;
  /** Short unit basis for narrow places; “cada uno” gets “c/u” automatically. */
  unitShortLabel?: string;
  /** Presentation basis without the slash, such as “pack de 12”. Not together with `unitLabel`. */
  presentationLabel?: string;
  /** Alias of `presentationLabel`. */
  packLabel?: string;
  /** `baseline` (default), `joined` or `raised`. */
  currencyStyle?: 'baseline' | 'joined' | 'raised';
  /** `regular`, `offer` (yellow promotion), `sale` (red Rebajas) or `inverse` (on dark surfaces). */
  variant?: 'regular' | 'offer' | 'inverse' | 'sale';
}

const props = defineProps<CEPriceProps>();

const price = computed(() => preparePrice({
  amount: props.amount, previousAmount: props.previousAmount, discountLabel: props.discountLabel, unitLabel: props.unitLabel,
  unitShortLabel: props.unitShortLabel, presentationLabel: props.presentationLabel, packLabel: props.packLabel,
  currencyStyle: props.currencyStyle, variant: props.variant,
}));
const classes = computed(() => [
  'ce-price',
  price.value.variant !== 'regular' && `ce-price--${price.value.variant}`,
  price.value.currencyStyle !== 'baseline' && `ce-price--${price.value.currencyStyle}`,
]);
const spoken = computed(() => {
  const { current, unitLabel, presentationLabel } = price.value;
  return `Precio actual: ${current} soles${unitLabel ? `, ${unitLabel}` : ''}${presentationLabel ? ` por ${presentationLabel}` : ''}`;
});
</script>

<template>
  <div class="ce-price-block">
    <div v-if="price.previous !== undefined" class="ce-price-history">
      <span>Antes <del>S/{{ price.previous }}</del></span>
      <span v-if="price.discountLabel" class="ce-discount"><span class="ce-sr-only">Descuento: </span>−{{ price.discountLabel }}</span>
    </div>
    <span :class="classes">
      <span class="ce-sr-only">{{ spoken }}</span>
      <span class="ce-price-amount" aria-hidden="true"><span class="ce-price-currency">S/</span><span class="ce-price-value">{{ price.current }}</span></span>
      <span v-if="price.unitLabel" class="ce-price-unit" aria-hidden="true"><span class="ce-price-unit-long">{{ price.unitLabel }}</span><span v-if="price.unitShort" class="ce-price-unit-short">{{ price.unitShort }}</span></span>
      <span v-if="price.presentationLabel" class="ce-price-presentation" aria-hidden="true">/{{ price.presentationLabel }}</span>
    </span>
  </div>
</template>
