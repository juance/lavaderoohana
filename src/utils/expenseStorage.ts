
import { supabase, formatDateForSupabase, parseSupabaseDate } from '@/integrations/supabase/client';
import { Expense } from './metricsTypes';

// Store expense data
export const storeExpenseData = async (expense: Expense): Promise<void> => {
  try {
    await supabase
      .from('expenses')
      .insert({
        description: expense.description,
        amount: expense.amount,
        date: formatDateForSupabase(expense.date)
      });
  } catch (error) {
    console.error('Error storing expense data:', error);
    // Fallback to localStorage
    const expenses = await getStoredExpensesFromLocalStorage();
    expenses.push({
      ...expense
    });
    localStorage.setItem('laundryExpenses', JSON.stringify(expenses));
  }
};

// Get all stored expenses
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return expenses.map(expense => ({
      description: expense.description,
      amount: parseFloat(expense.amount.toString()),
      date: parseSupabaseDate(expense.date)
    }));
  } catch (error) {
    console.error('Error fetching expenses from Supabase:', error);
    // Fallback to localStorage
    return getStoredExpensesFromLocalStorage();
  }
};

// Helper function to get expenses from localStorage (fallback)
export const getStoredExpensesFromLocalStorage = async (): Promise<Expense[]> => {
  const expensesJson = localStorage.getItem('laundryExpenses');
  if (!expensesJson) return [];
  
  try {
    const expenses = JSON.parse(expensesJson);
    return expenses.map((expense: any) => ({
      ...expense,
      date: expense.date ? parseSupabaseDate(expense.date) : new Date()
    }));
  } catch (error) {
    console.error('Error parsing expenses from localStorage:', error);
    return [];
  }
};
