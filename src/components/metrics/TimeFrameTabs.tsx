
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, BarChart4, LineChart } from 'lucide-react';

type TimeFrame = 'daily' | 'weekly' | 'monthly';

interface TimeFrameTabsProps {
  timeFrame: TimeFrame;
  onTimeFrameChange: (value: TimeFrame) => void;
}

const TimeFrameTabs: React.FC<TimeFrameTabsProps> = ({ 
  timeFrame, 
  onTimeFrameChange 
}) => {
  return (
    <Tabs 
      value={timeFrame} 
      onValueChange={(value) => onTimeFrameChange(value as TimeFrame)} 
      className="w-full"
    >
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="daily" className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Diario</span>
        </TabsTrigger>
        <TabsTrigger value="weekly" className="flex items-center gap-1">
          <BarChart4 className="h-4 w-4" />
          <span className="hidden sm:inline">Semanal</span>
        </TabsTrigger>
        <TabsTrigger value="monthly" className="flex items-center gap-1">
          <LineChart className="h-4 w-4" />
          <span className="hidden sm:inline">Mensual</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TimeFrameTabs;
