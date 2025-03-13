
import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { generateTicketNumber } from '@/utils/generateTicketNumber';
import TicketHeader from './ticket/TicketHeader';
import TicketCustomerInfo from './ticket/TicketCustomerInfo';
import TicketLaundryOptions from './ticket/TicketLaundryOptions';
import TicketPaymentInfo from './ticket/TicketPaymentInfo';
import TicketFooter from './ticket/TicketFooter';
import TicketActions from './ticket/TicketActions';
import useTicketPrinter from './ticket/TicketPrinter';
import { shareTicketViaWhatsApp } from '@/utils/whatsAppSharing';

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
  name: string;
  price: number;
  quantity: number;
}

interface TicketProps {
  customer: {
    name: string;
    phone: string;
    valetQuantity: number;
    laundryOptions: LaundryOptions;
    paymentMethod: PaymentMethod;
    total: number;
    date?: Date;
    dryCleaningItems?: DryCleaningItem[];
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

  const { handlePrint } = useTicketPrinter({ 
    customer, 
    ticketNumber, 
    formattedDate 
  });
  
  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'debit': return 'Débito';
      case 'mercadopago': return 'Mercado Pago';
      case 'cuentadni': return 'Cuenta DNI';
      default: return method;
    }
  };
  
  const shareViaWhatsApp = () => {
    // Generate list of items for the ticket
    const items: string[] = [];
    
    if (customer.valetQuantity > 0) {
      items.push(`${customer.valetQuantity} Valet: ${formatCurrency(customer.valetQuantity * 5000)}`);
    }
    
    // Add dry cleaning items if present
    if (customer.dryCleaningItems && customer.dryCleaningItems.length > 0) {
      customer.dryCleaningItems.forEach(item => {
        items.push(`${item.quantity} ${item.name}: ${formatCurrency(item.price * item.quantity)}`);
      });
    }
    
    // Add selected laundry options
    const options: string[] = [];
    if (customer.laundryOptions.separateByColor) options.push("Separar por color");
    if (customer.laundryOptions.delicateDry) options.push("Secar en delicado");
    if (customer.laundryOptions.stainRemoval) options.push("Desmanchar");
    if (customer.laundryOptions.bleach) options.push("Blanquear");
    if (customer.laundryOptions.noFragrance) options.push("Sin perfume");
    if (customer.laundryOptions.noDry) options.push("No secar");
    
    if (options.length > 0) {
      items.push(`Opciones: ${options.join(", ")}`);
    }
    
    // First, send to the customer
    if (customer.phone) {
      shareTicketViaWhatsApp(customer.phone, {
        customerName: customer.name,
        customerPhone: customer.phone,
        ticketNumber,
        formattedDate,
        items,
        total: customer.total,
        paymentMethod: getPaymentMethodName(customer.paymentMethod)
      });
    }
    
    // Then, send to the laundry's phone number
    setTimeout(() => {
      shareTicketViaWhatsApp("5491136424871", {
        customerName: customer.name,
        customerPhone: customer.phone,
        ticketNumber,
        formattedDate,
        items,
        total: customer.total,
        paymentMethod: getPaymentMethodName(customer.paymentMethod)
      });
    }, 1000); // Wait 1 second between messages to avoid issues
  };

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
            
            {customer.dryCleaningItems && customer.dryCleaningItems.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Servicios de Tintorería:</h3>
                <div className="text-sm space-y-1">
                  {customer.dryCleaningItems.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.quantity} x {item.name}</span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
        onShareWhatsApp={shareViaWhatsApp}
      />
    </div>
  );
};

export default Ticket;
