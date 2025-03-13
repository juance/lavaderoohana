
import React from 'react';
import { 
  Banknote, 
  CreditCard, 
  Smartphone, 
  Landmark 
} from 'lucide-react';

type PaymentMethod = 'cash' | 'debit' | 'mercadopago' | 'cuentadni';

interface TicketPaymentInfoProps {
  paymentMethod: PaymentMethod;
  valetQuantity: number;
  total: number;
  formatCurrency: (amount: number) => string;
}

const TicketPaymentInfo: React.FC<TicketPaymentInfoProps> = ({ 
  paymentMethod, 
  valetQuantity, 
  total,
  formatCurrency
}) => {
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return <Banknote className="h-4 w-4 text-green-600" />;
      case 'debit': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'mercadopago': return <Smartphone className="h-4 w-4 text-blue-500" />;
      case 'cuentadni': return <Landmark className="h-4 w-4 text-yellow-600" />;
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
    <div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Cantidad de Valet:</span>
        <span className="font-medium">{valetQuantity}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Método de pago:</span>
        <div className="flex items-center">
          {getPaymentMethodIcon(paymentMethod)}
          <span className="font-medium ml-1">{getPaymentMethodName(paymentMethod)}</span>
        </div>
      </div>
      
      <div className="flex justify-between text-lg">
        <span className="font-semibold">Total:</span>
        <span className="font-bold text-laundry-700">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default TicketPaymentInfo;
