import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../hooks/use-auth';

type AuthMode = 'login' | 'signup';

const authSchema = z.object({
  email: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  rememberMe: z.boolean().optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: AuthMode;
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { loginMutation, registerMutation } = useAuth();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    form.reset();
  };

  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    try {
      if (authMode === 'login') {
        loginMutation.mutate(
          { 
            username: data.email, 
            password: data.password 
          }, 
          {
            onSuccess: () => {
              onClose();
            },
            onError: (error) => {
              toast({
                title: "Login failed",
                description: error.message || "Failed to log in. Please check your credentials.",
                variant: "destructive",
              });
            },
            onSettled: () => {
              setIsLoading(false);
            }
          }
        );
      } else {
        registerMutation.mutate(
          { 
            username: data.email, 
            password: data.password 
          }, 
          {
            onSuccess: () => {
              toast({
                title: "Account created!",
                description: "Your account has been created successfully.",
              });
              onClose();
            },
            onError: (error) => {
              toast({
                title: "Registration failed",
                description: error.message || "Failed to create account. Please try again.",
                variant: "destructive",
              });
            },
            onSettled: () => {
              setIsLoading(false);
            }
          }
        );
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error?.message || (authMode === 'login' 
          ? "Failed to log in. Please check your credentials." 
          : "Failed to create account. Please try again."),
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby="auth-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {authMode === 'login' ? 'Log In' : 'Sign Up'}
          </DialogTitle>
          <DialogDescription id="auth-dialog-description">
            {authMode === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Create a new account to start your travel journey'}
          </DialogDescription>
          <Button 
            variant="ghost" 
            className="absolute right-4 top-4 rounded-sm p-2" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your username" 
                      {...field} 
                      type="text"
                      autoComplete="username"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field}
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {authMode === 'login' && (
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rememberMe" 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Remember me
                      </label>
                    </div>
                  )}
                />
                <Button variant="link" size="sm" className="px-0 font-medium text-primary">
                  Forgot password?
                </Button>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {authMode === 'login' ? 'Logging in...' : 'Signing up...'}
                </span>
              ) : (
                <span>{authMode === 'login' ? 'Log In' : 'Sign Up'}</span>
              )}
            </Button>
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <span>{authMode === 'login' ? "Don't have an account?" : "Already have an account?"}</span>
              <Button
                type="button"
                variant="link"
                className="font-medium text-primary"
                onClick={toggleAuthMode}
                disabled={isLoading}
              >
                {authMode === 'login' ? 'Sign Up' : 'Log In'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
