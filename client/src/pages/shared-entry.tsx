import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Header } from '@/components/layout/Header';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DiaryEntry } from '@shared/schema';
import { MapPin, Calendar, Clock, Camera, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { MapView } from '@/components/ui/map-view';

export default function SharedEntry() {
  const [match, params] = useRoute('/shared/:shareId');
  const [, navigate] = useLocation();
  const [isCopied, setIsCopied] = useState(false);
  
  const shareId = match ? params.shareId : null;

  // Query for the shared entry
  const { data: entry, isLoading, error } = useQuery<DiaryEntry>({
    queryKey: [`/api/shared/${shareId}`],
    enabled: !!shareId,
  });

  // Reset the "copied" state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  // Handle share link copying
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
    });
  };

  if (!shareId) {
    return <div className="flex justify-center items-center min-h-screen">Invalid share link</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showAuthButtons={true} />
      
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2"
                onClick={() => navigate('/')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Shared Travel Memory</h1>
            </div>
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={copyShareLink}
            >
              {isCopied ? (
                <>Copied! <span className="ml-1">✓</span></>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-1" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
          
          {isLoading && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Skeleton className="w-full h-64" />
              <div className="p-6">
                <Skeleton className="h-8 w-2/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-700 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Error Loading Shared Entry</h3>
              <p>This entry may no longer be shared or the share link is invalid.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => navigate('/')}
              >
                Go to Home
              </Button>
            </div>
          )}
          
          {!isLoading && entry && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 animate-fadeIn">
              <div className="relative">
                <img 
                  src={entry.imageUrl} 
                  alt={entry.caption}
                  className="w-full h-auto" 
                />
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                  {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{entry.caption}</h2>
                
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  {entry.location && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                      <div className="flex items-start mb-2">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-gray-900 font-medium">Travel Location</p>
                          <p className="text-sm text-gray-500">
                            Lat: {entry.location.lat.toFixed(6)}, Long: {entry.location.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Interactive Map */}
                      <div className="mt-3 rounded-md overflow-hidden border border-gray-200">
                        <MapView 
                          lat={entry.location.lat} 
                          lng={entry.location.lng}
                          title={entry.caption}
                          height="250px"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Metadata</h3>
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(entry.createdAt), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{format(new Date(entry.createdAt), 'HH:mm')}</span>
                      </div>
                      <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs flex items-center">
                        <Camera className="h-3 w-3 mr-1" />
                        <span>Travel Snapshot</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call to action for visitors */}
          {!isLoading && entry && (
            <div className="mt-8 bg-blue-50 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Create Your Own Travel Diary</h3>
              <p className="text-blue-600 mb-4">
                Sign up to create your own travel memories and share them with friends and family.
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}