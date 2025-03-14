
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays, 
  CalendarIcon, 
  LineChart, 
  BarChart4, 
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  getDailyMetrics, 
  getWeeklyMetrics, 
  getMonthlyMetrics, 
  getStoredExpenses, 
  storeExpense 
} from '@/utils/dataStorage';
import { toast } from 'sonner';
import MetricsVisualization from './metrics/MetricsVisualization';

type TimeFrame = 'daily' | 'weekly' | 'monthly';

interface PaymentBreakdown {
  cash: number;
  debit: number;
  mercadopago: number;
  cuentadni: number;
}

interface Expense {
  description: string;
  amount: number;
  date: Date;
}

interface DailyMetrics {
  totalValets: number;
  totalSales: number;
  paymentBreakdown: PaymentBreakdown;
  dryCleaningItems: { name: string; quantity: number; sales: number }[];
}

interface WeeklyMetrics extends DailyMetrics {
  dailyBreakdown: { date: Date; sales: number; valets: number }[];
}

interface MonthlyMetrics extends DailyMetrics {
  weeklyBreakdown: { weekNumber: number; sales: number; valets: number }[];
}

const MetricsPanel: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddExpense, setShowAddExpense] = useState<boolean>(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
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
  
  const handleAddExpense = async () => {
    if (!newExpense.description.trim()) {
      toast.error('Por favor, ingrese una descripción para el gasto');
      return;
    }
    
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Por favor, ingrese un monto válido');
      return;
    }
    
    try {
      const expense = {
        description: newExpense.description,
        amount,
        date: new Date()
      };
      
      await storeExpense(expense);
      
      setNewExpense({ description: '', amount: '' });
      setShowAddExpense(false);
      toast.success('Gasto registrado correctamente');
      
      // Reload metrics to update the expenses
      await loadMetrics();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Error al registrar el gasto');
    }
  };
  
  // Render the expenses card for daily view
  const renderExpensesCard = () => {
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    
    return (
      <Card>
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-md">Gastos del día</CardTitle>
          {!showAddExpense && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddExpense(true)}
              className="h-8 px-2"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Añadir
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {showAddExpense ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="expense-desc">Descripción</Label>
                <Input 
                  id="expense-desc" 
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej: Compra de detergente"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="expense-amount">Monto</Label>
                <Input 
                  id="expense-amount" 
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Ej: 5000"
                  type="number"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowAddExpense(false);
                    setNewExpense({ description: '', amount: '' });
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  size="sm"
                  onClick={handleAddExpense}
                >
                  Guardar
                </Button>
              </div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No hay gastos registrados para este día
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{expense.description}</span>
                  <span className="font-medium text-destructive">{formatCurrency(expense.amount)}</span>
                </div>
              ))}
              
              <Separator className="my-1" />
              
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold">Total Gastos</span>
                <span className="font-bold text-destructive">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
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
            <Tabs value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)} className="w-full">
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
          </div>
          
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
              {timeFrame === 'daily' && formatDate(selectedDate)}
              {timeFrame === 'weekly' && `Semana del ${formatDate(
                (() => {
                  const startOfWeek = new Date(selectedDate);
                  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
                  return startOfWeek;
                })()
              )}`}
              {timeFrame === 'monthly' && selectedDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDateChange(1)}
              disabled={
                timeFrame === 'daily' && 
                selectedDate.getDate() === new Date().getDate() && 
                selectedDate.getMonth() === new Date().getMonth() && 
                selectedDate.getFullYear() === new Date().getFullYear()
              }
            >
              Siguiente
            </Button>
          </div>
          
          <TabsContent value="daily" className="mt-0 space-y-4">
            <MetricsVisualization 
              timeFrame="daily" 
              metrics={dailyMetrics || { 
                totalValets: 0, 
                totalSales: 0, 
                paymentBreakdown: { cash: 0, debit: 0, mercadopago: 0, cuentadni: 0 },
                dryCleaningItems: []
              }}
              formatCurrency={formatCurrency}
            />
            {timeFrame === 'daily' && renderExpensesCard()}
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-0 space-y-4">
            <MetricsVisualization 
              timeFrame="weekly" 
              metrics={weeklyMetrics || { 
                totalValets: 0, 
                totalSales: 0, 
                paymentBreakdown: { cash: 0, debit: 0, mercadopago: 0, cuentadni: 0 },
                dailyBreakdown: [],
                dryCleaningItems: []
              }}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-0 space-y-4">
            <MetricsVisualization 
              timeFrame="monthly" 
              metrics={monthlyMetrics || { 
                totalValets: 0, 
                totalSales: 0, 
                paymentBreakdown: { cash: 0, debit: 0, mercadopago: 0, cuentadni: 0 },
                weeklyBreakdown: [],
                dryCleaningItems: []
              }}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsPanel;
