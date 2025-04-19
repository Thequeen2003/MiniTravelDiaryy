import { useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/lib/protected-route';
import NotFound from '@/pages/not-found';
import Landing from '@/pages/landing';
import Dashboard from '@/pages/dashboard';
import Upload from '@/pages/upload';
import ViewEntry from '@/pages/view-entry';
import SharedEntry from '@/pages/shared-entry';
import AuthPage from '@/pages/auth-page';

function Router() {
  useEffect(() => {
    document.title = 'Mini Travel Diary';
  }, []);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/upload" component={Upload} />
      <ProtectedRoute path="/entry/:id" component={ViewEntry} />
      <Route path="/shared/:shareId" component={SharedEntry} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
