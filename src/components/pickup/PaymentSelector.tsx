
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Banknote, CreditCard, Smartphone, Landmark } from 'lucide-react';

export type PaymentMethod = 'cash' | 'debit' | 'mercadopago' | 'cuentadni';

interface PaymentSelectorProps {
  selectedPaymentMethod: PaymentMethod | null;
  handlePaymentMethodChange: (value: PaymentMethod) => void;
}

const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  selectedPaymentMethod,
  handlePaymentMethodChange
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Método de Pago</h3>
      <RadioGroup 
        value={selectedPaymentMethod || ''} 
        onValueChange={(value: PaymentMethod) => handlePaymentMethodChange(value)}
        className="grid grid-cols-2 gap-3"
      >
        <div className={`border rounded-lg p-3 ${selectedPaymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
          <RadioGroupItem value="cash" id="payment-cash" className="sr-only" />
          <label htmlFor="payment-cash" className="flex items-center gap-2 cursor-pointer">
            <Banknote className="h-5 w-5 text-green-600" />
            <span className="font-medium">Efectivo</span>
          </label>
        </div>
        
        <div className={`border rounded-lg p-3 ${selectedPaymentMethod === 'debit' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <RadioGroupItem value="debit" id="payment-debit" className="sr-only" />
          <label htmlFor="payment-debit" className="flex items-center gap-2 cursor-pointer">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Débito FC</span>
          </label>
        </div>
        
        <div className={`border rounded-lg p-3 ${selectedPaymentMethod === 'mercadopago' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
          <RadioGroupItem value="mercadopago" id="payment-mp" className="sr-only" />
          <label htmlFor="payment-mp" className="flex items-center gap-2 cursor-pointer">
            <Smartphone className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Mercado Pago FC</span>
          </label>
        </div>
        
        <div className={`border rounded-lg p-3 ${selectedPaymentMethod === 'cuentadni' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}>
          <RadioGroupItem value="cuentadni" id="payment-cuentadni" className="sr-only" />
          <label htmlFor="payment-cuentadni" className="flex items-center gap-2 cursor-pointer">
            <Landmark className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Cuenta DNI FC</span>
          </label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentSelector;
