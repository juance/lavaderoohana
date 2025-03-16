
import React from 'react';
import { Pie } from 'react-chartjs-2';
import ChartCard from './ChartCard';

interface ServiceDistributionChartProps {
  serviceDistribution: any;
}

const ServiceDistributionChart: React.FC<ServiceDistributionChartProps> = ({ serviceDistribution }) => {
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

  if (!serviceDistribution) return null;

  return (
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
  );
};

export default ServiceDistributionChart;
