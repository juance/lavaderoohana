
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import LaundryHeader from '@/components/LaundryHeader';
import TicketForm from '@/components/TicketForm';
import MetricsPanel from '@/components/MetricsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket as TicketIcon, BarChart3, Package, Search, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getCurrentUser, hasPermission } from '@/utils/authService';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('tickets');
  const currentUser = getCurrentUser();
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Set default tab based on permissions
  useEffect(() => {
    if (!hasPermission('tickets.create') && hasPermission('metrics.view')) {
      setActiveTab('metrics');
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-12">
      <div className="container max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <LaundryHeader />
          <div className="text-sm text-gray-600">
            Usuario: <span className="font-medium">{currentUser.username}</span>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid grid-cols-2 w-full">
            {hasPermission('tickets.create') && (
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <TicketIcon className="h-4 w-4" />
                Tickets
              </TabsTrigger>
            )}
            {hasPermission('metrics.view') && (
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Métricas
              </TabsTrigger>
            )}
          </TabsList>
          
          {hasPermission('tickets.create') && (
            <TabsContent value="tickets" className="mt-6">
              <TicketForm />
            </TabsContent>
          )}
          
          {hasPermission('metrics.view') && (
            <TabsContent value="metrics" className="mt-6">
              <MetricsPanel />
            </TabsContent>
          )}
        </Tabs>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          {hasPermission('inventory.view') && (
            <Link to="/inventory">
              <Button className="w-full flex items-center gap-2 bg-laundry-100 text-laundry-700 hover:bg-laundry-200">
                <Package className="h-4 w-4" />
                Inventario
              </Button>
            </Link>
          )}
          
          {hasPermission('orders.view') && (
            <Link to="/pickup-orders">
              <Button className="w-full flex items-center gap-2 bg-laundry-100 text-laundry-700 hover:bg-laundry-200">
                <Search className="h-4 w-4" />
                Pedidos
              </Button>
            </Link>
          )}
          
          {hasPermission('users.manage') && (
            <Link to="/users" className="col-span-2">
              <Button className="w-full flex items-center gap-2 bg-laundry-600 hover:bg-laundry-700">
                <UserCog className="h-4 w-4" />
                Gestionar Usuarios
              </Button>
            </Link>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Sistema de Lavandería Ohana - Gestión de tickets y métricas
          </p>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-laundry-100 rounded-full blur-3xl opacity-30 -z-10"></div>
      <div className="fixed -top-20 -right-20 w-64 h-64 bg-laundry-200 rounded-full blur-3xl opacity-30 -z-10"></div>
    </div>
  );
};

export default Index;
