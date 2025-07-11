import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button, Input, Card, CardHeader, CardContent, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms, useRoomByInviteCode } from '@/hooks/useRooms';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function JoinRoomPage() {
  const { user, loading: authLoading } = useAuth();
  const { joinRoom } = useRooms();
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  // Get room info by invite code
  const { 
    room: foundRoom, 
    loading: roomLoading, 
    error: roomError 
  } = useRoomByInviteCode(inviteCode.length >= 6 ? inviteCode : '');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Auto-fill invite code from URL query
    if (router.query.code && typeof router.query.code === 'string') {
      setInviteCode(router.query.code);
    }
  }, [router.query.code]);

  useEffect(() => {
    // Show password field if room is private
    if (foundRoom?.isPrivate) {
      setShowPasswordField(true);
    } else {
      setShowPasswordField(false);
      setPassword('');
    }
  }, [foundRoom]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!inviteCode.trim()) {
      newErrors.inviteCode = 'Invite code is required';
    } else if (inviteCode.length < 6) {
      newErrors.inviteCode = 'Invite code must be at least 6 characters';
    }

    if (foundRoom?.isPrivate && !password) {
      newErrors.password = 'Password is required for private rooms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!foundRoom) return;

    setLoading(true);
    try {
      const joinData = {
        roomId: foundRoom.id,
        ...(foundRoom.isPrivate && { password }),
      };
      
      const room = await joinRoom(joinData);
      if (room) {
        router.push(`/room/${room.id}`);
      }
    } catch (error) {
      // Error is handled by the useRooms hook
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toUpperCase();
    setInviteCode(value);
    
    // Clear errors
    if (errors.inviteCode) {
      setErrors(prev => ({ ...prev, inviteCode: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    
    // Clear errors
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

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
        <title>Join Room - Chillink</title>
        <meta name="description" content="Join a voice room using an invite code" />
      </Head>
      
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              Join Voice Room
            </h1>
            <p className="text-secondary-600">
              Enter an invite code to join a room
            </p>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-secondary-900">
                Room Invite Code
              </h2>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleJoinRoom} className="space-y-6">
                <Input
                  type="text"
                  label="Invite Code"
                  value={inviteCode}
                  onChange={handleInviteCodeChange}
                  error={errors.inviteCode}
                  placeholder="Enter 6-character invite code"
                  helperText="Ask the room owner for the invite code"
                  required
                />
                
                {/* Room Preview */}
                {inviteCode.length >= 6 && (
                  <div className="border rounded-lg p-4 bg-secondary-50">
                    {roomLoading ? (
                      <div className="flex items-center space-x-3">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-secondary-600">Looking up room...</span>
                      </div>
                    ) : roomError ? (
                      <div className="text-center py-4">
                        <div className="text-red-500 mb-2">
                          <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-red-600 font-medium">Room not found</p>
                        <p className="text-xs text-secondary-500 mt-1">Please check the invite code and try again</p>
                      </div>
                    ) : foundRoom ? (
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-secondary-900">{foundRoom.name}</h3>
                            {foundRoom.description && (
                              <p className="text-sm text-secondary-600 mt-1">{foundRoom.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {foundRoom.isPrivate && (
                              <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-100 text-amber-600">
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <span className="text-xs text-secondary-500 bg-white px-2 py-1 rounded">
                              {foundRoom.memberCount}/{foundRoom.maxMembers}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-secondary-600">Owner:</span>
                            <span className="ml-2 font-medium text-secondary-900">{foundRoom.owner.username}</span>
                          </div>
                          <div>
                            <span className="text-secondary-600">Members:</span>
                            <span className="ml-2 font-medium text-secondary-900">
                              {foundRoom.memberCount}/{foundRoom.maxMembers}
                            </span>
                          </div>
                        </div>
                        
                        {foundRoom.memberCount >= foundRoom.maxMembers && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                            ⚠️ This room is currently full
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
                
                {/* Password Field for Private Rooms */}
                {showPasswordField && foundRoom && (
                  <Input
                    type="password"
                    label="Room Password"
                    value={password}
                    onChange={handlePasswordChange}
                    error={errors.password}
                    placeholder="Enter room password"
                    helperText="This room is private and requires a password"
                    required
                  />
                )}
                
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading || !foundRoom || (foundRoom.memberCount >= foundRoom.maxMembers)}
                    className="flex-1"
                  >
                    {foundRoom?.memberCount >= foundRoom?.maxMembers ? 'Room Full' : 'Join Room'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Help Section */}
          <Card className="mt-8" variant="glass">
            <CardContent>
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                💡 How to join a room
              </h3>
              <ul className="space-y-2 text-sm text-secondary-600">
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-0.5">1.</span>
                  <span>Get an invite code from the room owner or a room member</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-0.5">2.</span>
                  <span>Enter the 6-character invite code in the field above</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-0.5">3.</span>
                  <span>If the room is private, you'll need to enter the password</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-0.5">4.</span>
                  <span>Click "Join Room" to enter the voice chat</span>
                </li>
              </ul>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm text-secondary-600">
                  Don't have an invite code?{' '}
                  <Link href="/" className="text-primary-600 hover:text-primary-500 font-medium">
                    Browse public rooms
                  </Link>
                  {' '}or{' '}
                  <Link href="/create" className="text-primary-600 hover:text-primary-500 font-medium">
                    create your own room
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}