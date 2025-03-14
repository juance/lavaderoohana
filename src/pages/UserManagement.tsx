
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getCurrentUser, hasPermission, updateUserPermissions, addUser, deleteUser, getAllUsers } from '@/utils/authService';
import { User, Permission, UserRole, NewUserData } from '@/utils/userTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import LaundryHeader from '@/components/LaundryHeader';
import { UserCog, UserPlus, ArrowLeft, Trash2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<NewUserData>({
    username: '',
    password: '',
    role: 'staff' as UserRole,
    permissions: []
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editPassword, setEditPassword] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // If not admin, redirect to home
  if (!hasPermission('users.manage')) {
    return <Navigate to="/" replace />;
  }
  
  // Get users from localStorage
  useEffect(() => {
    setUsers(getAllUsers());
  }, []);
  
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = addUser(newUser);
      
      toast({
        title: "Usuario creado",
        description: `El usuario ${user.username} ha sido creado exitosamente.`,
      });
      
      // Update local state
      setUsers([...users, user]);
      
      // Reset form
      setNewUser({
        username: '',
        password: '',
        role: 'staff' as UserRole,
        permissions: []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el usuario.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteUser = (userId: string) => {
    // Check if trying to delete admin1 (main admin)
    if (userId === '1') {
      toast({
        title: "Error",
        description: "No se puede eliminar al administrador principal.",
        variant: "destructive",
      });
      return;
    }
    
    const success = deleteUser(userId);
    
    if (success) {
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      // If the deleted user was selected, clear selection
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(null);
      }
      
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateUserInfo = () => {
    if (!selectedUser) return;
    
    if (editPassword && editPassword.length > 0) {
      // Update user object with new password
      const updatedUser = {
        ...selectedUser,
        password: editPassword
      };
      
      // Find user index
      const userIndex = users.findIndex(u => u.id === selectedUser.id);
      if (userIndex !== -1) {
        // Create a new users array with the updated user
        const updatedUsers = [...users];
        updatedUsers[userIndex] = updatedUser;
        
        // Save to localStorage
        localStorage.setItem('laundry_users', JSON.stringify(updatedUsers));
        
        // Update state
        setUsers(updatedUsers);
        setSelectedUser(updatedUser);
        
        toast({
          title: "Contraseña actualizada",
          description: `La contraseña de ${updatedUser.username} ha sido actualizada.`,
        });
      }
    }
    
    setEditMode(false);
    setEditPassword('');
  };
  
  const handleUpdatePermissions = (userId: string, permission: Permission, checked: boolean) => {
    if (!selectedUser) return;
    
    let newPermissions = [...selectedUser.permissions];
    
    if (checked) {
      newPermissions.push(permission);
    } else {
      newPermissions = newPermissions.filter(p => p !== permission);
    }
    
    const updatedUser = updateUserPermissions(userId, newPermissions);
    
    if (updatedUser) {
      // Update local state
      setSelectedUser(updatedUser);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      
      toast({
        title: "Permisos actualizados",
        description: `Los permisos de ${updatedUser.username} han sido actualizados.`,
      });
    }
  };
  
  const handleUpdateRole = (role: UserRole) => {
    if (!selectedUser) return;
    
    // Find user index
    const userIndex = users.findIndex(u => u.id === selectedUser.id);
    if (userIndex !== -1) {
      // Create a new user object with updated role
      const updatedUser = {
        ...selectedUser,
        role
      };
      
      // Create a new users array with the updated user
      const updatedUsers = [...users];
      updatedUsers[userIndex] = updatedUser;
      
      // Save to localStorage
      localStorage.setItem('laundry_users', JSON.stringify(updatedUsers));
      
      // Update state
      setUsers(updatedUsers);
      setSelectedUser(updatedUser);
      
      toast({
        title: "Rol actualizado",
        description: `El rol de ${updatedUser.username} ha sido cambiado a ${role === 'admin' ? 'Administrador' : 'Personal'}.`,
      });
    }
  };
  
  const allPermissions: { value: Permission; label: string }[] = [
    { value: 'tickets.view', label: 'Ver tickets' },
    { value: 'tickets.create', label: 'Crear tickets' },
    { value: 'tickets.edit', label: 'Editar tickets' },
    { value: 'metrics.view', label: 'Ver métricas' },
    { value: 'inventory.view', label: 'Ver inventario' },
    { value: 'inventory.edit', label: 'Editar inventario' },
    { value: 'orders.view', label: 'Ver pedidos a retirar' },
    { value: 'users.manage', label: 'Gestionar usuarios' }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 px-4 py-12">
      <div className="container max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-laundry-600 hover:text-laundry-700">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>
          <LaundryHeader />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <UserCog className="h-6 w-6 text-laundry-600" />
            Gestión de Usuarios
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Usuarios Existentes</h3>
              <div className="space-y-4">
                {users.map((user) => (
                  <div 
                    key={user.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? 'border-laundry-500 bg-laundry-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1" onClick={() => {
                        setSelectedUser(user);
                        setEditMode(false); // Exit edit mode when selecting a different user
                      }}>
                        <span className="font-medium">{user.username}</span>
                        <Badge className="ml-2" variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Administrador' : 'Personal'}
                        </Badge>
                        {user.id === '1' && (
                          <Badge variant="outline" className="ml-1">Principal</Badge>
                        )}
                      </div>
                      
                      {user.id !== '1' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el usuario {user.username}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {user.permissions.slice(0, 3).map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {allPermissions.find(p => p.value === perm)?.label || perm}
                        </Badge>
                      ))}
                      {user.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.permissions.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              {selectedUser ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">
                      {editMode ? "Editar Usuario: " : "Editar Permisos: "}{selectedUser.username}
                    </h3>
                    {!editMode && (
                      <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                        Editar Usuario
                      </Button>
                    )}
                  </div>
                  
                  {editMode ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-username">Nombre de usuario</Label>
                        <Input
                          id="edit-username"
                          value={selectedUser.username}
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-password">Nueva contraseña</Label>
                        <Input
                          id="edit-password"
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Ingrese nueva contraseña"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tipo de Usuario</Label>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="edit-role-staff"
                              checked={selectedUser.role === 'staff'}
                              onChange={() => handleUpdateRole('staff')}
                              disabled={selectedUser.id === '1'} // Disable for admin1
                            />
                            <Label htmlFor="edit-role-staff">Personal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="edit-role-admin"
                              checked={selectedUser.role === 'admin'}
                              onChange={() => handleUpdateRole('admin')}
                              disabled={selectedUser.id === '1'} // Disable for admin1
                            />
                            <Label htmlFor="edit-role-admin">Administrador</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex gap-2">
                        <Button 
                          onClick={handleUpdateUserInfo}
                          className="flex items-center gap-2 bg-laundry-600 hover:bg-laundry-700"
                        >
                          <Save className="h-4 w-4" />
                          Guardar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditMode(false);
                            setEditPassword('');
                          }}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allPermissions.map((permission) => (
                        <div key={permission.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`perm-${permission.value}`} 
                            checked={selectedUser.permissions.includes(permission.value)}
                            disabled={selectedUser.id === '1' && permission.value === 'users.manage'} // Disable removing users.manage from admin1
                            onCheckedChange={(checked) => 
                              handleUpdatePermissions(selectedUser.id, permission.value, checked === true)
                            }
                          />
                          <Label htmlFor={`perm-${permission.value}`}>
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <UserPlus className="h-5 w-5 text-laundry-600" />
                    Agregar Nuevo Usuario
                  </h3>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-username">Nombre de usuario</Label>
                      <Input
                        id="new-username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Contraseña</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tipo de Usuario</Label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="role-staff"
                            value="staff"
                            checked={newUser.role === 'staff'}
                            onChange={() => setNewUser({...newUser, role: 'staff'})}
                          />
                          <Label htmlFor="role-staff">Personal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="role-admin"
                            value="admin"
                            checked={newUser.role === 'admin'}
                            onChange={() => setNewUser({...newUser, role: 'admin' as UserRole})}
                          />
                          <Label htmlFor="role-admin">Administrador</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button type="submit" className="bg-laundry-600 hover:bg-laundry-700">
                        Agregar Usuario
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
