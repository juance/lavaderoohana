
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { LineChart } from 'lucide-react';
import { 
  getDailyMetrics, 
  getWeeklyMetrics, 
  getMonthlyMetrics, 
  getStoredExpenses 
} from '@/utils/dataStorage';
import { toast } from 'sonner';
import MetricsVisualization from './metrics/MetricsVisualization';
import TimeFrameTabs from './metrics/TimeFrameTabs';
import DateNavigator from './metrics/DateNavigator';
import ExpensesCard from './metrics/ExpensesCard';
import { 
  TimeFrame, 
  DailyMetrics, 
  WeeklyMetrics, 
  MonthlyMetrics, 
  Expense 
} from '@/utils/metricsTypes';

const MetricsPanel: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics | null>(null);
  const [weeklyMetrics, setWeeklyMetrics] = useState<WeeklyMetrics | null>(null);
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetrics | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    loadMetrics();
  }, [timeFrame, selectedDate]);
  
  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Load expenses for the daily view
      if (timeFrame === 'daily') {
        const allExpenses = await getStoredExpenses();
        const filteredExpenses = allExpenses.filter(expense => {
          const expenseDate = expense.date;
          return expenseDate.getDate() === selectedDate.getDate() &&
                 expenseDate.getMonth() === selectedDate.getMonth() &&
                 expenseDate.getFullYear() === selectedDate.getFullYear();
        });
        setExpenses(filteredExpenses);
      }
      
      // Load metrics based on timeframe
      if (timeFrame === 'daily') {
        const data = await getDailyMetrics(selectedDate);
        setDailyMetrics(data);
      } else if (timeFrame === 'weekly') {
        const data = await getWeeklyMetrics(selectedDate);
        setWeeklyMetrics(data);
      } else if (timeFrame === 'monthly') {
        const data = await getMonthlyMetrics(selectedDate);
        setMonthlyMetrics(data);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      toast.error('Error al cargar las métricas');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
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
  
  // Get the current active metrics data based on the timeframe
  const getCurrentMetrics = () => {
    if (timeFrame === 'daily') {
      return dailyMetrics;
    } else if (timeFrame === 'weekly') {
      return weeklyMetrics;
    } else {
      return monthlyMetrics;
    }
  };

  // Create default metrics for initial render
  const getDefaultMetrics = (timeframe: TimeFrame) => {
    const baseMetrics = { 
      totalValets: 0, 
      totalSales: 0, 
      paymentBreakdown: { cash: 0, debit: 0, mercadopago: 0, cuentadni: 0 },
      dryCleaningItems: []
    };

    if (timeframe === 'daily') {
      return baseMetrics;
    } else if (timeframe === 'weekly') {
      return {
        ...baseMetrics,
        dailyBreakdown: []
      };
    } else {
      return {
        ...baseMetrics,
        weeklyBreakdown: []
      };
    }
  };
  
  return (
    <Card className="border-0 shadow-lg shadow-laundry-200/20">
      <CardHeader className="bg-gradient-to-r from-laundry-500 to-laundry-600 text-white rounded-t-lg pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Métricas de Lavandería
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <TimeFrameTabs 
              timeFrame={timeFrame} 
              onTimeFrameChange={setTimeFrame} 
            />
          </div>
          
          <DateNavigator 
            timeFrame={timeFrame}
            selectedDate={selectedDate}
            handleDateChange={handleDateChange}
            formatDate={formatDate}
          />
          
          <TabsContent value="daily" className="mt-0 space-y-4">
            <MetricsVisualization 
              timeFrame="daily" 
              metrics={dailyMetrics || getDefaultMetrics('daily')}
              formatCurrency={formatCurrency}
            />
            {timeFrame === 'daily' && (
              <ExpensesCard 
                expenses={expenses} 
                formatCurrency={formatCurrency} 
                onExpenseAdded={loadMetrics} 
              />
            )}
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-0 space-y-4">
            <MetricsVisualization 
              timeFrame="weekly" 
              metrics={weeklyMetrics || getDefaultMetrics('weekly')}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-0 space-y-4">
            <MetricsVisualization 
              timeFrame="monthly" 
              metrics={monthlyMetrics || getDefaultMetrics('monthly')}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsPanel;
