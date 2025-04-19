import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '../../hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
  showAuthButtons?: boolean;
}

export function Header({ showAuthButtons = true }: HeaderProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        if (location !== '/') {
          window.location.href = '/';
        }
      }
    });
  };

  // Gets initials from email
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <Scale className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Mini Travel Diary</h1>
            </div>
          </Link>
        </div>
        
        {showAuthButtons && (
          <div>
            {user ? (
              <div className="flex items-center">
                {location !== '/upload' && (
                  <Button 
                    variant="default" 
                    className="mr-4"
                    asChild
                  >
                    <Link href="/upload">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Entry
                      </div>
                    </Link>
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={undefined} alt={user.username} />
                        <AvatarFallback>{user.username ? getInitials(user.username) : 'TD'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/dashboard">
                        <div className="w-full cursor-pointer">Your Entries</div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <button className="w-full text-left" onClick={handleSignOut}>
                        Sign Out
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div>
                <Button 
                  variant="link" 
                  className="text-primary hover:text-primary-dark font-medium mr-4"
                  onClick={() => openAuthModal('login')}
                >
                  Log In
                </Button>
                <Button 
                  variant="default" 
                  className="bg-primary hover:bg-primary/90 text-white font-medium"
                  onClick={() => openAuthModal('signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultMode={authMode}
      />
    </header>
  );
}
