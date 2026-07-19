const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatPriceCents(cents: number): string {
  return currencyFormatter.format(cents / 100);
}
