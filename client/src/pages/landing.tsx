import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { Camera, MapPin, PenLine } from 'lucide-react';

export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Capture moments.<br/>Reflect anywhere.</h2>
              <p className="text-xl text-gray-600 mb-8">Your personal travel journal that captures not just photos, but the entire context of your precious moments.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white text-lg"
                  onClick={() => openAuthModal('signup')}
                >
                  Start Your Diary
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-300 hover:border-gray-400 text-gray-700 text-lg"
                  onClick={() => openAuthModal('login')}
                >
                  Log In
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Travel memories" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs">
                    <p className="text-gray-800 font-medium">Sunrise at Mount Fuji</p>
                    <p className="text-gray-600 text-sm">Captured on June 15, 2023</p>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Fujinomiya, Japan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Capture Photos</h3>
              <p className="text-gray-600">Upload your favorite travel photos directly from your camera or gallery.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-amber-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Remember Locations</h3>
              <p className="text-gray-600">Automatically capture where you were when the memory was made.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-emerald-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <PenLine className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Context</h3>
              <p className="text-gray-600">Write captions and let us record the details like time and device information.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultMode={authMode}
      />
    </div>
  );
}
