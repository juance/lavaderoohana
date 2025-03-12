
import React from 'react';
import { toast } from 'sonner';

interface LaundryOptions {
  separateByColor: boolean;
  delicateDry: boolean;
  stainRemoval: boolean;
  bleach: boolean;
  noFragrance: boolean;
  noDry: boolean;
}

type PaymentMethod = 'cash' | 'debit' | 'mercadopago' | 'cuentadni';

interface Customer {
  name: string;
  phone: string;
  valetQuantity: number;
  laundryOptions: LaundryOptions;
  paymentMethod: PaymentMethod;
  total: number;
  date?: Date;
}

interface TicketPrinterProps {
  customer: Customer;
  ticketNumber: string;
  formattedDate: string;
}

const TicketPrinter: React.FC<TicketPrinterProps> = ({ 
  customer,
  ticketNumber,
  formattedDate
}) => {
  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'debit': return 'Débito';
      case 'mercadopago': return 'Mercado Pago';
      case 'cuentadni': return 'Cuenta DNI';
    }
  };
  
  const handlePrint = () => {
    try {
      const printWindow = window.open('', '', 'height=600,width=800');
      
      if (printWindow) {
        printWindow.document.write('<html><head><title>Tickets de Lavandería</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 20px; }
          .ticket-container { max-width: 300px; margin: 0 auto; page-break-after: always; }
          .ticket-header { text-align: center; margin-bottom: 15px; }
          .ticket-logo { font-size: 24px; font-weight: bold; }
          .ticket-copy { font-size: 14px; font-weight: bold; background-color: #f0f0f0; padding: 5px; border-radius: 4px; margin-bottom: 10px; text-align: center; }
          .ticket-content { border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
          .ticket-row { display: flex; justify-content: space-between; margin: 8px 0; }
          .ticket-label { color: #666; }
          .ticket-value { font-weight: 500; }
          .ticket-total { font-size: 18px; font-weight: bold; margin-top: 10px; }
          .ticket-footer { text-align: center; font-size: 12px; color: #999; margin-top: 15px; }
          .dashed-line { border-top: 1px dashed #ccc; margin: 15px 0; }
          .options-title { font-weight: 500; color: #666; margin: 10px 0 5px 0; }
          .option-item { display: flex; align-items: center; margin: 3px 0; }
          .option-item .checkbox { display: inline-block; width: 12px; height: 12px; border: 1px solid #999; margin-right: 8px; }
          .option-item .checked { background-color: #666; }
          .payment-method { margin-top: 12px; }
        `);
        printWindow.document.write('</style></head><body>');
        
        // Print CLIENT COPY
        printWindow.document.write('<div class="ticket-container">');
        printWindow.document.write('<div class="ticket-copy">COPIA CLIENTE</div>');
        printWindow.document.write('<div class="ticket-header">');
        printWindow.document.write('<div class="ticket-logo">Lavandería Ohana</div>');
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
        
        // Laundry Options
        printWindow.document.write('<div class="options-title">Opciones de lavado:</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.separateByColor ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>1. Separar por color</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.delicateDry ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>2. Secar en delicado</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.stainRemoval ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>3. Desmanchar</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.bleach ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>4. Blanquear</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.noFragrance ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>5. Sin perfume</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.noDry ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>6. No secar</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="dashed-line"></div>');
        
        printWindow.document.write('<div class="ticket-row">');
        printWindow.document.write('<span class="ticket-label">Cantidad de Valet:</span>');
        printWindow.document.write(`<span class="ticket-value">${customer.valetQuantity}</span>`);
        printWindow.document.write('</div>');
        
        // Payment Method
        printWindow.document.write('<div class="payment-method">');
        printWindow.document.write('<div class="ticket-row">');
        printWindow.document.write('<span class="ticket-label">Método de pago:</span>');
        printWindow.document.write(`<span class="ticket-value">${getPaymentMethodName(customer.paymentMethod)}</span>`);
        printWindow.document.write('</div>');
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
        
        // Print LAUNDRY COPY
        printWindow.document.write('<div class="ticket-container">');
        printWindow.document.write('<div class="ticket-copy">COPIA LAVANDERÍA</div>');
        printWindow.document.write('<div class="ticket-header">');
        printWindow.document.write('<div class="ticket-logo">Lavandería Ohana</div>');
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
        
        // Laundry Options
        printWindow.document.write('<div class="options-title">Opciones de lavado:</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.separateByColor ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>1. Separar por color</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.delicateDry ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>2. Secar en delicado</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.stainRemoval ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>3. Desmanchar</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.bleach ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>4. Blanquear</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.noFragrance ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>5. Sin perfume</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="option-item">');
        printWindow.document.write(`<span class="checkbox ${customer.laundryOptions.noDry ? 'checked' : ''}"></span>`);
        printWindow.document.write('<span>6. No secar</span>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('<div class="dashed-line"></div>');
        
        printWindow.document.write('<div class="ticket-row">');
        printWindow.document.write('<span class="ticket-label">Cantidad de Valet:</span>');
        printWindow.document.write(`<span class="ticket-value">${customer.valetQuantity}</span>`);
        printWindow.document.write('</div>');
        
        // Payment Method
        printWindow.document.write('<div class="payment-method">');
        printWindow.document.write('<div class="ticket-row">');
        printWindow.document.write('<span class="ticket-label">Método de pago:</span>');
        printWindow.document.write(`<span class="ticket-value">${getPaymentMethodName(customer.paymentMethod)}</span>`);
        printWindow.document.write('</div>');
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
        
        toast.success('Imprimiendo tickets duplicados...');
      } else {
        toast.error('No se pudo abrir la ventana de impresión');
      }
    } catch (error) {
      console.error('Error al imprimir:', error);
      toast.error('Ocurrió un error al intentar imprimir');
    }
  };

  return { handlePrint };
};

export default TicketPrinter;
