
// Store the last ticket number in localStorage to persist across page refreshes
const getLastTicketNumber = (): number => {
  const lastTicket = localStorage.getItem('lastTicketNumber');
  return lastTicket ? parseInt(lastTicket, 10) : 0;
};

export const generateTicketNumber = (): string => {
  // Get the last ticket number and increment it by 1
  const lastNumber = getLastTicketNumber();
  const newNumber = lastNumber + 1;
  
  // Store the new number for future use
  localStorage.setItem('lastTicketNumber', newNumber.toString());
  
  // Format the number with leading zeros (8 digits total)
  return newNumber.toString().padStart(8, '0');
};
