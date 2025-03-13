
export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed
  role: UserRole;
  permissions: Permission[];
}

export type Permission = 
  | 'tickets.view' 
  | 'tickets.create' 
  | 'tickets.edit'
  | 'metrics.view'
  | 'inventory.view'
  | 'inventory.edit'
  | 'orders.view'
  | 'users.manage';

export type LoginCredentials = {
  username: string;
  password: string;
};
