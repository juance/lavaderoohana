
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, BarChart4, LineChart } from 'lucide-react';
import { TimeFrame } from '@/utils/metricsTypes';

interface TimeFrameTabsProps {
  timeFrame: TimeFrame;
  onTimeFrameChange: (value: TimeFrame) => void;
}

const TimeFrameTabs: React.FC<TimeFrameTabsProps> = ({ 
  timeFrame, 
  onTimeFrameChange 
}) => {
  return (
    <div className="bg-slate-50 p-1 rounded-lg">
      <Tabs 
        value={timeFrame} 
        onValueChange={(value) => onTimeFrameChange(value as TimeFrame)} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 bg-transparent">
          <TabsTrigger 
            value="daily" 
            className={`flex items-center gap-1 ${timeFrame === 'daily' ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/50'}`}
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Daily</span>
          </TabsTrigger>
          <TabsTrigger 
            value="weekly" 
            className={`flex items-center gap-1 ${timeFrame === 'weekly' ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/50'}`}
          >
            <BarChart4 className="h-4 w-4" />
            <span className="hidden sm:inline">Weekly</span>
          </TabsTrigger>
          <TabsTrigger 
            value="monthly" 
            className={`flex items-center gap-1 ${timeFrame === 'monthly' ? 'bg-white shadow-sm' : 'bg-transparent hover:bg-white/50'}`}
          >
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Monthly</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TimeFrameTabs;
