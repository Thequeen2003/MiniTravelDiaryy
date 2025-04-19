import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DiaryEntry } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, Clock, Camera, Share2, Globe, Lock } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ViewEntry() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute('/entry/:id');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const entryId = match ? parseInt(params.id) : null;
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: entry, isLoading, error } = useQuery<DiaryEntry>({
    queryKey: [`/api/entries/${entryId}`],
    enabled: !!user && !!entryId,
  });

  // Reset the "copied" state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/entries/${entryId}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: 'Entry Deleted',
        description: 'Your diary entry has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete entry: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/entries/${entryId}/share`, undefined);
    },
    onSuccess: (data) => {
      toast({
        title: 'Entry Shared',
        description: 'Your diary entry can now be shared with others.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}`] });
      setIsShareDialogOpen(true);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to share entry: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const unshareMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', `/api/entries/${entryId}/unshare`, undefined);
    },
    onSuccess: () => {
      toast({
        title: 'Entry Unshared',
        description: 'Your diary entry is no longer shared.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/entries/${entryId}`] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to stop sharing entry: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  const handleShare = () => {
    if (entry?.isShared) {
      unshareMutation.mutate();
    } else {
      shareMutation.mutate();
    }
  };

  const copyShareLink = () => {
    if (entry?.shareId) {
      const shareUrl = `${window.location.origin}/shared/${entry.shareId}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setIsCopied(true);
        toast({
          title: 'Link Copied',
          description: 'Share link has been copied to clipboard.',
        });
      });
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }

  if (!entryId) {
    return <div className="flex justify-center items-center min-h-screen">Invalid entry ID</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showAuthButtons={false} />
      
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2"
                onClick={() => navigate('/dashboard')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">View Entry</h1>
            </div>
            <Button 
              variant="ghost" 
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>

          {isLoading && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Skeleton className="w-full h-64" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-md text-red-500">
              <p>Error loading the entry. Please try again later.</p>
            </div>
          )}

          {!isLoading && entry && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-gray-900 font-medium">Current Location</p>
                          <p className="text-sm text-gray-500">
                            Lat: {entry.location.lat.toFixed(6)}, Long: {entry.location.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Device Information</h3>
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Screen Width</p>
                          <p className="text-gray-900 font-medium">{entry.screenInfo.width}px</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Screen Height</p>
                          <p className="text-gray-900 font-medium">{entry.screenInfo.height}px</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Orientation</p>
                          <p className="text-gray-900 font-medium">{entry.screenInfo.orientation}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Created At</p>
                          <p className="text-gray-900 font-medium">
                            {format(new Date(entry.createdAt), 'HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
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
                        <span>Image from {new URL(entry.imageUrl).pathname.split('.').pop()?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              diary entry and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
