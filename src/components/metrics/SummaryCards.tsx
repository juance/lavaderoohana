
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartBar, ChartPie } from 'lucide-react';
import { TimeFrame } from '@/utils/metricsTypes';

interface SummaryCardsProps {
  timeFrame: TimeFrame;
  totalValets: number;
  totalSales: number;
  formatCurrency: (amount: number) => string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  timeFrame,
  totalValets,
  totalSales,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <div className="text-muted-foreground text-sm flex items-center gap-1">
            <ChartBar className="h-3.5 w-3.5" />
            {timeFrame === 'daily' ? 'Valets' : 'Valets Totales'}
          </div>
          <div className="text-2xl font-bold mt-1">{totalValets}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <div className="text-muted-foreground text-sm flex items-center gap-1">
            <ChartPie className="h-3.5 w-3.5" />
            {timeFrame === 'daily' ? 'Ventas' : 'Ventas Totales'}
          </div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(totalSales)}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
