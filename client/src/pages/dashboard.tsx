import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DiaryEntry } from '@shared/schema';
import { Calendar, MapPin, Monitor, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: entries, isLoading, error } = useQuery<DiaryEntry[]>({
    queryKey: ['/api/entries'],
    enabled: !!user,
  });

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Your Travel Memories</h2>
            <p className="text-gray-600 mt-1">Relive your journey through these captured moments.</p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">
              <p>Error loading entries. Please try again later.</p>
            </div>
          )}

          {!isLoading && entries && entries.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No entries yet</h3>
              <p className="text-gray-600 mb-6">Start capturing your travel memories by creating your first entry.</p>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-medium"
                asChild
              >
                <Link href="/upload">
                  <a className="flex items-center justify-center">
                    <Plus className="h-5 w-5 mr-1" />
                    Create First Entry
                  </a>
                </Link>
              </Button>
            </div>
          )}

          {!isLoading && entries && entries.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry) => (
                <Link key={entry.id} href={`/entry/${entry.id}`}>
                  <a className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block">
                    <div className="aspect-w-16 aspect-h-9 relative">
                      <div className="w-full h-48">
                        <img 
                          src={entry.imageUrl} 
                          alt={entry.caption} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4">
                          <p className="text-white font-medium text-lg">{entry.caption}</p>
                          <p className="text-white/80 text-sm">
                            {format(new Date(entry.createdAt), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      {entry.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>
                            {entry.location.lat.toFixed(4)}, {entry.location.lng.toFixed(4)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Monitor className="h-4 w-4 mr-1" />
                        <span>
                          {entry.screenInfo.width}×{entry.screenInfo.height}, 
                          {entry.screenInfo.orientation}
                        </span>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
