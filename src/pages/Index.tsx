
import React from 'react';
import LaundryHeader from '@/components/LaundryHeader';
import TicketForm from '@/components/TicketForm';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-12">
      <div className="container max-w-md mx-auto">
        <LaundryHeader />
        <TicketForm />
        
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Sistema de Lavandería - Genere tickets de lavado de forma sencilla
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
