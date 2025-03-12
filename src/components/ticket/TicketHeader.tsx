
import React from 'react';
import { WashingMachine, CalendarDays } from 'lucide-react';

interface TicketHeaderProps {
  formattedDate: string;
  ticketNumber: string;
  type?: 'client' | 'laundry';
}

const TicketHeader: React.FC<TicketHeaderProps> = ({ 
  formattedDate, 
  ticketNumber, 
  type = 'client' 
}) => {
  return (
    <div className="p-6 pb-0">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <WashingMachine className="h-5 w-5 text-laundry-600 mr-2" />
          <h2 className="text-xl font-bold">Lavandería Ohana</h2>
        </div>
        <div className="text-xs px-2 py-1 bg-laundry-100 text-laundry-700 rounded font-medium">
          {type === 'client' ? 'CLIENTE' : 'LAVANDERÍA'}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <div className="flex items-center">
          <CalendarDays className="h-3.5 w-3.5 mr-1" />
          <span>{formattedDate}</span>
        </div>
        <div>Ticket #{ticketNumber}</div>
      </div>
    </div>
  );
};

export default TicketHeader;
