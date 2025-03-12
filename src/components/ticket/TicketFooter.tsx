
import React from 'react';
import { Scissors } from 'lucide-react';
import { CardFooter } from '@/components/ui/card';

interface TicketFooterProps {
  ticketNumber: string;
}

const TicketFooter: React.FC<TicketFooterProps> = ({ ticketNumber }) => {
  return (
    <>
      <div className="relative px-6 mb-4">
        <div className="absolute left-0 w-2 h-2 bg-background rounded-full translate-x-[-50%]"></div>
        <div className="h-[1px] w-full border-t border-dashed border-gray-300"></div>
        <div className="absolute right-0 w-2 h-2 bg-background rounded-full translate-x-[50%]"></div>
      </div>
      
      <CardFooter className="p-6 pt-0 pb-4 text-xs text-center text-muted-foreground flex flex-col items-center">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <Scissors className="h-3 w-3" />
          <div className="h-px w-20 bg-gray-300"></div>
          <Scissors className="h-3 w-3" />
        </div>
        <span>¡Gracias por su preferencia!</span>
      </CardFooter>
    </>
  );
};

export default TicketFooter;
