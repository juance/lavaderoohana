
export const shareTicketViaWhatsApp = (
  phoneNumber: string,
  ticketData: {
    customerName: string;
    customerPhone: string;
    ticketNumber: string;
    formattedDate: string;
    items: string[];
    total: number;
    paymentMethod: string;
  }
) => {
  // Format phone number (remove non-numeric characters and ensure it has a country code)
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  
  if (!formattedPhone.startsWith('54')) {
    formattedPhone = `54${formattedPhone}`;
  }
  
  // Format items as bullet points
  const formattedItems = ticketData.items.map(item => `• ${item}`).join('\n');
  
  // Create the message
  const message = `
🧺 *LAVANDERÍA OHANA - TICKET #${ticketData.ticketNumber}* 🧺

📅 Fecha: ${ticketData.formattedDate}

👤 *Cliente:* ${ticketData.customerName}
📱 *Teléfono:* ${ticketData.customerPhone}

*Detalle:*
${formattedItems}

💰 *Total:* $${ticketData.total.toLocaleString()}
💳 *Método de pago:* ${ticketData.paymentMethod}

¡Gracias por su preferencia! Lavandería Ohana - Camargo 590 CABA
☎️ WhatsApp: +54 9 11 3642 4871
`;
  
  // Encode the message for a URL
  const encodedMessage = encodeURIComponent(message);
  
  // Create the WhatsApp URL
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
  
  // Open in a new window
  window.open(whatsappUrl, '_blank');
};
