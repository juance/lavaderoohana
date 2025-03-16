import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { storeExpense } from '@/utils/dataStorage';
import { Expense } from '@/utils/metricsTypes';

interface ExpensesCardProps {
  expenses: Expense[];
  formatCurrency: (amount: number) => string;
  onExpenseAdded: () => Promise<void>;
}

const ExpensesCard: React.FC<ExpensesCardProps> = ({ 
  expenses, 
  formatCurrency,
  onExpenseAdded 
}) => {
  const [showAddExpense, setShowAddExpense] = useState<boolean>(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  
  const handleAddExpense = async () => {
    if (!newExpense.description.trim()) {
      toast.error('Por favor, ingrese una descripción para el gasto');
      return;
    }
    
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Por favor, ingrese un monto válido');
      return;
    }
    
    try {
      const expense = {
        description: newExpense.description,
        amount,
        date: new Date()
      };
      
      await storeExpense(expense);
      
      setNewExpense({ description: '', amount: '' });
      setShowAddExpense(false);
      toast.success('Gasto registrado correctamente');
      
      // Reload metrics to update the expenses
      await onExpenseAdded();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Error al registrar el gasto');
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-md">Gastos del día</CardTitle>
        {!showAddExpense && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddExpense(true)}
            className="h-8 px-2"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Añadir
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {showAddExpense ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="expense-desc">Descripción</Label>
              <Input 
                id="expense-desc" 
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ej: Compra de detergente"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="expense-amount">Monto</Label>
              <Input 
                id="expense-amount" 
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Ej: 5000"
                type="number"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAddExpense(false);
                  setNewExpense({ description: '', amount: '' });
                }}
              >
                Cancelar
              </Button>
              <Button 
                size="sm"
                onClick={handleAddExpense}
              >
                Guardar
              </Button>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No hay gastos registrados para este día
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{expense.description}</span>
                <span className="font-medium text-destructive">{formatCurrency(expense.amount)}</span>
              </div>
            ))}
            
            <Separator className="my-1" />
            
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold">Total Gastos</span>
              <span className="font-bold text-destructive">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesCard;
