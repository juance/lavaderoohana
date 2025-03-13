import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays, 
  CalendarIcon, 
  LineChart, 
  BarChart4, 
  DollarSign,
  ShoppingBag,
  Banknote,
  CreditCard,
  Smartphone,
  Landmark,
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
import {
  Chart,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

Chart.register(
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

type TimeFrame = 'daily' | 'weekly' | 'monthly';

const MetricsPanel: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddExpense, setShowAddExpense] = useState<boolean>(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  
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
  
  const handleAddExpense = () => {
    if (!newExpense.description.trim()) {
      toast.error('Por favor, ingrese una descripción para el gasto');
      return;
    }
    
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Por favor, ingrese un monto válido');
      return;
    }
    
    storeExpense({
      description: newExpense.description,
      amount,
      date: new Date()
    });
    
    setNewExpense({ description: '', amount: '' });
    setShowAddExpense(false);
    toast.success('Gasto registrado correctamente');
  };
  
  // Get metrics based on timeframe
  const getDailyData = () => {
    const metrics = getDailyMetrics(selectedDate);
    return metrics;
  };
  
  const getWeeklyData = () => {
    const metrics = getWeeklyMetrics(selectedDate);
    return metrics;
  };
  
  const getMonthlyData = () => {
    const metrics = getMonthlyMetrics(selectedDate);
    return metrics;
  };
  
  // Get chart data
  const getChartData = () => {
    if (timeFrame === 'daily') {
      // For daily, we don't have a time-series chart
      return null;
    } else if (timeFrame === 'weekly') {
      const metrics = getWeeklyMetrics(selectedDate);
      const labels = metrics.dailyBreakdown.map(day => 
        day.date.toLocaleDateString('es-AR', { weekday: 'short' })
      );
      
      return {
        labels,
        datasets: [
          {
            label: 'Ventas',
            data: metrics.dailyBreakdown.map(day => day.sales),
            borderColor: 'rgb(83, 123, 224)',
            backgroundColor: 'rgba(83, 123, 224, 0.5)',
          },
          {
            label: 'Valets',
            data: metrics.dailyBreakdown.map(day => day.valets * 5000), // Convert to money for scale
            borderColor: 'rgb(126, 105, 171)',
            backgroundColor: 'rgba(126, 105, 171, 0.5)',
          }
        ]
      };
    } else {
      const metrics = getMonthlyMetrics(selectedDate);
      const labels = metrics.weeklyBreakdown.map(week => `Semana ${week.weekNumber}`);
      
      return {
        labels,
        datasets: [
          {
            label: 'Ventas',
            data: metrics.weeklyBreakdown.map(week => week.sales),
            borderColor: 'rgb(83, 123, 224)',
            backgroundColor: 'rgba(83, 123, 224, 0.5)',
          },
          {
            label: 'Valets',
            data: metrics.weeklyBreakdown.map(week => week.valets * 5000), // Convert to money for scale
            borderColor: 'rgb(126, 105, 171)',
            backgroundColor: 'rgba(126, 105, 171, 0.5)',
          }
        ]
      };
    }
  };
  
  // Get payment breakdown data
  const getPaymentBreakdownData = () => {
    let metrics;
    if (timeFrame === 'daily') {
      metrics = getDailyMetrics(selectedDate);
    } else if (timeFrame === 'weekly') {
      metrics = getWeeklyMetrics(selectedDate);
    } else {
      metrics = getMonthlyMetrics(selectedDate);
    }
    
    return {
      labels: ['Efectivo', 'Débito', 'Mercado Pago', 'Cuenta DNI'],
      datasets: [
        {
          data: [
            metrics.paymentBreakdown.cash,
            metrics.paymentBreakdown.debit,
            metrics.paymentBreakdown.mercadopago,
            metrics.paymentBreakdown.cuentadni
          ],
          backgroundColor: [
            'rgba(83, 184, 127, 0.6)',
            'rgba(83, 123, 224, 0.6)',
            'rgba(90, 189, 235, 0.6)',
            'rgba(247, 199, 88, 0.6)'
          ],
          borderColor: [
            'rgba(83, 184, 127, 1)',
            'rgba(83, 123, 224, 1)',
            'rgba(90, 189, 235, 1)',
            'rgba(247, 199, 88, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Render timeframe specific metrics
  const renderMetrics = () => {
    if (timeFrame === 'daily') {
      const metrics = getDailyData();
      const expenses = getStoredExpenses().filter(expense => {
        const expenseDate = expense.date;
        return expenseDate.getDate() === selectedDate.getDate() &&
               expenseDate.getMonth() === selectedDate.getMonth() &&
               expenseDate.getFullYear() === selectedDate.getFullYear();
      });
      
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="text-muted-foreground text-sm flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Valets
                </div>
                <div className="text-2xl font-bold mt-1">{metrics.totalValets}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="text-muted-foreground text-sm flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  Ventas
                </div>
                <div className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalSales)}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-md">Desglose por método de pago</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-green-600" />
                    <span>Efectivo</span>
                  </div>
                  <span className="font-medium">{formatCurrency(metrics.paymentBreakdown.cash)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span>Débito</span>
                  </div>
                  <span className="font-medium">{formatCurrency(metrics.paymentBreakdown.debit)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-500" />
                    <span>Mercado Pago</span>
                  </div>
                  <span className="font-medium">{formatCurrency(metrics.paymentBreakdown.mercadopago)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-yellow-600" />
                    <span>Cuenta DNI</span>
                  </div>
                  <span className="font-medium">{formatCurrency(metrics.paymentBreakdown.cuentadni)}</span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold">Total</span>
                <span className="font-bold">{formatCurrency(metrics.totalSales)}</span>
              </div>
            </CardContent>
          </Card>
          
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
                      {formatCurrency(expenses.reduce((total, expense) => total + expense.amount, 0))}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    } else if (timeFrame === 'weekly') {
      const metrics = getWeeklyData();
      const chartData = getChartData();
      
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="text-muted-foreground text-sm flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Valets Totales
                </div>
                <div className="text-2xl font-bold mt-1">{metrics.totalValets}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="text-muted-foreground text-sm flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  Ventas Totales
                </div>
                <div className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalSales)}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-md">Ventas por día</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {chartData && <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-md">Desglose por método de pago</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 h-64">
              <Bar data={getPaymentBreakdownData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>
        </div>
      );
    } else {
      const metrics = getMonthlyData();
      const chartData = getChartData();
      
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="text-muted-foreground text-sm flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Valets Totales
                </div>
                <div className="text-2xl font-bold mt-1">{metrics.totalValets}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="text-muted-foreground text-sm flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  Ventas Totales
                </div>
                <div className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalSales)}</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-md">Ventas por semana</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {chartData && <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-md">Desglose por método de pago</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 h-64">
              <Bar data={getPaymentBreakdownData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>
        </div>
      );
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
            {renderMetrics()}
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-0 space-y-4">
            {renderMetrics()}
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-0 space-y-4">
            {renderMetrics()}
          </TabsContent>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsPanel;
