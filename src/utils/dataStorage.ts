
import { supabase, formatDateForSupabase, parseSupabaseDate } from '@/integrations/supabase/client';
import { 
  Customer, 
  Expense, 
  DryCleaningItem, 
  LaundryOptions,
  PaymentMethod,
  DailyMetrics,
  WeeklyMetrics,
  MonthlyMetrics
} from './metricsTypes';
import { 
  getTickets, 
  storeTicket,  
  getClientVisitData
} from './ticketStorage';
import {
  getDailyMetricsData,
  getWeeklyMetricsData,
  getMonthlyMetricsData
} from './metricsStorage';
import {
  storeExpenseData,
  getExpenses
} from './expenseStorage';

// Re-export all the functions to maintain backward compatibility
export const storeTicketData = storeTicket;
export const getStoredTickets = getTickets;
export const getClientVisitFrequency = getClientVisitData;
export const storeExpense = storeExpenseData;
export const getStoredExpenses = getExpenses;
export const getDailyMetrics = getDailyMetricsData;
export const getWeeklyMetrics = getWeeklyMetricsData;
export const getMonthlyMetrics = getMonthlyMetricsData;
