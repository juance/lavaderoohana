
import React from 'react';

interface TicketCustomerInfoProps {
  name: string;
  phone: string;
}

const TicketCustomerInfo: React.FC<TicketCustomerInfoProps> = ({ name, phone }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Cliente:</span>
        <span className="font-medium text-right">{name}</span>
      </div>
      
      <div className="flex justify-between">
        <span className="text-muted-foreground">Teléfono:</span>
        <span className="font-medium">{phone}</span>
      </div>
      
      <div className="h-[1px] w-full bg-gray-200 my-2"></div>
    </div>
  );
};

export default TicketCustomerInfo;
