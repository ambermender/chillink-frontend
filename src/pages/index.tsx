import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button, Card, CardHeader, CardContent, LoadingSpinner } from '@/components/ui';
import { RoomCard } from '@/components/room';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/hooks/useRooms';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { rooms, loading: roomsLoading, error, refreshRooms } = useRooms();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Chillink - Voice Rooms</title>
        <meta name="description" content="Join voice rooms and connect with friends" />
      </Head>
      
      <Layout>
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">Chillink</span>
            </h1>
            <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
              Create voice rooms, share invite links, and connect with friends in real-time voice conversations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button size="lg" className="w-full sm:w-auto">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Room
                </Button>
              </Link>
              <Link href="/join">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Join Room
                </Button>
              </Link>
            </div>
          </div>

          {/* Rooms Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-secondary-900">Available Rooms</h2>
              <Button
                variant="ghost"
                onClick={refreshRooms}
                disabled={roomsLoading}
                className="flex items-center space-x-2"
              >
                <svg 
                  className={`h-4 w-4 ${roomsLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </Button>
            </div>

            {roomsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-secondary-200 rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-secondary-200 rounded" />
                        <div className="h-3 bg-secondary-200 rounded w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-red-500 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">Failed to load rooms</h3>
                  <p className="text-secondary-600 mb-4">{error}</p>
                  <Button onClick={refreshRooms}>Try Again</Button>
                </CardContent>
              </Card>
            ) : rooms.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-secondary-400 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No rooms available</h3>
                  <p className="text-secondary-600 mb-4">Be the first to create a voice room!</p>
                  <Link href="/create">
                    <Button>Create Your First Room</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard 
                    key={room.id} 
                    room={room} 
                    onRoomUpdate={refreshRooms}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-primary-600 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">Voice-Only Chat</h3>
                <p className="text-secondary-600">Focus on conversations without distractions. Pure voice communication.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-accent-600 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">Easy Sharing</h3>
                <p className="text-secondary-600">Share room links instantly. Friends can join with just one click.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-secondary-600 mb-4">
                  <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">Private Rooms</h3>
                <p className="text-secondary-600">Create password-protected rooms for private conversations.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </>
  );
}