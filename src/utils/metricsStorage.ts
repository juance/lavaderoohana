
import { supabase, formatDateForSupabase, parseSupabaseDate } from '@/integrations/supabase/client';
import { DailyMetrics, WeeklyMetrics, MonthlyMetrics, PaymentMethod } from './metricsTypes';
import { getTickets } from './ticketStorage';

// Utility function to create a payment breakdown record with zeros
const createEmptyPaymentBreakdown = () => ({
  cash: 0,
  debit: 0,
  mercadopago: 0,
  cuentadni: 0
});

// Utility function to extract payment breakdown from metrics data
const extractPaymentBreakdown = (metrics: any) => ({
  cash: Number(metrics.cash_payments) || 0,
  debit: Number(metrics.debit_payments) || 0,
  mercadopago: Number(metrics.mercadopago_payments) || 0,
  cuentadni: Number(metrics.cuentadni_payments) || 0
});

// Utility function to compile dry cleaning items
const compileDryCleaningItems = (tickets: any[]) => {
  const dryCleaningMap = new Map<string, { quantity: number; sales: number }>();
  
  tickets.forEach(ticket => {
    if (ticket.dry_cleaning_items && ticket.dry_cleaning_items.length > 0) {
      ticket.dry_cleaning_items.forEach((item: any) => {
        const existing = dryCleaningMap.get(item.name);
        if (existing) {
          existing.quantity += item.quantity;
          existing.sales += parseFloat(typeof item.price === 'string' ? item.price : item.price.toString()) * item.quantity;
        } else {
          dryCleaningMap.set(item.name, {
            quantity: item.quantity,
            sales: parseFloat(typeof item.price === 'string' ? item.price : item.price.toString()) * item.quantity
          });
        }
      });
    }
  });
  
  return Array.from(dryCleaningMap.entries()).map(([name, data]) => ({
    name,
    quantity: data.quantity,
    sales: data.sales
  }));
};

// Get daily metrics
export const getDailyMetricsData = async (date: Date): Promise<DailyMetrics> => {
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
    
    const dryCleaningItems = compileDryCleaningItems(ticketsForDay);
    
    return { 
      totalValets: Number(metrics.total_valets) || 0, 
      totalSales: Number(metrics.total_sales) || 0,
      paymentBreakdown: extractPaymentBreakdown(metrics),
      dryCleaningItems
    };
  } catch (error) {
    console.error('Error fetching daily metrics from Supabase:', error);
    // Fallback to localStorage implementation
    return getDailyMetricsFromLocalStorage(date);
  }
};

// Fallback implementation for daily metrics using localStorage
const getDailyMetricsFromLocalStorage = async (date: Date): Promise<DailyMetrics> => {
  const tickets = await getTickets();
  
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
  const paymentBreakdown = createEmptyPaymentBreakdown();
  
  dailyTickets.forEach(ticket => {
    if (ticket.paymentMethod) {
      paymentBreakdown[ticket.paymentMethod] += ticket.total;
    }
  });
  
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
};

// Get weekly metrics (for the week containing the provided date)
export const getWeeklyMetricsData = async (date: Date): Promise<WeeklyMetrics> => {
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
    
    const dryCleaningItems = compileDryCleaningItems(weekTickets);
    
    return { 
      totalValets: Number(metrics.total_valets) || 0, 
      totalSales: Number(metrics.total_sales) || 0,
      paymentBreakdown: extractPaymentBreakdown(metrics),
      dailyBreakdown: Array.from(dailyMap.values()),
      dryCleaningItems
    };
  } catch (error) {
    console.error('Error fetching weekly metrics from Supabase:', error);
    // Fallback to localStorage
    return getWeeklyMetricsFromLocalStorage(date);
  }
};

// Fallback implementation for weekly metrics using localStorage
const getWeeklyMetricsFromLocalStorage = async (date: Date): Promise<WeeklyMetrics> => {
  const tickets = await getTickets();
  
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
  const paymentBreakdown = createEmptyPaymentBreakdown();
  
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
};

// Get monthly metrics
export const getMonthlyMetricsData = async (date: Date): Promise<MonthlyMetrics> => {
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
    
    const dryCleaningItems = compileDryCleaningItems(monthTickets);
    
    return { 
      totalValets: Number(metrics.total_valets) || 0, 
      totalSales: Number(metrics.total_sales) || 0,
      paymentBreakdown: extractPaymentBreakdown(metrics),
      weeklyBreakdown,
      dryCleaningItems
    };
  } catch (error) {
    console.error('Error fetching monthly metrics from Supabase:', error);
    // Fallback to localStorage
    return getMonthlyMetricsFromLocalStorage(date);
  }
};

// Fallback implementation for monthly metrics using localStorage
const getMonthlyMetricsFromLocalStorage = async (date: Date): Promise<MonthlyMetrics> => {
  const tickets = await getTickets();
  
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
  const paymentBreakdown = createEmptyPaymentBreakdown();
  
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
  
  return { 
    totalValets, 
    totalSales, 
    paymentBreakdown, 
    weeklyBreakdown, 
    dryCleaningItems 
  };
};
