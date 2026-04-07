export const EXCHANGE_RATES = { PLN:1, EUR:4.28, USD:3.91, GBP:4.95 };

export const getPLNAmount = (tx) => {
  return tx.amount * (EXCHANGE_RATES[tx.currency]||1);
};
