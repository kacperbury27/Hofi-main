import { useState, useMemo } from 'react';
import { filterByRange, periodLabel } from '../utils/period';

export function usePeriodFilter(txs, defaultPeriod = "this_month") {
  const [period, setPeriod] = useState(defaultPeriod);

  const filtered = useMemo(() => {
    return filterByRange(txs, period);
  }, [txs, period]);

  return {
    period,
    setPeriod,
    filtered,
    label: periodLabel(period),
  };
}
