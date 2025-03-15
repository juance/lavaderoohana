import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Circle, Square, Triangle, Diamond } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { PaymentBreakdown as PaymentBreakdownType, TimeFrame } from '@/utils/metricsTypes';
import './chartSetup';

interface PaymentBreakdownProps {
  timeFrame: TimeFrame;
  paymentBreakdown: PaymentBreakdownType;
  totalSales: number;
  formatCurrency: (amount: number) => string;
}

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({
  timeFrame,
  paymentBreakdown,
  totalSales,
  formatCurrency
}) => {
  // Get payment breakdown data for the chart
  const getPaymentBreakdownData = () => {
    return {
      labels: ['Efectivo', 'Débito', 'Mercado Pago', 'Cuenta DNI'],
      datasets: [
        {
          data: [
            paymentBreakdown.cash,
            paymentBreakdown.debit,
            paymentBreakdown.mercadopago,
            paymentBreakdown.cuentadni
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
              <span className="font-medium">{formatCurrency(paymentBreakdown.cash)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4 text-blue-600" />
                <span>Débito</span>
              </div>
              <span className="font-medium">{formatCurrency(paymentBreakdown.debit)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Triangle className="h-4 w-4 text-blue-500" />
                <span>Mercado Pago</span>
              </div>
              <span className="font-medium">{formatCurrency(paymentBreakdown.mercadopago)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Diamond className="h-4 w-4 text-yellow-600" />
                <span>Cuenta DNI</span>
              </div>
              <span className="font-medium">{formatCurrency(paymentBreakdown.cuentadni)}</span>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{formatCurrency(totalSales)}</span>
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

export default PaymentBreakdown;
