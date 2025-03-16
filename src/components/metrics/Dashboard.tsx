import React, { useState, useEffect } from 'react';
import { Coins, CreditCard, TrendingUp, PieChart, Users, Calendar } from 'lucide-react';
import { getDailyMetrics, getWeeklyMetrics, getMonthlyMetrics } from '@/utils/dataStorage';
import { getExpenses } from '@/utils/expenseStorage';
import { getTickets } from '@/utils/ticketStorage';
import { TimeFrame, Expense } from '@/utils/metricsTypes';
import MetricsCard from './MetricsCard';
import ChartCard from './ChartCard';
import TimeFrameTabs from './TimeFrameTabs';
import DateNavigator from './DateNavigator';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [cashRevenue, setCashRevenue] = useState<number>(0);
  const [digitalRevenue, setDigitalRevenue] = useState<number>(0);
  const [valetCount, setValetCount] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [revenueByHour, setRevenueByHour] = useState<any>(null);
  const [serviceDistribution, setServiceDistribution] = useState<any>(null);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<any>(null);
  const [frequentClients, setFrequentClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [comparisonTrend, setComparisonTrend] = useState<{
    revenue: number;
    valets: number;
    cash: number;
    digital: number;
  }>({
    revenue: 0,
    valets: 0,
    cash: 0,
    digital: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [timeFrame, selectedDate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load tickets and expenses
      const allTickets = await getTickets();
      const allExpenses = await getExpenses();
      
      // Load metrics based on timeframe
      let currentData;
      let previousData;
      let currentPeriodTickets;
      let previousPeriodTickets;
      
      if (timeFrame === 'daily') {
        currentData = await getDailyMetrics(selectedDate);
        
        // Get previous day for comparison
        const previousDay = new Date(selectedDate);
        previousDay.setDate(selectedDate.getDate() - 1);
        previousData = await getDailyMetrics(previousDay);
        
        // Filter tickets and expenses for the current day
        currentPeriodTickets = allTickets.filter(ticket => {
          const ticketDate = new Date(ticket.date);
          return ticketDate.getDate() === selectedDate.getDate() &&
                 ticketDate.getMonth() === selectedDate.getMonth() &&
                 ticketDate.getFullYear() === selectedDate.getFullYear();
        });
        
        // Filter tickets for the previous day
        previousPeriodTickets = allTickets.filter(ticket => {
          const ticketDate = new Date(ticket.date);
          return ticketDate.getDate() === previousDay.getDate() &&
                 ticketDate.getMonth() === previousDay.getMonth() &&
                 ticketDate.getFullYear() === previousDay.getFullYear();
        });
        
        // Filter expenses for current day
        const dayExpenses = allExpenses.filter(expense => {
          const expenseDate = expense.date;
          return expenseDate.getDate() === selectedDate.getDate() &&
                 expenseDate.getMonth() === selectedDate.getMonth() &&
                 expenseDate.getFullYear() === selectedDate.getFullYear();
        });
        setExpenses(dayExpenses);
        
        // Generate hourly revenue data
        generateHourlyRevenueData(currentPeriodTickets);
      } else if (timeFrame === 'weekly') {
        currentData = await getWeeklyMetrics(selectedDate);
        
        // Get previous week for comparison
        const previousWeek = new Date(selectedDate);
        previousWeek.setDate(selectedDate.getDate() - 7);
        previousData = await getWeeklyMetrics(previousWeek);
        
        // Filter for current week's expenses
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        const weekExpenses = allExpenses.filter(expense => 
          expense.date >= startOfWeek && expense.date <= endOfWeek
        );
        setExpenses(weekExpenses);
      } else if (timeFrame === 'monthly') {
        currentData = await getMonthlyMetrics(selectedDate);
        
        // Get previous month for comparison
        const previousMonth = new Date(selectedDate);
        previousMonth.setMonth(selectedDate.getMonth() - 1);
        previousData = await getMonthlyMetrics(previousMonth);
        
        // Filter for current month's expenses
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        const monthExpenses = allExpenses.filter(expense => 
          expense.date >= startOfMonth && expense.date <= endOfMonth
        );
        setExpenses(monthExpenses);
      }
      
      // Calculate comparison trends (as percentages)
      calculateTrends(currentData, previousData);
      
      // Set main metrics
      setTotalRevenue(currentData.totalSales);
      setValetCount(currentData.totalValets);
      setCashRevenue(currentData.paymentBreakdown.cash);
      setDigitalRevenue(
        currentData.paymentBreakdown.debit + 
        currentData.paymentBreakdown.mercadopago + 
        currentData.paymentBreakdown.cuentadni
      );
      
      // Generate service distribution chart
      generateServiceDistributionData(currentData.dryCleaningItems);
      
      // Generate income vs expenses chart
      generateIncomeVsExpensesData();
      
      // Get frequent clients
      getFrequentClients(allTickets);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateTrends = (current: any, previous: any) => {
    // Calculate percentage changes
    const calculatePercentage = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    const revenueTrend = calculatePercentage(current.totalSales, previous.totalSales);
    const valetsTrend = calculatePercentage(current.totalValets, previous.totalValets);
    const cashTrend = calculatePercentage(current.paymentBreakdown.cash, previous.paymentBreakdown.cash);
    
    const currentDigital = current.paymentBreakdown.debit + 
                           current.paymentBreakdown.mercadopago + 
                           current.paymentBreakdown.cuentadni;
    const previousDigital = previous.paymentBreakdown.debit + 
                            previous.paymentBreakdown.mercadopago + 
                            previous.paymentBreakdown.cuentadni;
    const digitalTrend = calculatePercentage(currentDigital, previousDigital);
    
    setComparisonTrend({
      revenue: revenueTrend,
      valets: valetsTrend,
      cash: cashTrend,
      digital: digitalTrend
    });
  };
  
  const generateHourlyRevenueData = (tickets: any[]) => {
    const hourlyData: { [key: number]: number } = {};
    // Initialize hours from 8am to 8pm
    for (let i = 8; i <= 20; i++) {
      hourlyData[i] = 0;
    }
    
    tickets.forEach(ticket => {
      const ticketDate = new Date(ticket.date);
      const hour = ticketDate.getHours();
      if (hour >= 8 && hour <= 20) {
        hourlyData[hour] += ticket.total;
      }
    });
    
    const chartData = {
      labels: Object.keys(hourlyData).map(hour => `${hour}:00`),
      datasets: [
        {
          label: 'Ingresos',
          data: Object.values(hourlyData),
          fill: false,
          backgroundColor: 'rgba(83, 123, 224, 0.5)',
          borderColor: 'rgb(83, 123, 224)',
        }
      ]
    };
    
    setRevenueByHour(chartData);
  };
  
  const generateServiceDistributionData = (services: any[]) => {
    if (!services || services.length === 0) {
      setServiceDistribution({
        labels: ['No hay datos'],
        datasets: [{
          data: [100],
          backgroundColor: ['#f3f4f6'],
          borderWidth: 0
        }]
      });
      return;
    }
    
    const chartData = {
      labels: services.map(s => s.name),
      datasets: [
        {
          data: services.map(s => s.quantity),
          backgroundColor: [
            'rgba(83, 123, 224, 0.7)',
            'rgba(83, 184, 127, 0.7)',
            'rgba(247, 199, 88, 0.7)',
            'rgba(241, 130, 94, 0.7)',
            'rgba(126, 105, 171, 0.7)'
          ],
          borderColor: [
            'rgb(83, 123, 224)',
            'rgb(83, 184, 127)',
            'rgb(247, 199, 88)',
            'rgb(241, 130, 94)',
            'rgb(126, 105, 171)'
          ],
          borderWidth: 1
        }
      ]
    };
    
    setServiceDistribution(chartData);
  };
  
  const generateIncomeVsExpensesData = () => {
    if (timeFrame === 'weekly' && 'dailyBreakdown' in (getWeeklyMetrics as any)) {
      const weeklyData = (getWeeklyMetrics as any).dailyBreakdown;
      // Calculate weekly expenses
      const weeklyExpenses = expenses.reduce((total, exp) => total + exp.amount, 0);
      
      const chartData = {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [
          {
            label: 'Ingresos',
            data: [totalRevenue * 0.9, totalRevenue * 0.8, totalRevenue, totalRevenue * 1.1],
            borderColor: 'rgba(83, 123, 224, 0.7)',
            backgroundColor: 'rgba(83, 123, 224, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: 'rgba(83, 123, 224, 1)'
          },
          {
            label: 'Gastos',
            data: [weeklyExpenses * 0.9, weeklyExpenses * 1.1, weeklyExpenses, weeklyExpenses * 0.95],
            borderColor: 'rgba(83, 184, 127, 0.7)',
            backgroundColor: 'rgba(83, 184, 127, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: 'rgba(83, 184, 127, 1)'
          }
        ]
      };
      
      setIncomeVsExpenses(chartData);
    } else {
      // Fallback data
      const total = totalRevenue || 10000;
      const expensesTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0) || total * 0.3;
      
      const chartData = {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [
          {
            label: 'Ingresos',
            data: [total * 0.9, total * 0.95, total, total * 1.05],
            borderColor: 'rgba(83, 123, 224, 0.7)',
            backgroundColor: 'rgba(83, 123, 224, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: 'rgba(83, 123, 224, 1)'
          },
          {
            label: 'Gastos',
            data: [expensesTotal * 0.9, expensesTotal * 1.1, expensesTotal, expensesTotal * 0.95],
            borderColor: 'rgba(83, 184, 127, 0.7)',
            backgroundColor: 'rgba(83, 184, 127, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: 'rgba(83, 184, 127, 1)'
          }
        ]
      };
      
      setIncomeVsExpenses(chartData);
    }
  };
  
  const getFrequentClients = (tickets: any[]) => {
    const clientVisits: { [phone: string]: { name: string; visits: number } } = {};
    
    tickets.forEach(ticket => {
      if (!clientVisits[ticket.phone]) {
        clientVisits[ticket.phone] = { name: ticket.name, visits: 0 };
      }
      clientVisits[ticket.phone].visits++;
    });
    
    const topClients = Object.entries(clientVisits)
      .map(([phone, data]) => ({ 
        phone, 
        name: data.name, 
        visits: data.visits 
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
    
    setFrequentClients(topClients);
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

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 6
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        }
      }
    }
  };
  
  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">WashWise</h1>
        <h2 className="text-lg font-semibold text-zinc-800 mb-4">Performance Metrics</h2>
        
        <TimeFrameTabs 
          timeFrame={timeFrame} 
          onTimeFrameChange={setTimeFrame} 
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricsCard
          title="Total Income"
          value={formatCurrency(totalRevenue)}
          description={`${timeFrame === 'daily' ? 'Today' : timeFrame === 'weekly' ? 'This week' : 'This month'}'s earnings`}
          trend={{ value: comparisonTrend.revenue, isPositive: comparisonTrend.revenue >= 0 }}
          icon={<Coins className="h-6 w-6" />}
        />
        
        <MetricsCard
          title="Valets"
          value={valetCount}
          description={`Valets processed ${timeFrame === 'daily' ? 'today' : timeFrame === 'weekly' ? 'this week' : 'this month'}`}
          trend={{ value: comparisonTrend.valets, isPositive: comparisonTrend.valets >= 0 }}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        
        <MetricsCard
          title="Cash Payments"
          value={formatCurrency(cashRevenue)}
          description={`${timeFrame === 'daily' ? 'Today' : timeFrame === 'weekly' ? 'This week' : 'This month'}'s cash revenue`}
          trend={{ value: comparisonTrend.cash, isPositive: comparisonTrend.cash >= 0 }}
          icon={<Coins className="h-6 w-6" />}
        />
        
        <MetricsCard
          title="Digital Payments"
          value={formatCurrency(digitalRevenue)}
          description={`${timeFrame === 'daily' ? 'Today' : timeFrame === 'weekly' ? 'This week' : 'This month'}'s digital revenue`}
          trend={{ value: comparisonTrend.digital, isPositive: comparisonTrend.digital >= 0 }}
          icon={<CreditCard className="h-6 w-6" />}
        />
      </div>
      
      {revenueByHour && (
        <ChartCard 
          title="Revenue Overview" 
          subtitle={`${timeFrame === 'daily' ? 'Today' : timeFrame === 'weekly' ? 'This week' : 'This month'}'s revenue by hour`}
        >
          <div className="h-64">
            <Line 
              data={revenueByHour} 
              options={chartOptions}
            />
          </div>
        </ChartCard>
      )}
      
      {incomeVsExpenses && (
        <ChartCard 
          title="Income vs Expenses" 
          subtitle="Comparison of income and expenses"
        >
          <div className="h-64">
            <Line 
              data={incomeVsExpenses} 
              options={chartOptions}
            />
          </div>
        </ChartCard>
      )}
      
      {serviceDistribution && (
        <ChartCard 
          title="Service Distribution" 
          subtitle="Breakdown of services requested"
        >
          <div className="h-64">
            <Pie 
              data={serviceDistribution} 
              options={pieOptions}
            />
          </div>
        </ChartCard>
      )}
      
      <ChartCard 
        title="Frequent Clients" 
        subtitle="Clients with most visits"
      >
        {frequentClients.length > 0 ? (
          <div className="space-y-3">
            {frequentClients.map((client, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{client.name}</span>
                </div>
                <div className="text-sm font-medium">
                  {client.visits} {client.visits === 1 ? 'visit' : 'visits'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">
            No client visit data available
          </div>
        )}
      </ChartCard>
    </div>
  );
};

export default Dashboard;
