
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from 'lucide-react';
import Dashboard from './metrics/Dashboard';

const MetricsPanel: React.FC = () => {
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
        <Dashboard />
      </CardContent>
    </Card>
  );
};

export default MetricsPanel;
