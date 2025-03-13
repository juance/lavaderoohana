
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
}

interface Expense {
  description: string;
  amount: number;
  date: Date;
}

// Store ticket data in localStorage
export const storeTicketData = (ticket: Customer): void => {
  const tickets = getStoredTickets();
  tickets.push({
    ...ticket,
    date: new Date().toISOString() // Store as ISO string for serialization
  });
  localStorage.setItem('laundryTickets', JSON.stringify(tickets));
};

// Get all stored tickets
export const getStoredTickets = (): Customer[] => {
  const ticketsJson = localStorage.getItem('laundryTickets');
  if (!ticketsJson) return [];
  
  const tickets = JSON.parse(ticketsJson);
  return tickets.map((ticket: any) => ({
    ...ticket,
    date: new Date(ticket.date) // Convert back to Date object
  }));
};

// Store expense data
export const storeExpense = (expense: Expense): void => {
  const expenses = getStoredExpenses();
  expenses.push({
    ...expense,
    date: expense.date.toISOString() // Store as ISO string for serialization
  });
  localStorage.setItem('laundryExpenses', JSON.stringify(expenses));
};

// Get all stored expenses
export const getStoredExpenses = (): Expense[] => {
  const expensesJson = localStorage.getItem('laundryExpenses');
  if (!expensesJson) return [];
  
  const expenses = JSON.parse(expensesJson);
  return expenses.map((expense: any) => ({
    ...expense,
    date: new Date(expense.date) // Convert back to Date object
  }));
};

// Get client visit frequency
export const getClientVisitFrequency = (phone: string): { lastVisit: Date | null; visitCount: number } => {
  const tickets = getStoredTickets();
  const clientTickets = tickets.filter(ticket => ticket.phone === phone);
  
  if (clientTickets.length === 0) {
    return { lastVisit: null, visitCount: 0 };
  }
  
  // Sort by date (newest first)
  clientTickets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return {
    lastVisit: new Date(clientTickets[0].date),
    visitCount: clientTickets.length
  };
};

// Get daily metrics
export const getDailyMetrics = (date: Date): { 
  totalValets: number; 
  totalSales: number;
  paymentBreakdown: Record<PaymentMethod, number>;
  dryCleaningItems: { name: string; quantity: number; sales: number }[];
} => {
  const tickets = getStoredTickets();
  
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
    paymentBreakdown[ticket.paymentMethod] += ticket.total;
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
};

// Get weekly metrics (for the week containing the provided date)
export const getWeeklyMetrics = (date: Date): { 
  totalValets: number; 
  totalSales: number;
  paymentBreakdown: Record<PaymentMethod, number>;
  dailyBreakdown: { date: Date; sales: number; valets: number }[];
  dryCleaningItems: { name: string; quantity: number; sales: number }[];
} => {
  const tickets = getStoredTickets();
  
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
    paymentBreakdown[ticket.paymentMethod] += ticket.total;
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
export const getMonthlyMetrics = (date: Date): { 
  totalValets: number; 
  totalSales: number;
  paymentBreakdown: Record<PaymentMethod, number>;
  weeklyBreakdown: { weekNumber: number; sales: number; valets: number }[];
  dryCleaningItems: { name: string; quantity: number; sales: number }[];
} => {
  const tickets = getStoredTickets();
  
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
    paymentBreakdown[ticket.paymentMethod] += ticket.total;
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
  
  return { totalValets, totalSales, paymentBreakdown, weeklyBreakdown, dryCleaningItems };
};
