
import { supabase, formatDateForSupabase, parseSupabaseDate } from '@/integrations/supabase/client';
import { Customer, DryCleaningItem, LaundryOptions, PaymentMethod } from './metricsTypes';

// Store ticket data in Supabase
export const storeTicket = async (ticket: Customer): Promise<void> => {
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
      ...ticket
    });
    localStorage.setItem('laundryTickets', JSON.stringify(tickets));
  }
};

// Get all stored tickets (with fallback to localStorage)
export const getTickets = async (): Promise<Customer[]> => {
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
export const getStoredTicketsFromLocalStorage = async (): Promise<Customer[]> => {
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

// Get client visit frequency
export const getClientVisitData = async (phone: string): Promise<{ lastVisit: Date | null; visitCount: number }> => {
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
