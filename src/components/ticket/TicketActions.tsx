
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Copy } from 'lucide-react';

interface TicketActionsProps {
  onNewTicket: () => void;
  onPrint: () => void;
}

const TicketActions: React.FC<TicketActionsProps> = ({ onNewTicket, onPrint }) => {
  return (
    <div className="flex gap-3 mt-6">
      <Button 
        variant="outline"
        onClick={onNewTicket}
        className="flex items-center gap-2 transition-all hover:border-laundry-300 hover:bg-laundry-50"
      >
        <RefreshCw className="h-4 w-4" />
        Nuevo Ticket
      </Button>
      
      <Button 
        onClick={onPrint}
        className="flex items-center gap-2 bg-laundry-600 hover:bg-laundry-700 transition-all"
      >
        <Copy className="h-4 w-4 mr-1" />
        Imprimir Duplicado
      </Button>
    </div>
  );
};

export default TicketActions;
