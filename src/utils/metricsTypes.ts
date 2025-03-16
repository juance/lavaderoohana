
export type TimeFrame = 'daily' | 'weekly' | 'monthly';

export type PaymentMethod = 'cash' | 'debit' | 'mercadopago' | 'cuentadni';

export interface PaymentBreakdown {
  cash: number;
  debit: number;
  mercadopago: number;
  cuentadni: number;
}

export interface Expense {
  description: string;
  amount: number;
  date: Date;
}

export interface DailyMetrics {
  totalValets: number;
  totalSales: number;
  paymentBreakdown: PaymentBreakdown;
  dryCleaningItems: { name: string; quantity: number; sales: number }[];
}

export interface WeeklyMetrics extends DailyMetrics {
  dailyBreakdown: { date: Date; sales: number; valets: number }[];
}

export interface MonthlyMetrics extends DailyMetrics {
  weeklyBreakdown: { weekNumber: number; sales: number; valets: number }[];
}

export interface LaundryOptions {
  separateByColor: boolean;
  delicateDry: boolean;
  stainRemoval: boolean;
  bleach: boolean;
  noFragrance: boolean;
  noDry: boolean;
}

export interface DryCleaningItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Customer {
  name: string;
  phone: string;
  valetQuantity: number;
  laundryOptions: LaundryOptions;
  paymentMethod: PaymentMethod;
  total: number;
  date: Date;
  dryCleaningItems?: DryCleaningItem[];
  ticketNumber?: string;
}
