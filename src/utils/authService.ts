
import { User, LoginCredentials, Permission } from './userTypes';

// Initial admin users
const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin1',
    password: 'admin1',
    role: 'admin',
    permissions: ['tickets.view', 'tickets.create', 'tickets.edit', 'metrics.view', 'inventory.view', 'inventory.edit', 'orders.view', 'users.manage']
  },
  {
    id: '2',
    username: 'admin2',
    password: 'admin2',
    role: 'admin',
    permissions: ['tickets.view', 'tickets.create', 'tickets.edit', 'metrics.view', 'inventory.view', 'inventory.edit', 'orders.view', 'users.manage']
  },
  {
    id: '3',
    username: 'admin3',
    password: 'admin3',
    role: 'admin',
    permissions: ['tickets.view', 'tickets.create', 'tickets.edit', 'metrics.view', 'inventory.view', 'inventory.edit', 'orders.view', 'users.manage']
  },
  {
    id: '4',
    username: 'staff1',
    password: 'staff1',
    role: 'staff',
    permissions: ['tickets.view', 'tickets.create']
  }
];

// Get users from localStorage or use initial users
const getUsers = (): User[] => {
  const storedUsers = localStorage.getItem('laundry_users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  } else {
    localStorage.setItem('laundry_users', JSON.stringify(initialUsers));
    return initialUsers;
  }
};

// Save users to localStorage
const saveUsers = (users: User[]): void => {
  localStorage.setItem('laundry_users', JSON.stringify(users));
};

// Login function
export const login = (credentials: LoginCredentials): User | null => {
  const users = getUsers();
  const user = users.find(
    (u) => u.username === credentials.username && u.password === credentials.password
  );
  
  if (user) {
    // Store current user in session
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  
  return null;
};

// Logout function
export const logout = (): void => {
  sessionStorage.removeItem('currentUser');
};

// Get current logged in user
export const getCurrentUser = (): User | null => {
  const userJson = sessionStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

// Check if user has permission
export const hasPermission = (permission: Permission): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  return currentUser.permissions.includes(permission);
};

// Add a new user (admin only)
export const addUser = (newUser: Omit<User, 'id'>): User => {
  const users = getUsers();
  const id = (users.length + 1).toString();
  
  const user: User = {
    ...newUser,
    id
  };
  
  users.push(user);
  saveUsers(users);
  
  return user;
};

// Update user permissions
export const updateUserPermissions = (userId: string, permissions: Permission[]): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return null;
  
  users[userIndex].permissions = permissions;
  saveUsers(users);
  
  // If updating the current user, update session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    sessionStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
  }
  
  return users[userIndex];
};
