// Demonstration fixtures, not a live catalogue or current commercial offers.
// Fields follow the shared product model in recipes/product.mjs: NAME, Description, specs, code.
export const products = [
  { code: 'CE26061441', name: 'MENE', description: 'Taza de vidrio resistente al calor', specs: ['vidrio borosilicato', '250ml'], image: '/assets/product-mene.png', amount: '6.50' },
  { code: 'CE26061440', name: 'NOME', description: 'Taza de vidrio resistente al calor', specs: ['vidrio borosilicato', '350ml'], image: '/assets/product-nome.png', amount: '8.00' },
  { code: 'CE26061608', name: 'TILEN', description: 'Tapete de ducha antideslizante', specs: ['PVC', '64 × 35cm'], image: '/assets/product-tilen.png', amount: '6.00', previousAmount: '7.50', discountLabel: '20%', badge: 'Ejemplo de oferta' },
  { code: 'CE26061607', name: 'TALEN', description: 'Tapete de ducha antideslizante', specs: ['PVC', '68 × 37cm'], image: '/assets/product-talen.png', amount: '8.50' },
];
