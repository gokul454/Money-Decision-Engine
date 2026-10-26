export interface RunwayInput {
  availableBalance: number;
  fixedMonthlyExpenses: number;
  averageMonthlyDiscretionarySpend: number;
  emergencyReserve: number;
}

export interface RunwayResult {
  runwayDays: number;
  runwayMonths: number;
  dailyBurnRate: number;
  monthlyBurnRate: number;
  status: 'HEALTHY' | 'MODERATE' | 'CRITICAL';
  statusText: string;
  reserveOnlyDays: number;
}

export function calculateFinancialRunway(input: RunwayInput): RunwayResult {
  const monthlyBurn = input.fixedMonthlyExpenses + input.averageMonthlyDiscretionarySpend;
  const dailyBurn = Math.max(1, monthlyBurn / 30);

  const runwayDays = Math.round(input.availableBalance / dailyBurn);
  const runwayMonths = Number((input.availableBalance / Math.max(1, monthlyBurn)).toFixed(1));
  const reserveOnlyDays = Math.round(input.emergencyReserve / dailyBurn);

  let status: 'HEALTHY' | 'MODERATE' | 'CRITICAL' = 'HEALTHY';
  let statusText = 'Comfortable runway';

  if (runwayDays < 30) {
    status = 'CRITICAL';
    statusText = 'Less than 1 month buffer';
  } else if (runwayDays < 60) {
    status = 'MODERATE';
    statusText = '1-2 months buffer';
  } else {
    statusText = `${runwayMonths} months buffer`;
  }

  return {
    runwayDays,
    runwayMonths,
    dailyBurnRate: Math.round(dailyBurn),
    monthlyBurnRate: Math.round(monthlyBurn),
    status,
    statusText,
    reserveOnlyDays,
  };
}
