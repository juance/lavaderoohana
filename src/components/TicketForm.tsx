import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  User, 
  Phone, 
  ShoppingBag, 
  ArrowRight, 
  Plus, 
  Minus,
  Banknote,
  CreditCard,
  Smartphone,
  Landmark,
  ChevronDown,
  ChevronUp,
  Shirt,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import Ticket from './Ticket';
import { storeTicketData } from '@/utils/dataStorage';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { dryCleaningServices, DryCleaningService } from '@/utils/dryCleaningServices';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateTicketNumber } from '@/utils/generateTicketNumber';

interface LaundryOptions {
  separateByColor: boolean;
  delicateDry: boolean;
  stainRemoval: boolean;
  bleach: boolean;
  noFragrance: boolean;
  noDry: boolean;
}

type PaymentMethod = 'cash' | 'debit' | 'mercadopago' | 'cuentadni';

interface DryCleaningItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Customer {
  name: string;
  phone: string;
  valetQuantity: number;
  laundryOptions: LaundryOptions;
  paymentMethod: PaymentMethod;
  total: number;
  date: Date;
  dryCleaningItems?: DryCleaningItem[];
  ticketNumber?: string;
}

const VALET_PRICE = 5000;

const TicketForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [valetQuantity, setValetQuantity] = useState<number>(1);
  const [showTicket, setShowTicket] = useState<boolean>(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [laundryOptions, setLaundryOptions] = useState<LaundryOptions>({
    separateByColor: false,
    delicateDry: false,
    stainRemoval: false,
    bleach: false,
    noFragrance: false,
    noDry: false
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isDryCleaningOpen, setIsDryCleaningOpen] = useState<boolean>(false);
  const [dryCleaningItems, setDryCleaningItems] = useState<DryCleaningItem[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [dryCleaningQuantity, setDryCleaningQuantity] = useState<number>(1);
  const [dryCleaningUnitValue, setDryCleaningUnitValue] = useState<number | null>(null);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotal = () => {
    // Calculate valet total
    let total = valetQuantity * VALET_PRICE;
    
    // Add dry cleaning items total
    if (dryCleaningItems.length > 0) {
      const dryCleaningTotal = dryCleaningItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      total += dryCleaningTotal;
    }
    
    return total;
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setValetQuantity(1);
    setLaundryOptions({
      separateByColor: false,
      delicateDry: false,
      stainRemoval: false,
      bleach: false,
      noFragrance: false,
      noDry: false
    });
    setPaymentMethod('cash');
    setDryCleaningItems([]);
    setSelectedService('');
    setDryCleaningQuantity(1);
    setDryCleaningUnitValue(null);
    setIsDryCleaningOpen(false);
  };

  const handleLaundryOptionChange = (option: keyof LaundryOptions) => {
    setLaundryOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    
    const service = dryCleaningServices.find(s => s.name === value);
    if (service) {
      // Set the default price based on the service
      if (service.price.desde && service.priceType === 'range') {
        // For range prices, default to the "desde" value
        setDryCleaningUnitValue(service.price.desde);
      } else {
        // For other price types, use the "hasta" value
        setDryCleaningUnitValue(service.price.hasta);
      }
    } else {
      setDryCleaningUnitValue(null);
    }
    
    setDryCleaningQuantity(1);
  };

  const addDryCleaningItem = () => {
    if (!selectedService || !dryCleaningUnitValue) {
      toast.error('Por favor, selecciona un servicio y establece un precio');
      return;
    }
    
    const newItem: DryCleaningItem = {
      id: Date.now().toString(),
      name: selectedService,
      price: dryCleaningUnitValue,
      quantity: dryCleaningQuantity
    };
    
    setDryCleaningItems(prev => [...prev, newItem]);
    
    // Reset selection for next item
    setSelectedService('');
    setDryCleaningUnitValue(null);
    setDryCleaningQuantity(1);
    
    toast.success('Servicio de tintorería agregado');
  };

  const removeDryCleaningItem = (id: string) => {
    setDryCleaningItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Por favor, ingresa el nombre del cliente');
      return;
    }

    if (!phone.trim() || phone.length < 8) {
      toast.error('Por favor, ingresa un número de teléfono válido');
      return;
    }

    try {
      const ticketNumber = generateTicketNumber();
      const currentDate = new Date();
      const customerData: Customer = {
        name,
        phone,
        valetQuantity,
        laundryOptions,
        paymentMethod,
        total: calculateTotal(),
        date: currentDate,
        dryCleaningItems: dryCleaningItems.length > 0 ? dryCleaningItems : undefined,
        ticketNumber
      };

      setCustomer(customerData);
      setShowTicket(true);
      
      // Store the customer data in Supabase
      await storeTicketData(customerData);
      
      toast.success('¡Ticket generado con éxito!');
    } catch (error) {
      console.error('Error storing ticket:', error);
      toast.error('Hubo un problema al guardar el ticket. Por favor intente nuevamente.');
    }
  };

  const newTicket = () => {
    setShowTicket(false);
    resetForm();
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

              <Collapsible
                open={isDryCleaningOpen}
                onOpenChange={setIsDryCleaningOpen}
                className="bg-slate-50 p-4 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-laundry-500" />
                    Servicios de Tintorería
                  </Label>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                      {isDryCleaningOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent className="space-y-4 mt-3">
                  <div className="space-y-2">
                    <Label htmlFor="dryCleaningService" className="text-xs">Servicio</Label>
                    <Select value={selectedService} onValueChange={handleServiceChange}>
                      <SelectTrigger id="dryCleaningService">
                        <SelectValue placeholder="Seleccionar servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {dryCleaningServices.map((service) => (
                          <SelectItem key={service.name} value={service.name}>
                            {service.name} {service.price.desde ? 
                              `(${formatCurrency(service.price.desde)} - ${formatCurrency(service.price.hasta)})` : 
                              `(${formatCurrency(service.price.hasta)})`
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="dryCleaningPrice" className="text-xs">Precio por unidad</Label>
                      <Input
                        id="dryCleaningPrice"
                        type="number"
                        value={dryCleaningUnitValue || ''}
                        onChange={(e) => setDryCleaningUnitValue(parseInt(e.target.value) || 0)}
                        placeholder="$0"
                        className="text-center"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dryCleaningQuantity" className="text-xs">Cantidad</Label>
                      <div className="flex items-center">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setDryCleaningQuantity(prev => Math.max(1, prev - 1))}
                          className="h-9 w-9 rounded-l-md rounded-r-none"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          id="dryCleaningQuantity"
                          type="number"
                          value={dryCleaningQuantity}
                          onChange={(e) => setDryCleaningQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="text-center rounded-none border-l-0 border-r-0"
                          min="1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setDryCleaningQuantity(prev => prev + 1)}
                          className="h-9 w-9 rounded-r-md rounded-l-none"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={addDryCleaningItem}
                    className="w-full"
                    disabled={!selectedService || !dryCleaningUnitValue}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Agregar a la lista
                  </Button>
                  
                  {dryCleaningItems.length > 0 && (
                    <div className="space-y-2 mt-3 border-t pt-3">
                      <h3 className="text-sm font-medium">Servicios agregados:</h3>
                      <div className="space-y-2">
                        {dryCleaningItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded-md">
                            <div>
                              <span className="text-sm font-medium">{item.name}</span>
                              <div className="text-xs text-gray-500">
                                {item.quantity} x {formatCurrency(item.price)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                onClick={() => removeDryCleaningItem(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between pt-2 text-sm font-medium">
                        <span>Subtotal tintorería:</span>
                        <span>{formatCurrency(dryCleaningItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <Label className="text-sm font-medium">Opciones de lavado:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="separateByColor" 
                      checked={laundryOptions.separateByColor}
                      onCheckedChange={() => handleLaundryOptionChange('separateByColor')}
                    />
                    <Label htmlFor="separateByColor" className="text-sm font-normal leading-tight">
                      1. Separar por color
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="delicateDry" 
                      checked={laundryOptions.delicateDry}
                      onCheckedChange={() => handleLaundryOptionChange('delicateDry')}
                    />
                    <Label htmlFor="delicateDry" className="text-sm font-normal leading-tight">
                      2. Secar en delicado
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="stainRemoval" 
                      checked={laundryOptions.stainRemoval}
                      onCheckedChange={() => handleLaundryOptionChange('stainRemoval')}
                    />
                    <Label htmlFor="stainRemoval" className="text-sm font-normal leading-tight">
                      3. Desmanchar
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="bleach" 
                      checked={laundryOptions.bleach}
                      onCheckedChange={() => handleLaundryOptionChange('bleach')}
                    />
                    <Label htmlFor="bleach" className="text-sm font-normal leading-tight">
                      4. Blanquear
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="noFragrance" 
                      checked={laundryOptions.noFragrance}
                      onCheckedChange={() => handleLaundryOptionChange('noFragrance')}
                    />
                    <Label htmlFor="noFragrance" className="text-sm font-normal leading-tight">
                      5. Sin perfume
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="noDry" 
                      checked={laundryOptions.noDry}
                      onCheckedChange={() => handleLaundryOptionChange('noDry')}
                    />
                    <Label htmlFor="noDry" className="text-sm font-normal leading-tight">
                      6. No secar
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <Label className="text-sm font-medium">Método de pago:</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-1.5 text-sm font-normal">
                        <Banknote className="h-3.5 w-3.5 text-green-600" />
                        Efectivo
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="debit" id="debit" />
                      <Label htmlFor="debit" className="flex items-center gap-1.5 text-sm font-normal">
                        <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                        Débito
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mercadopago" id="mercadopago" />
                      <Label htmlFor="mercadopago" className="flex items-center gap-1.5 text-sm font-normal">
                        <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                        Mercado Pago
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cuentadni" id="cuentadni" />
                      <Label htmlFor="cuentadni" className="flex items-center gap-1.5 text-sm font-normal">
                        <Landmark className="h-3.5 w-3.5 text-yellow-600" />
                        Cuenta DNI
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Precio por Valet:</span>
                  <span className="font-medium">{formatCurrency(VALET_PRICE)}</span>
                </div>
                
                {dryCleaningItems.length > 0 && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">Subtotal Tintorería:</span>
                    <span className="font-medium">
                      {formatCurrency(dryCleaningItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </span>
                  </div>
                )}
                
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
