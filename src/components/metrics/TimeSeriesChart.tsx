import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import { TimeFrame, WeeklyMetrics, MonthlyMetrics } from '@/utils/metricsTypes';
import './chartSetup';

type MetricsWithBreakdown = WeeklyMetrics | MonthlyMetrics;

interface TimeSeriesChartProps {
  timeFrame: TimeFrame;
  metrics: MetricsWithBreakdown;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  timeFrame,
  metrics
}) => {
  // Get chart data for time series visualization
  const getTimeSeriesChartData = () => {
    if (timeFrame === 'weekly' && 'dailyBreakdown' in metrics) {
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
    } else if (timeFrame === 'monthly' && 'weeklyBreakdown' in metrics) {
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

export default TimeSeriesChart;
