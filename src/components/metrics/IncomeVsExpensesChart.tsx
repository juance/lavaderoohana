
import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import ChartCard from './ChartCard';

interface IncomeVsExpensesChartProps {
  incomeVsExpenses: any;
}

const IncomeVsExpensesChart: React.FC<IncomeVsExpensesChartProps> = ({ incomeVsExpenses }) => {
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

  if (!incomeVsExpenses) return null;

  return (
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
  );
};

export default IncomeVsExpensesChart;
