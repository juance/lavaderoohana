
import React, { useState, useEffect } from 'react';
import { 
  getInventoryItems, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  getLowInventoryItems
} from '@/utils/inventoryStorage';
import { InventoryItem, InventoryItemInput } from '@/utils/inventoryTypes';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Inventory: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<InventoryItemInput>({
    name: '',
    quantity: 0,
    minQuantity: 0,
    unit: 'unidades'
  });

  // Load inventory data
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = () => {
    const items = getInventoryItems();
    setInventoryItems(items);
    setLowStockItems(getLowInventoryItems());
  };

  const handleAddItem = () => {
    try {
      if (!newItem.name.trim()) {
        toast.error("El nombre del producto es obligatorio");
        return;
      }

      addInventoryItem(newItem);
      setNewItem({
        name: '',
        quantity: 0,
        minQuantity: 0,
        unit: 'unidades'
      });
      
      toast.success("Producto agregado exitosamente");
      loadInventoryData();
      setFormOpen(false);
    } catch (error) {
      toast.error("Error al agregar el producto");
    }
  };

  const handleUpdateItem = () => {
    try {
      if (!editingItem) return;
      
      updateInventoryItem(editingItem);
      setEditingItem(null);
      toast.success("Producto actualizado exitosamente");
      loadInventoryData();
    } catch (error) {
      toast.error("Error al actualizar el producto");
    }
  };

  const handleDeleteItem = (id: string) => {
    try {
      deleteInventoryItem(id);
      toast.success("Producto eliminado exitosamente");
      loadInventoryData();
    } catch (error) {
      toast.error("Error al eliminar el producto");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Link>
          <h1 className="text-2xl font-bold ml-4">Gestión de Inventario</h1>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-laundry-600 hover:bg-laundry-700">
              <Plus className="h-4 w-4 mr-2" /> Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Ej: Detergente"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    min="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unidad</Label>
                  <Input
                    id="unit"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="Ej: kg, L, unidades"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minQuantity">Cantidad Mínima</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={newItem.minQuantity}
                  onChange={(e) => setNewItem({ ...newItem, minQuantity: Number(e.target.value) })}
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Se mostrará una alerta cuando el stock sea igual o menor a este valor
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleAddItem}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Productos con Bajo Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="outline" className="bg-white border-orange-200 text-orange-700">
                  {item.name}: {item.quantity} {item.unit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Última Actualización</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No hay productos en el inventario
                </TableCell>
              </TableRow>
            ) : (
              inventoryItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-laundry-500" />
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={item.quantity <= item.minQuantity ? "text-red-600 font-medium" : ""}>
                      {item.quantity} {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>{item.minQuantity} {item.unit}</TableCell>
                  <TableCell>{formatDate(item.lastUpdated)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditingItem(item)}
                            className="px-2 h-8"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Producto</DialogTitle>
                          </DialogHeader>
                          {editingItem && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Nombre del Producto</Label>
                                <Input
                                  id="edit-name"
                                  value={editingItem.name}
                                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-quantity">Cantidad</Label>
                                  <Input
                                    id="edit-quantity"
                                    type="number"
                                    value={editingItem.quantity}
                                    onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                                    min="0"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="edit-unit">Unidad</Label>
                                  <Input
                                    id="edit-unit"
                                    value={editingItem.unit}
                                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-minQuantity">Cantidad Mínima</Label>
                                <Input
                                  id="edit-minQuantity"
                                  type="number"
                                  value={editingItem.minQuantity}
                                  onChange={(e) => setEditingItem({ ...editingItem, minQuantity: Number(e.target.value) })}
                                  min="0"
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button onClick={handleUpdateItem}>Guardar Cambios</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="px-2 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente el producto "{item.name}" del inventario.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteItem(item.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Inventory;
