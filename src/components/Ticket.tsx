
import React, { useRef } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Printer, 
  RefreshCw, 
  WashingMachine,
  CalendarDays,
  Scissors
} from 'lucide-react';
import { generateTicketNumber } from '@/utils/generateTicketNumber';
import { toast } from 'sonner';

interface TicketProps {
  customer: {
    name: string;
    phone: string;
    valetQuantity: number;
    total: number;
  };
  onNewTicket: () => void;
}

const Ticket: React.FC<TicketProps> = ({ customer, onNewTicket }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const ticketNumber = useRef(generateTicketNumber()).current;
  
  const today = new Date();
  const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  
  const handlePrint = () => {
    try {
      if (ticketRef.current) {
        const printWindow = window.open('', '', 'height=600,width=800');
        
        if (printWindow) {
          printWindow.document.write('<html><head><title>Ticket de Lavandería</title>');
          printWindow.document.write('<style>');
          printWindow.document.write(`
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; }
            .ticket-container { max-width: 300px; margin: 0 auto; }
            .ticket-header { text-align: center; margin-bottom: 15px; }
            .ticket-logo { font-size: 24px; font-weight: bold; }
            .ticket-content { border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
            .ticket-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .ticket-label { color: #666; }
            .ticket-value { font-weight: 500; }
            .ticket-total { font-size: 18px; font-weight: bold; margin-top: 10px; }
            .ticket-footer { text-align: center; font-size: 12px; color: #999; margin-top: 15px; }
            .dashed-line { border-top: 1px dashed #ccc; margin: 15px 0; }
          `);
          printWindow.document.write('</style></head><body>');
          
          printWindow.document.write('<div class="ticket-container">');
          printWindow.document.write('<div class="ticket-header">');
          printWindow.document.write('<div class="ticket-logo">Lavandería Express</div>');
          printWindow.document.write(`<div>Fecha: ${formattedDate}</div>`);
          printWindow.document.write('</div>');
          
          printWindow.document.write('<div class="ticket-content">');
          printWindow.document.write('<div class="ticket-row">');
          printWindow.document.write('<span class="ticket-label">Cliente:</span>');
          printWindow.document.write(`<span class="ticket-value">${customer.name}</span>`);
          printWindow.document.write('</div>');
          
          printWindow.document.write('<div class="ticket-row">');
          printWindow.document.write('<span class="ticket-label">Teléfono:</span>');
          printWindow.document.write(`<span class="ticket-value">${customer.phone}</span>`);
          printWindow.document.write('</div>');
          
          printWindow.document.write('<div class="dashed-line"></div>');
          
          printWindow.document.write('<div class="ticket-row">');
          printWindow.document.write('<span class="ticket-label">Cantidad de Valet:</span>');
          printWindow.document.write(`<span class="ticket-value">${customer.valetQuantity}</span>`);
          printWindow.document.write('</div>');
          
          printWindow.document.write('<div class="ticket-row ticket-total">');
          printWindow.document.write('<span>Total:</span>');
          printWindow.document.write(`<span>$${customer.total.toLocaleString()}</span>`);
          printWindow.document.write('</div>');
          
          printWindow.document.write('</div>');
          
          printWindow.document.write('<div class="ticket-footer">');
          printWindow.document.write(`<div>Ticket #${ticketNumber}</div>`);
          printWindow.document.write('<div>¡Gracias por su preferencia!</div>');
          printWindow.document.write('</div>');
          
          printWindow.document.write('</div>');
          
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          printWindow.focus();
          
          // Timer to allow CSS to load
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 250);
          
          toast.success('Imprimiendo ticket...');
        } else {
          toast.error('No se pudo abrir la ventana de impresión');
        }
      }
    } catch (error) {
      console.error('Error al imprimir:', error);
      toast.error('Ocurrió un error al intentar imprimir');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-full max-w-[320px] ticket bg-white rounded-lg overflow-hidden"
        ref={ticketRef}
      >
        <div className="p-6 pb-0">
          <div className="flex justify-center items-center mb-3">
            <WashingMachine className="h-5 w-5 text-laundry-600 mr-2" />
            <h2 className="text-xl font-bold text-center">Lavandería Express</h2>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <span>{formattedDate}</span>
            </div>
            <div>Ticket #{ticketNumber}</div>
          </div>
        </div>
        
        <div className="px-6">
          <div className="h-[1px] w-full bg-gray-200 my-3 dashed-border"></div>
        </div>
        
        <CardContent className="p-6 pt-3">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium text-right">{customer.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teléfono:</span>
              <span className="font-medium">{customer.phone}</span>
            </div>
            
            <div className="h-[1px] w-full bg-gray-200 my-2"></div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cantidad de Valet:</span>
              <span className="font-medium">{customer.valetQuantity}</span>
            </div>
            
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-laundry-700">{formatCurrency(customer.total)}</span>
            </div>
          </div>
        </CardContent>
        
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
      </div>
      
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
          onClick={handlePrint}
          className="flex items-center gap-2 bg-laundry-600 hover:bg-laundry-700 transition-all"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>
    </div>
  );
};

export default Ticket;
