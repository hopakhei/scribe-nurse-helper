import { useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuth';
import { Loader2, Shield } from 'lucide-react';
import { AndroidLayout } from '@/components/AndroidLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuthState();

  console.log('ProtectedRoute render:', { user: !!user, loading });

  // Redirect to auth if not authenticated
  useEffect(() => {
    console.log('ProtectedRoute auth check:', { user: !!user, loading });
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      console.log('Redirecting to auth, storing path:', currentPath);
      // Store the intended destination for redirect after login
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      window.location.href = '/auth';
    }
  }, [user, loading]);

  if (loading) {
    console.log('ProtectedRoute: showing loading state');
    return (
      <AndroidLayout>
        <ErrorBoundary>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 text-primary mx-auto" />
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </ErrorBoundary>
      </AndroidLayout>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: no user, showing redirect message');
    return (
      <AndroidLayout>
        <ErrorBoundary>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-muted-foreground">Redirecting to login...</p>
            </div>
          </div>
        </ErrorBoundary>
      </AndroidLayout>
    );
  }

  console.log('ProtectedRoute: user authenticated, rendering children');
  return <ErrorBoundary>{children}</ErrorBoundary>;
};