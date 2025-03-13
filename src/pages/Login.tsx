
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { login, getCurrentUser } from '@/utils/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import LaundryHeader from '@/components/LaundryHeader';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // If user is already logged in, redirect to home
  if (getCurrentUser()) {
    return <Navigate to="/" replace />;
  }
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const user = login({ username, password });
    
    if (user) {
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
      navigate('/');
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <LaundryHeader />
        
        <h2 className="text-2xl font-bold text-center mb-6">Ingreso al Sistema</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Nombre de usuario"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="**********"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-laundry-600 hover:bg-laundry-700"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Utilice alguno de los siguientes usuarios:</p>
          <p className="font-semibold">Admin: admin1, admin2, admin3</p>
          <p className="font-semibold">Staff: staff1</p>
          <p>Contraseña: igual que el usuario</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
