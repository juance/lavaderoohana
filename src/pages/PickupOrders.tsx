
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Ticket } from '@/components/Ticket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Calendar, FileText, Phone } from 'lucide-react';
import LaundryHeader from '@/components/LaundryHeader';
import { getTickets } from '@/utils/dataStorage';
import { hasPermission } from '@/utils/authService';
import { Badge } from '@/components/ui/badge';

const PickupOrders: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [searchType, setSearchType] = useState<'ticketNumber' | 'name' | 'phone'>('ticketNumber');
  
  // Check if user has permission to view orders
  if (!hasPermission('orders.view')) {
    return <Navigate to="/" replace />;
  }
  
  // Load tickets
  useEffect(() => {
    const loadedTickets = getTickets();
    setTickets(loadedTickets);
  }, []);
  
  // Filter tickets based on search
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    switch (searchType) {
      case 'ticketNumber':
        return ticket.ticketNumber.toLowerCase().includes(searchLower);
      case 'name':
        return ticket.customerName.toLowerCase().includes(searchLower);
      case 'phone':
        return ticket.customerPhone.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });
  
  const handleSearchTypeChange = (type: 'ticketNumber' | 'name' | 'phone') => {
    setSearchType(type);
    setSearchTerm('');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-12">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-laundry-600 hover:text-laundry-700">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>
          <LaundryHeader />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Pedidos a Retirar</h2>
          
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder={
                    searchType === 'ticketNumber' 
                      ? 'Buscar por número de ticket...' 
                      : searchType === 'name'
                        ? 'Buscar por nombre de cliente...'
                        : 'Buscar por teléfono...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex">
                <Button
                  type="button"
                  onClick={() => handleSearchTypeChange('ticketNumber')}
                  variant={searchType === 'ticketNumber' ? 'default' : 'outline'}
                  className={`flex items-center gap-1 rounded-r-none ${
                    searchType === 'ticketNumber' ? 'bg-laundry-600 hover:bg-laundry-700' : ''
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden md:inline">Ticket</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSearchTypeChange('name')}
                  variant={searchType === 'name' ? 'default' : 'outline'}
                  className={`flex items-center gap-1 rounded-none border-x-0 ${
                    searchType === 'name' ? 'bg-laundry-600 hover:bg-laundry-700' : ''
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden md:inline">Nombre</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSearchTypeChange('phone')}
                  variant={searchType === 'phone' ? 'default' : 'outline'}
                  className={`flex items-center gap-1 rounded-l-none ${
                    searchType === 'phone' ? 'bg-laundry-600 hover:bg-laundry-700' : ''
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  <span className="hidden md:inline">Teléfono</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* List of tickets */}
            <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto">
              {filteredTickets.length > 0 ? (
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedTicket?.id === ticket.id 
                          ? 'border-laundry-500 bg-laundry-50' 
                          : 'border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{ticket.customerName}</div>
                          <div className="text-sm text-gray-500">{ticket.customerPhone}</div>
                        </div>
                        <Badge className="bg-laundry-500">
                          #{ticket.ticketNumber}
                        </Badge>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <div>
                          Fecha: {formatDate(ticket.dateCreated)}
                        </div>
                        <div className="font-semibold text-laundry-700">
                          ${ticket.totalAmount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Search className="h-12 w-12 mb-2 text-gray-300" />
                  <p>No se encontraron tickets.</p>
                </div>
              )}
            </div>
            
            {/* Ticket details */}
            <div className="bg-gray-50 rounded-lg p-4 h-[500px] overflow-y-auto">
              {selectedTicket ? (
                <Ticket ticketData={selectedTicket} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <FileText className="h-12 w-12 mb-2 text-gray-300" />
                  <p>Seleccione un ticket para ver los detalles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupOrders;
