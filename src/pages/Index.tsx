
import React, { useState } from 'react';
import LaundryHeader from '@/components/LaundryHeader';
import TicketForm from '@/components/TicketForm';
import MetricsPanel from '@/components/MetricsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket as TicketIcon, BarChart3 } from 'lucide-react';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('tickets');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-12">
      <div className="container max-w-md mx-auto">
        <LaundryHeader />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <TicketIcon className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Métricas
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tickets" className="mt-6">
            <TicketForm />
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-6">
            <MetricsPanel />
          </TabsContent>
        </Tabs>
        
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
