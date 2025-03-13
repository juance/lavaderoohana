
import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermission } from '@/utils/authService';
import { Permission } from '@/utils/userTypes';

interface PermissionCheckerProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionChecker: React.FC<PermissionCheckerProps> = ({ 
  permission,
  children,
  fallback = <Navigate to="/" replace />
}) => {
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default PermissionChecker;
