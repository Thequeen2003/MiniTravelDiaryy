import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{success: boolean; message?: string}>;
  signUp: (email: string, password: string) => Promise<{success: boolean; message?: string; emailConfirmationRequired?: boolean}>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check active session on load
    const getSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{success: boolean; message?: string}> => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Error signing in:', error.message);
        return { 
          success: false, 
          message: error.message 
        };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { 
        success: false, 
        message: error?.message || 'An unexpected error occurred' 
      };
    }
  };

  const signUp = async (email: string, password: string): Promise<{success: boolean; message?: string; emailConfirmationRequired?: boolean}> => {
    try {
      const { error, data } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        console.error('Error signing up:', error.message);
        return { 
          success: false, 
          message: error.message 
        };
      }
      
      // Check if email confirmation is required
      const emailConfirmationRequired = !data.user?.confirmed_at;
      
      return { 
        success: true,
        emailConfirmationRequired
      };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { 
        success: false, 
        message: error?.message || 'An unexpected error occurred' 
      };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
