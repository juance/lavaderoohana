
import React from 'react';
import { WashingMachine } from 'lucide-react';

const LaundryHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in">
      <div className="relative mb-2">
        <WashingMachine className="w-12 h-12 text-laundry-600" />
        <div className="absolute -inset-1 bg-blue-100 rounded-full -z-10 blur-sm animate-pulse"></div>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-laundry-700 to-laundry-500 bg-clip-text text-transparent">
        Lavandería Express
      </h1>
      <p className="text-muted-foreground mt-2 animate-fade-up" style={{ animationDelay: '100ms' }}>
        Sistema de Tickets
      </p>
      <div className="h-1 w-16 bg-gradient-to-r from-laundry-500 to-laundry-300 rounded-full mt-4 mb-8"></div>
    </div>
  );
};

export default LaundryHeader;
