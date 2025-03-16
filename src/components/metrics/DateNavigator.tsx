
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { TimeFrame } from '@/utils/metricsTypes';

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
      return `Week of ${formatDate(startOfWeek)}`;
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
        size="icon"
        onClick={() => handleDateChange(-1)}
        className="h-8 w-8 rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-md text-sm font-medium text-slate-700">
        <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
        {getFormattedDateDisplay()}
      </div>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={() => handleDateChange(1)}
        disabled={isNextButtonDisabled()}
        className="h-8 w-8 rounded-full"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DateNavigator;
