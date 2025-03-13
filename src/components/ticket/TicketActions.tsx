
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus, Printer, Send, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TicketActionsProps {
  onNewTicket: () => void;
  onPrint: () => void;
  onShareWhatsApp?: () => void;
}

const TicketActions: React.FC<TicketActionsProps> = ({ 
  onNewTicket, 
  onPrint,
  onShareWhatsApp 
}) => {
  return (
    <div className="flex flex-col gap-3 w-full max-w-[320px] mt-4">
      <Button 
        onClick={onPrint}
        variant="outline" 
        className="w-full border-laundry-300 text-laundry-700 hover:bg-laundry-50"
      >
        <Printer className="mr-2 h-4 w-4" /> Imprimir Ticket
      </Button>
      
      {onShareWhatsApp && (
        <Button 
          onClick={onShareWhatsApp}
          variant="outline" 
          className="w-full border-green-300 text-green-700 hover:bg-green-50"
        >
          <Send className="mr-2 h-4 w-4" /> Enviar por WhatsApp
        </Button>
      )}
      
      <Button 
        onClick={onNewTicket}
        className="w-full bg-laundry-600 hover:bg-laundry-700"
      >
        <FilePlus className="mr-2 h-4 w-4" /> Nuevo Ticket
      </Button>

      <Link to="/inventory" className="mt-2">
        <Button 
          variant="outline"
          className="w-full border-laundry-200 text-laundry-600 hover:bg-laundry-50"
        >
          <Package className="mr-2 h-4 w-4" /> Gestionar Inventario
        </Button>
      </Link>
    </div>
  );
};

export default TicketActions;
