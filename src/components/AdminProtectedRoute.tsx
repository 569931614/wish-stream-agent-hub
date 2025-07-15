import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAdminAuthenticated } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = isAdminAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "访问受限",
        description: "请先登录管理员账号",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
