
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LaundryHeader from '@/components/LaundryHeader';
import { getStoredTickets } from '@/utils/dataStorage';
import { hasPermission } from '@/utils/authService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import TicketSearch from '@/components/pickup/TicketSearch';
import TicketList from '@/components/pickup/TicketList';
import TicketDetails from '@/components/pickup/TicketDetails';
import { PaymentMethod } from '@/components/pickup/PaymentSelector';

const PickupOrders: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [searchType, setSearchType] = useState<'ticketNumber' | 'name' | 'phone'>('ticketNumber');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user has permission to view orders
  if (!hasPermission('orders.view')) {
    return <Navigate to="/" replace />;
  }
  
  // Load tickets
  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      try {
        const loadedTickets = await getStoredTickets();
        setTickets(loadedTickets);
      } catch (error) {
        console.error('Error loading tickets:', error);
        toast.error('Error al cargar los tickets');
      } finally {
        setLoading(false);
      }
    };
    
    loadTickets();
  }, []);
  
  // Reset payment method when a new ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      setSelectedPaymentMethod(selectedTicket.paymentMethod || null);
    } else {
      setSelectedPaymentMethod(null);
    }
  }, [selectedTicket]);
  
  // Filter tickets based on search
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    switch (searchType) {
      case 'ticketNumber':
        return ticket.ticketNumber?.toLowerCase().includes(searchLower);
      case 'name':
        return ticket.name?.toLowerCase().includes(searchLower);
      case 'phone':
        return ticket.phone?.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });
  
  const handleSearchTypeChange = (type: 'ticketNumber' | 'name' | 'phone') => {
    setSearchType(type);
    setSearchTerm('');
  };
  
  const handlePaymentMethodChange = async (value: PaymentMethod) => {
    if (!selectedTicket) return;
    
    setSelectedPaymentMethod(value);
    
    try {
      // Update the ticket in Supabase
      const { error } = await supabase
        .from('tickets')
        .update({ payment_method: value })
        .eq('ticket_number', selectedTicket.ticketNumber);
      
      if (error) throw error;
      
      // Update the local state
      const updatedTickets = tickets.map(ticket => {
        if (ticket.ticketNumber === selectedTicket.ticketNumber) {
          return { ...ticket, paymentMethod: value };
        }
        return ticket;
      });
      
      setTickets(updatedTickets);
      
      // Update the selectedTicket reference
      const updatedSelectedTicket = updatedTickets.find(
        ticket => ticket.ticketNumber === selectedTicket.ticketNumber
      );
      
      setSelectedTicket(updatedSelectedTicket);
      
      toast.success(`Método de pago actualizado a ${getPaymentMethodName(value)}`);
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error('Error al actualizar el método de pago');
    }
  };
  
  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'debit': return 'Débito FC';
      case 'mercadopago': return 'Mercado Pago FC';
      case 'cuentadni': return 'Cuenta DNI FC';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-12">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-laundry-600 hover:text-laundry-700">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>
          <LaundryHeader />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Pedidos a Retirar</h2>
          
          <TicketSearch 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchType={searchType}
            handleSearchTypeChange={handleSearchTypeChange}
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* List of tickets */}
            <TicketList 
              tickets={filteredTickets}
              selectedTicket={selectedTicket}
              setSelectedTicket={setSelectedTicket}
              loading={loading}
            />
            
            {/* Ticket details and payment method selection */}
            <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto">
              <TicketDetails 
                selectedTicket={selectedTicket}
                selectedPaymentMethod={selectedPaymentMethod}
                handlePaymentMethodChange={handlePaymentMethodChange}
                setSelectedTicket={setSelectedTicket}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupOrders;
