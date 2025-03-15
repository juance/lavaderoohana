
import React from 'react';
import { TimeFrame, DailyMetrics, WeeklyMetrics, MonthlyMetrics } from '@/utils/metricsTypes';
import SummaryCards from './SummaryCards';
import TimeSeriesChart from './TimeSeriesChart';
import PaymentBreakdown from './PaymentBreakdown';

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
  if (!metrics) {
    return (
      <div className="flex justify-center items-center p-12">
        <p className="text-muted-foreground">Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards for Valets and Total Sales */}
      <SummaryCards 
        timeFrame={timeFrame} 
        totalValets={metrics.totalValets} 
        totalSales={metrics.totalSales} 
        formatCurrency={formatCurrency} 
      />

      {/* Time Series Chart (weekly or monthly views) */}
      {timeFrame !== 'daily' && (
        <TimeSeriesChart 
          timeFrame={timeFrame} 
          metrics={metrics as WeeklyMetrics | MonthlyMetrics} 
        />
      )}

      {/* Payment Breakdown */}
      <PaymentBreakdown 
        timeFrame={timeFrame} 
        paymentBreakdown={metrics.paymentBreakdown} 
        totalSales={metrics.totalSales} 
        formatCurrency={formatCurrency} 
      />
    </div>
  );
};

export default MetricsVisualization;
