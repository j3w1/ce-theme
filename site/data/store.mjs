// Storefront demonstration fixtures. Stores, prices, stock and order states are examples for the reference site,
// not live records or current offers. Prices are decimal strings per store; a product without a price for the
// selected store shows the "price unavailable" state instead of S/0.
import { products } from './products.mjs';

export const stores = [
  { id: 'tacna', name: 'Tacna', note: 'Tienda de ejemplo' },
  { id: 'arequipa', name: 'Arequipa', note: 'Tienda de ejemplo' },
];

// Catalogue identity only; price, offer and badge come from the store view below.
const base = ({ amount, previousAmount, discountLabel, badge, ...identity }) => identity;
const [mene, nome, tilen, talen] = products.map(base);

export const catalogue = [
  { ...mene, flag: 'Nuevo', prices: { tacna: '6.50', arequipa: '6.90' }, stock: { tacna: 'available', arequipa: 'limited' }, family: 'tazas', options: [mene, nome] },
  { ...nome, prices: { tacna: '8.00', arequipa: '8.50' }, stock: { tacna: 'available', arequipa: 'available' }, family: 'tazas', options: [nome, mene] },
  { ...tilen, prices: { tacna: '6.00' }, previous: { tacna: '7.50' }, discount: { tacna: '20%' }, stock: { tacna: 'available', arequipa: 'unavailable' }, family: 'tapetes', options: [tilen, talen] },
  { ...talen, prices: { tacna: '8.50', arequipa: '8.50' }, stock: { tacna: 'limited', arequipa: 'available' }, family: 'tapetes', options: [talen, tilen] },
];

export const stockText = {
  available: (store) => `Disponible en ${store}`,
  limited: (store) => `Pocas unidades en ${store}`,
  unavailable: (store) => `Agotado en ${store}`,
};

export const categories = [
  { label: 'Cocina', icon: 'home', image: '/assets/product-nome.png', href: '/tienda/categoria/' },
  { label: 'Tazas y vasos', image: '/assets/product-mene.png', href: '/tienda/categoria/' },
  { label: 'Baño', image: '/assets/product-tilen.png', href: '/tienda/categoria/' },
  { label: 'Tapetes', image: '/assets/product-talen.png', href: '/tienda/categoria/' },
  { label: 'Regalos', icon: 'gift', href: '/tienda/categoria/' },
  { label: 'Ofertas', icon: 'tag', href: '/tienda/categoria/' },
];

export const order = {
  number: 'P-000123',
  store: 'Tacna',
  steps: [
    { title: 'Pedido recibido', meta: 'Confirmación enviada por correo', state: 'done' },
    { title: 'En preparación', meta: 'La tienda está reuniendo tus productos', state: 'done' },
    { title: 'Listo para retirar', meta: 'Te avisaremos cuando puedas pasar', state: 'current' },
    { title: 'Entregado', meta: 'Pendiente', state: 'pending' },
  ],
};

export const storeViews = [...stores.map((store) => store.id), 'ninguna'];

/** ProductCard props for one catalogue item as seen from one store (or none selected). */
export function cardFor(item, storeId) {
  const store = stores.find((entry) => entry.id === storeId);
  const href = '/tienda/producto/';
  const options = item.options.map((option) => ({ name: `${option.name}, ${option.specs.at(-1)}`, image: option.image, href, current: option.code === item.code }));
  if (!store) return { href, flag: item.flag, options, priceNote: 'Elige tu tienda para ver precio y disponibilidad.' };
  const amount = item.prices[store.id];
  const state = item.stock[store.id];
  return {
    href, flag: item.flag, options,
    price: amount ? { amount, previousAmount: item.previous?.[store.id], discountLabel: item.discount?.[store.id] } : undefined,
    priceNote: amount ? undefined : `Precio no disponible en ${store.name}.`,
    stock: state ? [{ state, text: stockText[state](store.name) }] : [],
  };
}
