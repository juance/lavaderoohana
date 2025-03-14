
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
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
      case 'debit': return 'Débito FC';
      case 'mercadopago': return 'Mercado Pago FC';
      case 'cuentadni': return 'Cuenta DNI FC';
      default: return method;
    }
  };

  const createPdf = () => {
    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200]  // Receipt size
      });
      
      // Set font
      doc.setFont('helvetica');
      
      // Add title
      doc.setFontSize(16);
      doc.text('Lavandería Ohana', 40, 10, { align: 'center' });
      
      // Add ticket number and date
      doc.setFontSize(10);
      doc.text(`Ticket #${ticketNumber}`, 40, 15, { align: 'center' });
      doc.text(`Fecha: ${formattedDate}`, 40, 20, { align: 'center' });
      
      // Add separator line
      doc.setDrawColor(200);
      doc.line(10, 22, 70, 22);
      
      // Customer info
      doc.setFontSize(10);
      doc.text(`Cliente: ${customer.name}`, 10, 27);
      doc.text(`Teléfono: ${customer.phone}`, 10, 32);
      
      // Add separator line
      doc.line(10, 34, 70, 34);
      
      // Laundry options
      doc.setFontSize(10);
      doc.text('Opciones de lavado:', 10, 39);
      
      const options = [];
      if (customer.laundryOptions.separateByColor) options.push("Separar por color");
      if (customer.laundryOptions.delicateDry) options.push("Secar en delicado");
      if (customer.laundryOptions.stainRemoval) options.push("Desmanchar");
      if (customer.laundryOptions.bleach) options.push("Blanquear");
      if (customer.laundryOptions.noFragrance) options.push("Sin perfume");
      if (customer.laundryOptions.noDry) options.push("No secar");
      
      let yPos = 44;
      options.forEach(option => {
        doc.text(`- ${option}`, 12, yPos);
        yPos += 4;
      });
      
      // Add separator line
      doc.line(10, yPos + 1, 70, yPos + 1);
      yPos += 6;
      
      // Valet quantity and payment method
      doc.text(`Cantidad de Valet: ${customer.valetQuantity}`, 10, yPos);
      
      // Dry cleaning items if any
      if (customer.dryCleaningItems && customer.dryCleaningItems.length > 0) {
        yPos += 5;
        doc.text('Servicios de Tintorería:', 10, yPos);
        yPos += 5;
        
        customer.dryCleaningItems.forEach(item => {
          doc.text(`${item.quantity} x ${item.name}`, 12, yPos);
          doc.text(`${formatCurrency(item.price * item.quantity)}`, 60, yPos, { align: 'right' });
          yPos += 4;
        });
      }
      
      yPos += 5;
      doc.text(`Método de pago: ${getPaymentMethodName(customer.paymentMethod)}`, 10, yPos);
      
      // Total
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Total:', 10, yPos);
      doc.text(`${formatCurrency(customer.total)}`, 60, yPos, { align: 'right' });
      
      // Add separator line
      doc.line(10, yPos + 3, 70, yPos + 3);
      
      // Footer
      doc.setFontSize(8);
      doc.text('¡Gracias por su preferencia!', 40, yPos + 8, { align: 'center' });
      
      return doc;
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast.error('Error al crear el PDF');
      return null;
    }
  };
  
  const shareViaWhatsApp = () => {
    try {
      // Generate PDF
      const doc = createPdf();
      if (!doc) return;
      
      // Convert to base64
      const pdfBase64 = doc.output('datauristring');
      
      // Generate list of items for the ticket message
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
      
      // First, send to the customer with PDF
      if (customer.phone) {
        // Create WhatsApp message with PDF link
        const fileName = `ticket_${ticketNumber}.pdf`;
        const messageText = `*Lavandería Ohana - Ticket #${ticketNumber}*\n\n` +
          `Cliente: ${customer.name}\n` +
          `Fecha: ${formattedDate}\n` +
          `Total: ${formatCurrency(customer.total)}\n` +
          `Método de pago: ${getPaymentMethodName(customer.paymentMethod)}\n\n` +
          `Ver ticket adjunto 👇`;
          
        // Open WhatsApp with predefined message and PDF
        const phoneNumber = customer.phone.replace(/\D/g, ''); // Remove non-digits
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`;
        
        // Open in new window
        window.open(whatsappUrl, '_blank');
        
        // Save the PDF
        doc.save(fileName);
        
        toast.success('Ticket listo para compartir por WhatsApp');
      }
      
      // Then, send to the laundry's phone number
      setTimeout(() => {
        const laundryPhone = "5491136424871";
        
        // Create WhatsApp message with PDF link for the laundry
        const fileName = `ticket_${ticketNumber}_laundry.pdf`;
        const messageText = `*Copia de Ticket #${ticketNumber}*\n\n` +
          `Cliente: ${customer.name}\n` +
          `Teléfono: ${customer.phone}\n` +
          `Fecha: ${formattedDate}\n` +
          `Total: ${formatCurrency(customer.total)}\n` +
          `Método de pago: ${getPaymentMethodName(customer.paymentMethod)}\n\n` +
          `Ver ticket adjunto 👇`;
          
        // Open WhatsApp with predefined message and PDF
        const whatsappUrl = `https://wa.me/${laundryPhone}?text=${encodeURIComponent(messageText)}`;
        
        // Open in new window
        window.open(whatsappUrl, '_blank');
        
        // Save the PDF
        doc.save(fileName);
      }, 1000); // Wait 1 second between messages to avoid issues
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      toast.error('Error al compartir por WhatsApp');
    }
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
