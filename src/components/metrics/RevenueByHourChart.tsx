
import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import ChartCard from './ChartCard';

interface RevenueByHourChartProps {
  revenueByHour: any;
  timeFrame: 'daily' | 'weekly' | 'monthly';
}

const RevenueByHourChart: React.FC<RevenueByHourChartProps> = ({ 
  revenueByHour, 
  timeFrame 
}) => {
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

  if (!revenueByHour) return null;

  return (
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
  );
};

export default RevenueByHourChart;
