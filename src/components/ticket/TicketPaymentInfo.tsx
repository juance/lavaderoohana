
import React from 'react';

interface TicketPaymentInfoProps {
  valetQuantity: number;
  total: number;
  formatCurrency: (amount: number) => string;
}

const TicketPaymentInfo: React.FC<TicketPaymentInfoProps> = ({ 
  valetQuantity, 
  total,
  formatCurrency
}) => {
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Cantidad de Valet:</span>
        <span className="font-medium">{valetQuantity}</span>
      </div>
      
      <div className="flex justify-between text-lg">
        <span className="font-semibold">Total:</span>
        <span className="font-bold text-laundry-700">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export default TicketPaymentInfo;
