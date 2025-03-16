
import React from 'react';
import { Coins, CreditCard, TrendingUp } from 'lucide-react';
import MetricsCard from './MetricsCard';
import { TimeFrame } from '@/utils/metricsTypes';

interface SummaryCardsProps {
  timeFrame: TimeFrame;
  totalRevenue: number;
  cashRevenue: number;
  digitalRevenue: number;
  valetCount: number;
  comparisonTrend: {
    revenue: number;
    valets: number;
    cash: number;
    digital: number;
  };
  formatCurrency: (amount: number) => string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  timeFrame,
  totalRevenue,
  cashRevenue,
  digitalRevenue,
  valetCount,
  comparisonTrend,
  formatCurrency
}) => {
  return (
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
        description={`${timeFrame === 'daily' ? 'Today' : timeFrame === 'weekly' ? 'This week' : 'this month'}'s cash revenue`}
        trend={{ value: comparisonTrend.cash, isPositive: comparisonTrend.cash >= 0 }}
        icon={<Coins className="h-6 w-6" />}
      />
      
      <MetricsCard
        title="Digital Payments"
        value={formatCurrency(digitalRevenue)}
        description={`${timeFrame === 'daily' ? 'Today' : timeFrame === 'weekly' ? 'this week' : 'this month'}'s digital revenue`}
        trend={{ value: comparisonTrend.digital, isPositive: comparisonTrend.digital >= 0 }}
        icon={<CreditCard className="h-6 w-6" />}
      />
    </div>
  );
};

export default SummaryCards;
