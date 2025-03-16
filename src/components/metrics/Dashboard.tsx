
import React, { useState } from 'react';
import { TimeFrame } from '@/utils/metricsTypes';
import { formatDate, formatCurrency } from '@/utils/formatHelpers';
import useDashboardData from './useDashboardData';
import DashboardHeader from './DashboardHeader';
import SummaryCards from './SummaryCards';
import RevenueByHourChart from './RevenueByHourChart';
import IncomeVsExpensesChart from './IncomeVsExpensesChart';
import ServiceDistributionChart from './ServiceDistributionChart';
import FrequentClientsCard from './FrequentClientsCard';

const Dashboard: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const {
    totalRevenue,
    cashRevenue,
    digitalRevenue,
    valetCount,
    revenueByHour,
    serviceDistribution,
    incomeVsExpenses,
    frequentClients,
    comparisonTrend,
    isLoading
  } = useDashboardData(timeFrame, selectedDate);
  
  const handleDateChange = (change: number) => {
    const newDate = new Date(selectedDate);
    
    if (timeFrame === 'daily') {
      newDate.setDate(selectedDate.getDate() + change);
    } else if (timeFrame === 'weekly') {
      newDate.setDate(selectedDate.getDate() + (change * 7));
    } else if (timeFrame === 'monthly') {
      newDate.setMonth(selectedDate.getMonth() + change);
    }
    
    setSelectedDate(newDate);
  };
  
  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading metrics data...</div>;
  }
  
  return (
    <div className="space-y-6 pb-6">
      <DashboardHeader
        timeFrame={timeFrame}
        selectedDate={selectedDate}
        onTimeFrameChange={setTimeFrame}
        handleDateChange={handleDateChange}
        formatDate={formatDate}
      />
      
      <SummaryCards
        timeFrame={timeFrame}
        totalRevenue={totalRevenue}
        cashRevenue={cashRevenue}
        digitalRevenue={digitalRevenue}
        valetCount={valetCount}
        comparisonTrend={comparisonTrend}
        formatCurrency={formatCurrency}
      />
      
      <RevenueByHourChart 
        revenueByHour={revenueByHour} 
        timeFrame={timeFrame} 
      />
      
      <IncomeVsExpensesChart incomeVsExpenses={incomeVsExpenses} />
      
      <ServiceDistributionChart serviceDistribution={serviceDistribution} />
      
      <FrequentClientsCard frequentClients={frequentClients} />
    </div>
  );
};

export default Dashboard;
