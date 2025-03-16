
import { useState, useEffect } from 'react';
import { getDailyMetrics, getWeeklyMetrics, getMonthlyMetrics } from '@/utils/dataStorage';
import { getExpenses } from '@/utils/expenseStorage';
import { getTickets } from '@/utils/ticketStorage';
import { TimeFrame, Expense } from '@/utils/metricsTypes';

export const useDashboardData = (timeFrame: TimeFrame, selectedDate: Date) => {
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

  useEffect(() => {
    loadDashboardData();
  }, [timeFrame, selectedDate]);

  return {
    totalRevenue,
    cashRevenue,
    digitalRevenue,
    valetCount,
    expenses,
    revenueByHour,
    serviceDistribution,
    incomeVsExpenses,
    frequentClients,
    isLoading,
    comparisonTrend,
    loadDashboardData
  };
};

export default useDashboardData;
