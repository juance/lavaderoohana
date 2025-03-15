import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart4,
  TrendingUp,
  TrendingDown,
  Diamond,
  Circle,
  ChartBar,
  ChartPie,
  Square,
  Triangle
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { TimeFrame, PaymentMethod, DailyMetrics, WeeklyMetrics, MonthlyMetrics } from '@/utils/metricsTypes';

type MetricsType = DailyMetrics | WeeklyMetrics | MonthlyMetrics;

interface MetricsVisualizationProps {
  timeFrame: TimeFrame;
  metrics: MetricsType;
  formatCurrency: (amount: number) => string;
}

const MetricsVisualization: React.FC<MetricsVisualizationProps> = ({
  timeFrame,
  metrics,
  formatCurrency
}) => {
  // Get chart data for time series visualization
  const getTimeSeriesChartData = () => {
    if (timeFrame === 'daily' || !metrics) {
      // For daily, we don't have a time-series chart
      return null;
    } else if (timeFrame === 'weekly' && metrics.dailyBreakdown) {
      const dailyData = metrics.dailyBreakdown;
      const labels = dailyData.map(day => 
        day.date.toLocaleDateString('es-AR', { weekday: 'short' })
      );
      
      return {
        labels,
        datasets: [
          {
            label: 'Ventas',
            data: dailyData.map(day => day.sales),
            borderColor: 'rgb(83, 123, 224)',
            backgroundColor: 'rgba(83, 123, 224, 0.5)',
          },
          {
            label: 'Valets',
            data: dailyData.map(day => day.valets * 5000), // Convert to money for scale
            borderColor: 'rgb(126, 105, 171)',
            backgroundColor: 'rgba(126, 105, 171, 0.5)',
          }
        ]
      };
    } else if (timeFrame === 'monthly' && metrics.weeklyBreakdown) {
      const weeklyData = metrics.weeklyBreakdown;
      const labels = weeklyData.map(week => `Semana ${week.weekNumber}`);
      
      return {
        labels,
        datasets: [
          {
            label: 'Ventas',
            data: weeklyData.map(week => week.sales),
            borderColor: 'rgb(83, 123, 224)',
            backgroundColor: 'rgba(83, 123, 224, 0.5)',
          },
          {
            label: 'Valets',
            data: weeklyData.map(week => week.valets * 5000), // Convert to money for scale
            borderColor: 'rgb(126, 105, 171)',
            backgroundColor: 'rgba(126, 105, 171, 0.5)',
          }
        ]
      };
    }
    
    return null;
  };
  
  // Get payment breakdown data
  const getPaymentBreakdownData = () => {
    if (!metrics) return null;
    
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

  // Render payment breakdown card
  const renderPaymentBreakdown = () => {
    if (!metrics) return null;
    
    return (
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-md">Desglose por método de pago</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {timeFrame === 'daily' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-green-600" />
                  <span>Efectivo</span>
                </div>
                <span className="font-medium">{formatCurrency(metrics.paymentBreakdown.cash)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4 text-blue-600" />
                  <span>Débito</span>
                </div>
                <span className="font-medium">{formatCurrency(metrics.paymentBreakdown.debit)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Triangle className="h-4 w-4 text-blue-500" />
                  <span>Mercado Pago</span>
                </div>
                <span className="font-medium">{formatCurrency(metrics.paymentBreakdown.mercadopago)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Diamond className="h-4 w-4 text-yellow-600" />
                  <span>Cuenta DNI</span>
                </div>
                <span className="font-medium">{formatCurrency(metrics.paymentBreakdown.cuentadni)}</span>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold">Total</span>
                <span className="font-bold">{formatCurrency(metrics.totalSales)}</span>
              </div>
            </div>
          ) : (
            <div className="h-64">
              <Bar data={getPaymentBreakdownData()} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render time series chart (weekly or monthly)
  const renderTimeSeriesChart = () => {
    if (timeFrame === 'daily' || !metrics) return null;
    
    const chartData = getTimeSeriesChartData();
    if (!chartData) return null;
    
    return (
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-md">
            {timeFrame === 'weekly' ? 'Ventas por día' : 'Ventas por semana'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-64 w-full">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render summary cards
  const renderSummaryCards = () => {
    if (!metrics) return null;
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-muted-foreground text-sm flex items-center gap-1">
              <ChartBar className="h-3.5 w-3.5" />
              {timeFrame === 'daily' ? 'Valets' : 'Valets Totales'}
            </div>
            <div className="text-2xl font-bold mt-1">{metrics.totalValets}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="text-muted-foreground text-sm flex items-center gap-1">
              <ChartPie className="h-3.5 w-3.5" />
              {timeFrame === 'daily' ? 'Ventas' : 'Ventas Totales'}
            </div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(metrics.totalSales)}</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!metrics) {
    return (
      <div className="flex justify-center items-center p-12">
        <p className="text-muted-foreground">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderSummaryCards()}
      {renderTimeSeriesChart()}
      {renderPaymentBreakdown()}
    </div>
  );
};

export default MetricsVisualization;
