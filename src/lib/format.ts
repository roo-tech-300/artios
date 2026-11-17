export const formatPrice = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
export const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
