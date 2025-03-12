
import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { generateTicketNumber } from '@/utils/generateTicketNumber';
import TicketHeader from './ticket/TicketHeader';
import TicketCustomerInfo from './ticket/TicketCustomerInfo';
import TicketLaundryOptions from './ticket/TicketLaundryOptions';
import TicketPaymentInfo from './ticket/TicketPaymentInfo';
import TicketFooter from './ticket/TicketFooter';
import TicketActions from './ticket/TicketActions';
import TicketPrinter from './ticket/TicketPrinter';

interface LaundryOptions {
  separateByColor: boolean;
  delicateDry: boolean;
  stainRemoval: boolean;
  bleach: boolean;
  noFragrance: boolean;
  noDry: boolean;
}

type PaymentMethod = 'cash' | 'debit' | 'mercadopago' | 'cuentadni';

interface TicketProps {
  customer: {
    name: string;
    phone: string;
    valetQuantity: number;
    laundryOptions: LaundryOptions;
    paymentMethod: PaymentMethod;
    total: number;
    date?: Date;
  };
  onNewTicket: () => void;
}

const Ticket: React.FC<TicketProps> = ({ customer, onNewTicket }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const ticketNumber = useRef(generateTicketNumber()).current;
  
  const today = new Date();
  const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const { handlePrint } = TicketPrinter({ 
    customer, 
    ticketNumber, 
    formattedDate 
  });

  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-full max-w-[320px] ticket bg-white rounded-lg overflow-hidden"
        ref={ticketRef}
      >
        <TicketHeader 
          formattedDate={formattedDate} 
          ticketNumber={ticketNumber} 
        />
        
        <div className="px-6">
          <div className="h-[1px] w-full bg-gray-200 my-3 dashed-border"></div>
        </div>
        
        <CardContent className="p-6 pt-3">
          <div className="space-y-3">
            <TicketCustomerInfo 
              name={customer.name} 
              phone={customer.phone} 
            />
            
            <TicketLaundryOptions options={customer.laundryOptions} />
            
            <TicketPaymentInfo 
              paymentMethod={customer.paymentMethod}
              valetQuantity={customer.valetQuantity}
              total={customer.total}
              formatCurrency={formatCurrency}
            />
          </div>
        </CardContent>
        
        <TicketFooter ticketNumber={ticketNumber} />
      </div>
      
      <TicketActions 
        onNewTicket={onNewTicket} 
        onPrint={handlePrint} 
      />
    </div>
  );
};

export default Ticket;
