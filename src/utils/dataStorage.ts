import { supabase, formatDateForSupabase, parseSupabaseDate } from '@/integrations/supabase/client';

interface LaundryOptions {
  separateByColor: boolean;
  delicateDry: boolean;
  stainRemoval: boolean;
  bleach: boolean;
  noFragrance: boolean;
  noDry: boolean;
}

type PaymentMethod = 'cash' | 'debit' | 'mercadopago' | 'cuentadni';

interface DryCleaningItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Customer {
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

interface Expense {
  description: string;
  amount: number;
  date: Date;
}

// Store ticket data in Supabase
export const storeTicketData = async (ticket: Customer): Promise<void> => {
  try {
    // 1. Check if customer exists, if not create a new one
    const { data: existingCustomers, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', ticket.phone)
      .limit(1);
    
    if (customerError) throw customerError;

    let customerId;
    
    if (existingCustomers && existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
    } else {
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          name: ticket.name,
          phone: ticket.phone
        })
        .select('id')
        .single();
      
      if (createError) throw createError;
      customerId = newCustomer.id;
    }
    
    // 2. Create ticket
    const { data: newTicket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        customer_id: customerId,
        ticket_number: ticket.ticketNumber || '',
        valet_quantity: ticket.valetQuantity,
        payment_method: ticket.paymentMethod,
        total: ticket.total,
        date: formatDateForSupabase(ticket.date)
      })
      .select('id')
      .single();
    
    if (ticketError) throw ticketError;
    
    // 3. Store laundry options
    const laundryOptionsToInsert = [];
    for (const [key, value] of Object.entries(ticket.laundryOptions)) {
      if (value) {
        laundryOptionsToInsert.push({
          ticket_id: newTicket.id,
          option_type: key as any
        });
      }
    }
    
    if (laundryOptionsToInsert.length > 0) {
      const { error: optionsError } = await supabase
        .from('ticket_laundry_options')
        .insert(laundryOptionsToInsert);
      
      if (optionsError) throw optionsError;
    }
    
    // 4. Store dry cleaning items if any
    if (ticket.dryCleaningItems && ticket.dryCleaningItems.length > 0) {
      const dryCleaningToInsert = ticket.dryCleaningItems.map(item => ({
        ticket_id: newTicket.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      
      const { error: dryCleaningError } = await supabase
        .from('dry_cleaning_items')
        .insert(dryCleaningToInsert);
      
      if (dryCleaningError) throw dryCleaningError;
    }
    
  } catch (error) {
    console.error('Error storing ticket data:', error);
    // Fallback to localStorage if Supabase fails
    const tickets = await getStoredTicketsFromLocalStorage();
    tickets.push({
      ...ticket,
      date: formatDateForSupabase(ticket.date) // Convert Date to string for storage
    });
    localStorage.setItem('laundryTickets', JSON.stringify(tickets));
  }
};

// Get all stored tickets (with fallback to localStorage)
export const getStoredTickets = async (): Promise<Customer[]> => {
  try {
    // Get all tickets with customer info
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        id,
        ticket_number,
        valet_quantity,
        payment_method,
        total,
        date,
        customers (
          name,
          phone
        ),
        ticket_laundry_options (
          option_type
        ),
        dry_cleaning_items (
          id,
          name,
          price,
          quantity
        )
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    // Transform data to match Customer interface
    return tickets.map(ticket => {
      // Build laundry options
      const laundryOptions: LaundryOptions = {
        separateByColor: false,
        delicateDry: false,
        stainRemoval: false,
        bleach: false,
        noFragrance: false,
        noDry: false
      };
      
      if (ticket.ticket_laundry_options) {
        ticket.ticket_laundry_options.forEach((option: any) => {
          laundryOptions[option.option_type as keyof LaundryOptions] = true;
        });
      }
      
      // Map dry cleaning items
      const dryCleaningItems = ticket.dry_cleaning_items?.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity
      }));
      
      return {
        name: ticket.customers.name,
        phone: ticket.customers.phone,
        ticketNumber: ticket.ticket_number,
        valetQuantity: ticket.valet_quantity,
        paymentMethod: ticket.payment_method as PaymentMethod,
        total: parseFloat(ticket.total.toString()),
        date: parseSupabaseDate(ticket.date),
        laundryOptions,
        dryCleaningItems: dryCleaningItems?.length ? dryCleaningItems : undefined
      };
    });
  } catch (error) {
    console.error('Error fetching tickets from Supabase:', error);
    // Fallback to localStorage
    return getStoredTicketsFromLocalStorage();
  }
};

// Helper function to get tickets from localStorage (fallback)
const getStoredTicketsFromLocalStorage = async (): Promise<Customer[]> => {
  const ticketsJson = localStorage.getItem('laundryTickets');
  if (!ticketsJson) return [];
  
  try {
    const tickets = JSON.parse(ticketsJson);
    return tickets.map((ticket: any) => ({
      ...ticket,
      date: ticket.date ? parseSupabaseDate(ticket.date) : new Date() // Convert string back to Date
    }));
  } catch (error) {
    console.error('Error parsing tickets from localStorage:', error);
    return [];
  }
};

// Store expense data
export const storeExpense = async (expense: Expense): Promise<void> => {
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
      ...expense,
      date: formatDateForSupabase(expense.date)
    });
    localStorage.setItem('laundryExpenses', JSON.stringify(expenses));
  }
};

// Get all stored expenses
export const getStoredExpenses = async (): Promise<Expense[]> => {
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
const getStoredExpensesFromLocalStorage = async (): Promise<Expense[]> => {
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

// Get client visit frequency
export const getClientVisitFrequency = async (phone: string): Promise<{ lastVisit: Date | null; visitCount: number }> => {
  try {
    // Get customer ID
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .limit(1);
    
    if (customerError) throw customerError;
    
    if (!customers || customers.length === 0) {
      return { lastVisit: null, visitCount: 0 };
    }
    
    const customerId = customers[0].id;
    
    // Count tickets for this customer
    const { count, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId);
    
    if (countError) throw countError;
    
    // Get most recent visit
    const { data: recentTickets, error: recentError } = await supabase
      .from('tickets')
      .select('date')
      .eq('customer_id', customerId)
      .order('date', { ascending: false })
      .limit(1);
    
    if (recentError) throw recentError;
    
    return {
      lastVisit: recentTickets && recentTickets.length > 0 ? parseSupabaseDate(recentTickets[0].date) : null,
      visitCount: count || 0
    };
  } catch (error) {
    console.error('Error fetching client visit frequency:', error);
    // Fallback to localStorage
    const tickets = await getStoredTicketsFromLocalStorage();
    const clientTickets = tickets.filter(ticket => ticket.phone === phone);
    
    if (clientTickets.length === 0) {
      return { lastVisit: null, visitCount: 0 };
    }
    
    // Sort by date (newest first)
    clientTickets.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return {
      lastVisit: clientTickets[0].date,
      visitCount: clientTickets.length
    };
  }
};

// Get daily metrics
export const getDailyMetrics = async (date: Date): Promise<{ 
  totalValets: number; 
  totalSales: number;
  paymentBreakdown: Record<PaymentMethod, number>;
  dryCleaningItems: { name: string; quantity: number; sales: number }[];
}> => {
  try {
    // Set up date range for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Use the Supabase function to get metrics
    const { data, error } = await supabase
      .rpc('get_metrics', {
        start_date: formatDateForSupabase(startOfDay),
        end_date: formatDateForSupabase(endOfDay)
      });
    
    if (error) throw error;
    
    const metrics = data[0];
    
    // Get dry cleaning items for this date range
    const { data: ticketsForDay, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        id,
        dry_cleaning_items (
          name,
          price,
          quantity
        )
      `)
      .gte('date', formatDateForSupabase(startOfDay))
      .lte('date', formatDateForSupabase(endOfDay));
    
    if (ticketsError) throw ticketsError;
    
    // Compile dry cleaning items
    const dryCleaningMap = new Map<string, { quantity: number; sales: number }>();
    
    ticketsForDay.forEach(ticket => {
      if (ticket.dry_cleaning_items && ticket.dry_cleaning_items.length > 0) {
        ticket.dry_cleaning_items.forEach((item: any) => {
          const existing = dryCleaningMap.get(item.name);
          if (existing) {
            existing.quantity += item.quantity;
            existing.sales += parseFloat(item.price) * item.quantity;
          } else {
            dryCleaningMap.set(item.name, {
              quantity: item.quantity,
              sales: parseFloat(item.price) * item.quantity
            });
          }
        });
      }
    });
    
    const dryCleaningItems = Array.from(dryCleaningMap.entries()).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      sales: data.sales
    }));
    
    return { 
      totalValets: Number(metrics.total_valets) || 0, 
      totalSales: Number(metrics.total_sales) || 0,
      paymentBreakdown: {
        cash: Number(metrics.cash_payments) || 0,
        debit: Number(metrics.debit_payments) || 0,
        mercadopago: Number(metrics.mercadopago_payments) || 0,
        cuentadni: Number(metrics.cuentadni_payments) || 0
      },
      dryCleaningItems
    };
  } catch (error) {
    console.error('Error fetching daily metrics from Supabase:', error);
    // Fallback to original implementation
    const tickets = await getStoredTickets();
    
    // Filter tickets for the specific date
    const dailyTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.date);
      return ticketDate.getDate() === date.getDate() && 
             ticketDate.getMonth() === date.getMonth() && 
             ticketDate.getFullYear() === date.getFullYear();
    });
    
    // Calculate metrics
    const totalValets = dailyTickets.reduce((sum, ticket) => sum + ticket.valetQuantity, 0);
    const totalSales = dailyTickets.reduce((sum, ticket) => sum + ticket.total, 0);
    
    // Calculate payment breakdown
    const paymentBreakdown: Record<PaymentMethod, number> = {
      cash: 0,
      debit: 0,
      mercadopago: 0,
      cuentadni: 0
    };
    
    dailyTickets.forEach(ticket => {
      if (ticket.paymentMethod) {
        paymentBreakdown[ticket.paymentMethod] += ticket.total;
      }
    });
    
    // Compile dry cleaning items
    const dryCleaningMap = new Map<string, { quantity: number; sales: number }>();
    
    dailyTickets.forEach(ticket => {
      if (ticket.dryCleaningItems && ticket.dryCleaningItems.length > 0) {
        ticket.dryCleaningItems.forEach(item => {
          const existing = dryCleaningMap.get(item.name);
          if (existing) {
            existing.quantity += item.quantity;
            existing.sales += item.price * item.quantity;
          } else {
            dryCleaningMap.set(item.name, {
              quantity: item.quantity,
              sales: item.price * item.quantity
            });
          }
        });
      }
    });
    
    const dryCleaningItems = Array.from(dryCleaningMap.entries()).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      sales: data.sales
    }));
    
    return { totalValets, totalSales, paymentBreakdown, dryCleaningItems };
  }
};

// Get weekly metrics (for the week containing the provided date)
export const getWeeklyMetrics = async (date: Date): Promise<{ 
  totalValets: number; 
  totalSales: number;
  paymentBreakdown: Record<PaymentMethod, number>;
  dailyBreakdown: { date: Date; sales: number; valets: number }[];
  dryCleaningItems: { name: string; quantity: number; sales: number }[];
}> => {
  try {
    // Get the start and end of the week
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Get metrics
    const { data: metricsData, error: metricsError } = await supabase
      .rpc('get_metrics', {
        start_date: formatDateForSupabase(startOfWeek),
        end_date: formatDateForSupabase(endOfWeek)
      });
    
    if (metricsError) throw metricsError;
    
    const metrics = metricsData[0];
    
    // Get all tickets for the week
    const { data: weekTickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        id,
        date,
        total,
        valet_quantity,
        dry_cleaning_items (
          name,
          price,
          quantity
        )
      `)
      .gte('date', formatDateForSupabase(startOfWeek))
      .lte('date', formatDateForSupabase(endOfWeek))
      .order('date', { ascending: true });
    
    if (ticketsError) throw ticketsError;
    
    // Calculate daily breakdown
    const dailyMap = new Map<string, { date: Date; sales: number; valets: number }>();
    
    // Initialize all days of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyMap.set(dateKey, {
        date: new Date(currentDate),
        sales: 0,
        valets: 0
      });
    }
    
    // Fill in data from tickets
    weekTickets.forEach(ticket => {
      const ticketDate = parseSupabaseDate(ticket.date);
      const dateKey = ticketDate.toISOString().split('T')[0];
      
      const dayData = dailyMap.get(dateKey);
      if (dayData) {
        dayData.sales += parseFloat(ticket.total.toString());
        dayData.valets += ticket.valet_quantity;
      }
    });
    
    // Compile dry cleaning items
    const dryCleaningMap = new Map<string, { quantity: number; sales: number }>();
    
    weekTickets.forEach(ticket => {
      if (ticket.dry_cleaning_items && ticket.dry_cleaning_items.length > 0) {
        ticket.dry_cleaning_items.forEach((item: any) => {
          const existing = dryCleaningMap.get(item.name);
          if (existing) {
            existing.quantity += item.quantity;
            existing.sales += parseFloat(item.price.toString()) * item.quantity;
          } else {
            dryCleaningMap.set(item.name, {
              quantity: item.quantity,
              sales: parseFloat(item.price.toString()) * item.quantity
            });
          }
        });
      }
    });
    
    const dryCleaningItems = Array.from(dryCleaningMap.entries()).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      sales: data.sales
    }));
    
    return { 
      totalValets: Number(metrics.total_valets) || 0, 
      totalSales: Number(metrics.total_sales) || 0,
      paymentBreakdown: {
        cash: Number(metrics.cash_payments) || 0,
        debit: Number(metrics.debit_payments) || 0,
        mercadopago: Number(metrics.mercadopago_payments) || 0,
        cuentadni: Number(metrics.cuentadni_payments) || 0
      },
      dailyBreakdown: Array.from(dailyMap.values()),
      dryCleaningItems
    };
  } catch (error) {
    console.error('Error fetching weekly metrics from Supabase:', error);
    // Fallback to localStorage
    const tickets = await getStoredTickets();
    
    // Get the start and end of the week
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Filter tickets for the week
    const weeklyTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.date);
      return ticketDate >= startOfWeek && ticketDate <= endOfWeek;
    });
    
    // Calculate metrics
    const totalValets = weeklyTickets.reduce((sum, ticket) => sum + ticket.valetQuantity, 0);
    const totalSales = weeklyTickets.reduce((sum, ticket) => sum + ticket.total, 0);
    
    // Calculate payment breakdown
    const paymentBreakdown: Record<PaymentMethod, number> = {
      cash: 0,
      debit: 0,
      mercadopago: 0,
      cuentadni: 0
    };
    
    weeklyTickets.forEach(ticket => {
      if (ticket.paymentMethod) {
        paymentBreakdown[ticket.paymentMethod] += ticket.total;
      }
    });
    
    // Calculate daily breakdown
    const dailyBreakdown: { date: Date; sales: number; valets: number }[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      const dayTickets = weeklyTickets.filter(ticket => {
        const ticketDate = new Date(ticket.date);
        return ticketDate.getDate() === currentDate.getDate() && 
               ticketDate.getMonth() === currentDate.getMonth() && 
               ticketDate.getFullYear() === currentDate.getFullYear();
      });
      
      const daySales = dayTickets.reduce((sum, ticket) => sum + ticket.total, 0);
      const dayValets = dayTickets.reduce((sum, ticket) => sum + ticket.valetQuantity, 0);
      
      dailyBreakdown.push({
        date: currentDate,
        sales: daySales,
        valets: dayValets
      });
    }
    
    // Compile dry cleaning items
    const dryCleaningMap = new Map<string, { quantity: number; sales: number }>();
    
    weeklyTickets.forEach(ticket => {
      if (ticket.dryCleaningItems && ticket.dryCleaningItems.length > 0) {
        ticket.dryCleaningItems.forEach(item => {
          const existing = dryCleaningMap.get(item.name);
          if (existing) {
            existing.quantity += item.quantity;
            existing.sales += item.price * item.quantity;
          } else {
            dryCleaningMap.set(item.name, {
              quantity: item.quantity,
              sales: item.price * item.quantity
            });
          }
        });
      }
    });
    
    const dryCleaningItems = Array.from(dryCleaningMap.entries()).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      sales: data.sales
    }));
    
    return { totalValets, totalSales, paymentBreakdown, dailyBreakdown, dryCleaningItems };
  }
};

// Get monthly metrics
export const getMonthlyMetrics = async (date: Date): Promise<{ 
  totalValets: number; 
  totalSales: number;
  paymentBreakdown: Record<PaymentMethod, number>;
  weeklyBreakdown: { weekNumber: number; sales: number; valets: number }[];
  dryCleaningItems: { name: string; quantity: number; sales: number }[];
}> => {
  try {
    // Get the start and end of the month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Get metrics
    const { data: metricsData, error: metricsError } = await supabase
      .rpc('get_metrics', {
        start_date: formatDateForSupabase(startOfMonth),
        end_date: formatDateForSupabase(endOfMonth)
      });
    
    if (metricsError) throw metricsError;
    
    const metrics = metricsData[0];
    
    // Get all tickets for the month
    const { data: monthTickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        id,
        date,
        total,
        valet_quantity,
        dry_cleaning_items (
          name,
          price,
          quantity
        )
      `)
      .gte('date', formatDateForSupabase(startOfMonth))
      .lte('date', formatDateForSupabase(endOfMonth));
    
    if (ticketsError) throw ticketsError;
    
    // Calculate weekly breakdown
    const weeklyBreakdown: { weekNumber: number; sales: number; valets: number }[] = [];
    
    // Get number of weeks in the month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const totalWeeks = Math.ceil((firstDay + totalDays) / 7);
    
    for (let weekNum = 0; weekNum < totalWeeks; weekNum++) {
      // Calculate start and end dates for this week
      const weekStart = new Date(startOfMonth);
      weekStart.setDate(1 + (weekNum * 7) - firstDay);
      if (weekStart < startOfMonth) {
        weekStart.setTime(startOfMonth.getTime());
      }
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      if (weekEnd > endOfMonth) {
        weekEnd.setTime(endOfMonth.getTime());
      }
      
      // Filter tickets for this week
      const weekTickets = monthTickets.filter((ticket: any) => {
        const ticketDate = parseSupabaseDate(ticket.date);
        return ticketDate >= weekStart && ticketDate <= weekEnd;
      });
      
      const weekSales = weekTickets.reduce((sum, ticket: any) => sum + parseFloat(ticket.total.toString()), 0);
      const weekValets = weekTickets.reduce((sum, ticket: any) => sum + ticket.valet_quantity, 0);
      
      weeklyBreakdown.push({
        weekNumber: weekNum + 1,
        sales: weekSales,
        valets: weekValets
      });
    }
    
    // Compile dry cleaning items
    const dryCleaningMap = new Map<string, { quantity: number; sales: number }>();
    
    monthTickets.forEach((ticket: any) => {
      if (ticket.dry_cleaning_items && ticket.dry_cleaning_items.length > 0) {
        ticket.dry_cleaning_items.forEach((item: any) => {
          const existing = dryCleaningMap.get(item.name);
          if (existing) {
            existing.quantity += item.quantity;
            existing.sales += parseFloat(item.price.toString()) * item.quantity;
          } else {
            dryCleaningMap.set(item.name, {
              quantity: item.quantity,
              sales: parseFloat(item.price.toString()) * item.quantity
            });
          }
        });
      }
    });
    
    const dryCleaningItems = Array.from(dryCleaningMap.entries()).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      sales: data.sales
    }));
    
    return { 
      totalValets: Number(metrics.total_valets) || 0, 
      totalSales: Number(metrics.total_sales) || 0,
      paymentBreakdown: {
        cash: Number(metrics.cash_payments) || 0,
        debit: Number(metrics.debit_payments) || 0,
        mercadopago: Number(metrics.mercadopago_payments) || 0,
        cuentadni: Number(metrics.cuentadni_payments) || 0
      },
      weeklyBreakdown,
      dryCleaningItems
    };
  } catch (error) {
    console.error('Error fetching monthly metrics from Supabase:', error);
    // Fallback to localStorage
    const tickets = await getStoredTickets();
    
    // Get the start and end of the month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Filter tickets for the month
    const monthlyTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.date);
      return ticketDate >= startOfMonth && ticketDate <= endOfMonth;
    });
    
    // Calculate metrics
    const totalValets = monthlyTickets.reduce((sum, ticket) => sum + ticket.valetQuantity, 0);
    const totalSales = monthlyTickets.reduce((sum, ticket) => sum + ticket.total, 0);
    
    // Calculate payment breakdown
    const paymentBreakdown: Record<PaymentMethod, number> = {
      cash: 0,
      debit: 0,
      mercadopago: 0,
      cuentadni: 0
    };
    
    monthlyTickets.forEach(ticket => {
      if (ticket.paymentMethod) {
        paymentBreakdown[ticket.paymentMethod] += ticket.total;
      }
    });
    
    // Calculate weekly breakdown (4-5 weeks per month)
    const weeklyBreakdown: { weekNumber: number; sales: number; valets: number }[] = [];
    
    // Get number of weeks in the month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const totalWeeks = Math.ceil((firstDay + totalDays) / 7);
    
    for (let weekNum = 0; weekNum < totalWeeks; weekNum++) {
      // Calculate start and end dates for this week
      const weekStart = new Date(startOfMonth);
      weekStart.setDate(1 + (weekNum * 7) - firstDay);
      if (weekStart < startOfMonth) {
        weekStart.setTime(startOfMonth.getTime());
      }
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      if (weekEnd > endOfMonth) {
        weekEnd.setTime(endOfMonth.getTime());
      }
      
      // Filter tickets for this week
      const weekTickets = monthlyTickets.filter(ticket => {
        const ticketDate = new Date(ticket.date);
        return ticketDate >= weekStart && ticketDate <= weekEnd;
      });
      
      const weekSales = weekTickets.reduce((sum, ticket) => sum + ticket.total, 0);
      const weekValets = weekTickets.reduce((sum, ticket) => sum + ticket.valetQuantity, 0);
      
      weeklyBreakdown.push({
        weekNumber: weekNum + 1,
        sales: weekSales,
        valets: weekValets
      });
    }
    
    // Compile dry cleaning items
    const dryCleaningMap = new Map<string, { quantity: number; sales: number }>();
    
    monthlyTickets.forEach(ticket => {
      if (ticket.dryCleaningItems && ticket.dryCleaningItems.length > 0) {
        ticket.dryCleaningItems.forEach(item => {
          const existing = dryCleaningMap.get(item.name);
          if (existing) {
            existing.quantity += item.quantity;
            existing.sales += item.price * item.quantity;
          } else {
            dryCleaningMap.set(item.name, {
              quantity: item.quantity,
              sales: item.price * item.quantity
            });
          }
        });
      }
    });
    
    const dryCleaningItems = Array.from(dryCleaningMap.entries()).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      sales: data.sales
    }));
    
    return { totalValets, totalSales, paymentBreakdown, weeklyBreakdown, dryCleaning
};