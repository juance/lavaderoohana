
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Ticket from '@/components/Ticket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Calendar, FileText, Phone, CreditCard } from 'lucide-react';
import LaundryHeader from '@/components/LaundryHeader';
import { getStoredTickets } from '@/utils/dataStorage';
import { hasPermission } from '@/utils/authService';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PickupOrders: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [searchType, setSearchType] = useState<'ticketNumber' | 'name' | 'phone'>('ticketNumber');
  const [activeTab, setActiveTab] = useState<string>('orders');
  
  // Check if user has permission to view orders
  if (!hasPermission('orders.view')) {
    return <Navigate to="/" replace />;
  }
  
  // Load tickets
  useEffect(() => {
    const loadedTickets = getStoredTickets();
    setTickets(loadedTickets);
  }, []);
  
  // Filter tickets based on search
  const filteredTickets = tickets.filter((ticket) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    switch (searchType) {
      case 'ticketNumber':
        return ticket.ticketNumber?.toLowerCase().includes(searchLower);
      case 'name':
        return ticket.name?.toLowerCase().includes(searchLower);
      case 'phone':
        return ticket.phone?.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });
  
  const handleSearchTypeChange = (type: 'ticketNumber' | 'name' | 'phone') => {
    setSearchType(type);
    setSearchTerm('');
  };
  
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="orders" className="flex items-center gap-2 w-1/2">
              <Search className="h-4 w-4" />
              Pedidos a Retirar
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 w-1/2">
              <CreditCard className="h-4 w-4" />
              Métodos de Pago
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="mt-6">
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
                      {filteredTickets.map((ticket, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedTicket === ticket 
                              ? 'border-laundry-500 bg-laundry-50' 
                              : 'border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{ticket.name}</div>
                              <div className="text-sm text-gray-500">{ticket.phone}</div>
                            </div>
                            <Badge className="bg-laundry-500">
                              #{ticket.ticketNumber || index + 1}
                            </Badge>
                          </div>
                          <div className="mt-2 flex justify-between text-sm">
                            <div>
                              Fecha: {formatDate(ticket.date)}
                            </div>
                            <div className="font-semibold text-laundry-700">
                              {new Intl.NumberFormat('es-AR', {
                                style: 'currency',
                                currency: 'ARS',
                                minimumFractionDigits: 0
                              }).format(ticket.total)}
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
                    <Ticket 
                      customer={selectedTicket}
                      onNewTicket={() => setSelectedTicket(null)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <FileText className="h-12 w-12 mb-2 text-gray-300" />
                      <p>Seleccione un ticket para ver los detalles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="payments" className="mt-6">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-6 text-center">Métodos de Pago</h3>
              
              <div className="space-y-6">
                <div className="p-4 border border-green-200 bg-green-50 rounded-md">
                  <h4 className="font-medium text-green-800 text-lg mb-2">Efectivo</h4>
                  <p className="text-green-700">Pago en efectivo al momento de la entrega.</p>
                  <div className="mt-2 bg-green-100 p-3 rounded">
                    <p className="font-medium">Precio por Valet: $5.000</p>
                  </div>
                </div>
                
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
                  <h4 className="font-medium text-blue-800 text-lg mb-2">Transferencia</h4>
                  <p className="text-blue-700">CVU: 0000003100042886402505</p>
                  <p className="text-blue-700">Alias: camargo590</p>
                </div>
                
                <div className="p-4 border border-purple-200 bg-purple-50 rounded-md">
                  <h4 className="font-medium text-purple-800 text-lg mb-2">Mercado Pago</h4>
                  <p className="text-purple-700">Alias: camargo590</p>
                  <p className="text-purple-700">Escanear código QR en el local.</p>
                </div>
                
                <div className="p-4 border border-orange-200 bg-orange-50 rounded-md">
                  <h4 className="font-medium text-orange-800 text-lg mb-2">Tarjetas</h4>
                  <p className="text-orange-700">Aceptamos todas las tarjetas de crédito y débito.</p>
                </div>
                
                <div className="mt-4 p-4 border border-gray-200 bg-gray-50 rounded-md">
                  <p className="text-center text-gray-500 text-sm">
                    Para consultas sobre pagos, contacte al administrador.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PickupOrders;
