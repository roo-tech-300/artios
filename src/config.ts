// Store contact details. Change them here and the whole site updates.
export const store = {
  name: 'Artios Fashion House',
  email: 'artioswoman@gmail.com',
  phoneDisplay: '+234 803 040 6062',
  phoneHref: 'tel:+2348030406062',
  // WhatsApp number in international format, digits only (no +, spaces or leading 0).
  whatsapp: '2348030406062',
  address: '17 Shiroro Road, Minna, Niger State',
  bank: { accountName: 'Artios Fashion House', accountNumber: '6578266670', bankName: 'Moniepoint MFB' },
};

export const whatsappLink = (message?: string) =>
  `https://wa.me/${store.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
