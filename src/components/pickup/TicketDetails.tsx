
import React from 'react';
import Ticket from '@/components/Ticket';
import PaymentSelector from './PaymentSelector';
import { FileText } from 'lucide-react';
import { PaymentMethod } from './PaymentSelector';

interface TicketDetailsProps {
  selectedTicket: any | null;
  selectedPaymentMethod: PaymentMethod | null;
  handlePaymentMethodChange: (value: PaymentMethod) => void;
  setSelectedTicket: (ticket: any | null) => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({
  selectedTicket,
  selectedPaymentMethod,
  handlePaymentMethodChange,
  setSelectedTicket
}) => {
  if (!selectedTicket) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <FileText className="h-12 w-12 mb-2 text-gray-300" />
        <p>Seleccione un ticket para ver los detalles</p>
      </div>
    );
  }

  return (
    <div>
      <PaymentSelector 
        selectedPaymentMethod={selectedPaymentMethod}
        handlePaymentMethodChange={handlePaymentMethodChange}
      />
      
      <div className="mt-3">
        <Ticket 
          customer={selectedTicket}
          onNewTicket={() => setSelectedTicket(null)}
        />
      </div>
    </div>
  );
};

export default TicketDetails;
