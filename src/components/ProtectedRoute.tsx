import { useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuth';
import { Loader2, Shield } from 'lucide-react';
import { AndroidLayout } from '@/components/AndroidLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuthState();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      // Store the intended destination for redirect after login
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      window.location.href = '/auth';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <AndroidLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AndroidLayout>
    );
  }

  if (!user) {
    return (
      <AndroidLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-muted-foreground">Redirecting to login...</p>
          </div>
        </div>
      </AndroidLayout>
    );
  }

  return <>{children}</>;
};