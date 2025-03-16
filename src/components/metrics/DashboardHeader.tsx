
import React from 'react';
import TimeFrameTabs from './TimeFrameTabs';
import DateNavigator from './DateNavigator';
import { TimeFrame } from '@/utils/metricsTypes';

interface DashboardHeaderProps {
  timeFrame: TimeFrame;
  selectedDate: Date;
  onTimeFrameChange: (value: TimeFrame) => void;
  handleDateChange: (change: number) => void;
  formatDate: (date: Date) => string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  timeFrame,
  selectedDate,
  onTimeFrameChange,
  handleDateChange,
  formatDate
}) => {
  return (
    <div className="flex flex-col">
      <h1 className="text-2xl font-bold text-zinc-900 mb-2">WashWise</h1>
      <h2 className="text-lg font-semibold text-zinc-800 mb-4">Performance Metrics</h2>
      
      <TimeFrameTabs 
        timeFrame={timeFrame} 
        onTimeFrameChange={onTimeFrameChange} 
      />
      
      <div className="mt-4 mb-6">
        <DateNavigator 
          timeFrame={timeFrame}
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
