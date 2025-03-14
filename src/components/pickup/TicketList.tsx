
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

interface Ticket {
  ticketNumber: string;
  name: string;
  phone: string;
  date: string | Date;
  total: number;
  paymentMethod?: 'cash' | 'debit' | 'mercadopago' | 'cuentadni';
}

interface TicketListProps {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket) => void;
  loading: boolean;
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  selectedTicket,
  setSelectedTicket,
  loading
}) => {
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-laundry-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto">
      {tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((ticket, index) => (
            <div
              key={index}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedTicket === ticket 
                  ? 'border-laundry-500 bg-laundry-50' 
                  : 'border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{ticket.name}</div>
                  <div className="text-sm text-gray-500">{ticket.phone}</div>
                </div>
                <Badge className="bg-laundry-500">
                  #{ticket.ticketNumber || index + 1}
                </Badge>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <div>
                  Fecha: {formatDate(ticket.date)}
                </div>
                <div className="font-semibold text-laundry-700">
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 0
                  }).format(ticket.total)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Search className="h-12 w-12 mb-2 text-gray-300" />
          <p>No se encontraron tickets.</p>
        </div>
      )}
    </div>
  );
};

export default TicketList;
