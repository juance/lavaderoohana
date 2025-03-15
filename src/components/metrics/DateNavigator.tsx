
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

type TimeFrame = 'daily' | 'weekly' | 'monthly';

interface DateNavigatorProps {
  timeFrame: TimeFrame;
  selectedDate: Date;
  handleDateChange: (change: number) => void;
  formatDate: (date: Date) => string;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  timeFrame,
  selectedDate,
  handleDateChange,
  formatDate
}) => {
  // Helper function to format the date display based on timeframe
  const getFormattedDateDisplay = () => {
    if (timeFrame === 'daily') {
      return formatDate(selectedDate);
    } else if (timeFrame === 'weekly') {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      return `Semana del ${formatDate(startOfWeek)}`;
    } else {
      return selectedDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    }
  };

  // Check if "next" button should be disabled (can't go to future dates)
  const isNextButtonDisabled = () => {
    if (timeFrame !== 'daily') return false;
    
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() && 
      selectedDate.getMonth() === today.getMonth() && 
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="flex justify-between items-center">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleDateChange(-1)}
      >
        Anterior
      </Button>
      
      <div className="flex items-center gap-1 px-3 py-1.5 bg-laundry-50 rounded-md text-sm">
        <CalendarIcon className="h-3.5 w-3.5 text-laundry-500" />
        {getFormattedDateDisplay()}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleDateChange(1)}
        disabled={isNextButtonDisabled()}
      >
        Siguiente
      </Button>
    </div>
  );
};

export default DateNavigator;
