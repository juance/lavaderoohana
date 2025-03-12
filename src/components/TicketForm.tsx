
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Phone, 
  ShoppingBag, 
  ArrowRight, 
  Plus, 
  Minus 
} from 'lucide-react';
import { toast } from 'sonner';
import Ticket from './Ticket';

interface Customer {
  name: string;
  phone: string;
  valetQuantity: number;
  total: number;
}

const VALET_PRICE = 5000;

const TicketForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [valetQuantity, setValetQuantity] = useState<number>(1);
  const [showTicket, setShowTicket] = useState<boolean>(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhone(value);
  };

  const decreaseQuantity = () => {
    if (valetQuantity > 1) {
      setValetQuantity(prev => prev - 1);
    }
  };

  const increaseQuantity = () => {
    setValetQuantity(prev => prev + 1);
  };

  const calculateTotal = () => {
    return valetQuantity * VALET_PRICE;
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setValetQuantity(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor, ingresa el nombre del cliente');
      return;
    }

    if (!phone.trim() || phone.length < 8) {
      toast.error('Por favor, ingresa un número de teléfono válido');
      return;
    }

    const customerData: Customer = {
      name,
      phone,
      valetQuantity,
      total: calculateTotal()
    };

    setCustomer(customerData);
    setShowTicket(true);
    toast.success('¡Ticket generado con éxito!');
  };

  const newTicket = () => {
    setShowTicket(false);
    resetForm();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!showTicket ? (
        <Card className="border-0 shadow-lg shadow-laundry-200/20 overflow-hidden animate-fade-in">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-laundry-500" />
                  Nombre del Cliente
                </Label>
                <Input
                  id="name"
                  placeholder="Ingrese nombre del cliente"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-laundry-200 focus:border-laundry-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-laundry-500" />
                  Número de Teléfono
                </Label>
                <Input
                  id="phone"
                  placeholder="Ingrese número telefónico"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="transition-all duration-200 focus:ring-2 focus:ring-laundry-200 focus:border-laundry-400"
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valet" className="text-sm font-medium flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-laundry-500" />
                  Cantidad de Valet
                </Label>
                <div className="flex items-center space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={decreaseQuantity}
                    className="h-9 w-9 rounded-full transition-all hover:bg-laundry-50 hover:text-laundry-600 hover:border-laundry-200"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      id="valet"
                      type="number"
                      value={valetQuantity}
                      onChange={(e) => setValetQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-center transition-all duration-200 focus:ring-2 focus:ring-laundry-200 focus:border-laundry-400"
                      min="1"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={increaseQuantity}
                    className="h-9 w-9 rounded-full transition-all hover:bg-laundry-50 hover:text-laundry-600 hover:border-laundry-200"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Precio por Valet:</span>
                  <span className="font-medium">{formatCurrency(VALET_PRICE)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="text-lg font-bold text-laundry-700">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-laundry-600 hover:bg-laundry-700 transition-all group"
              >
                Generar Ticket 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in">
          {customer && <Ticket customer={customer} onNewTicket={newTicket} />}
        </div>
      )}
    </div>
  );
};

export default TicketForm;
