import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button, Card, CardHeader, CardContent, LoadingSpinner, Modal } from '@/components/ui';
import { VoiceControls, VoiceStatus, VoiceUsersList } from '@/components/room';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom, useRooms } from '@/hooks/useRooms';
import { generateRoomUrl, copyToClipboard, formatRelativeTime } from '@/lib/utils';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';

export default function RoomPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const { room, loading: roomLoading, error: roomError, refreshRoom } = useRoom(id as string);
  const { leaveRoom, deleteRoom } = useRooms();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const isOwner = user && room && user.id === room.owner.id;
  const isMember = user && room && room.members?.some(member => member.userId === user.id);

  const handleShareRoom = async () => {
    if (!room) return;
    
    const roomUrl = generateRoomUrl(room.inviteCode);
    const success = await copyToClipboard(roomUrl);
    if (success) {
      toast.success('Room link copied to clipboard!');
    }
  };

  const handleLeaveRoom = async () => {
    if (!room) return;
    
    setLoading(true);
    const success = await leaveRoom(room.id);
    if (success) {
      setShowLeaveModal(false);
      router.push('/');
    }
    setLoading(false);
  };

  const handleDeleteRoom = async () => {
    if (!room) return;
    
    setLoading(true);
    const success = await deleteRoom(room.id);
    if (success) {
      setShowDeleteModal(false);
      router.push('/');
    }
    setLoading(false);
  };

  if (authLoading || roomLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-secondary-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (roomError || !room) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Room Not Found</h1>
          <p className="text-secondary-600 mb-6">
            {roomError || 'The room you are looking for does not exist or you do not have access to it.'}
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/">
              <Button>Browse Rooms</Button>
            </Link>
            <Link href="/join">
              <Button variant="outline">Join Another Room</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isMember) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-amber-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
          <p className="text-secondary-600 mb-6">
            You are not a member of this room. Please join the room first to access it.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/">
              <Button>Browse Rooms</Button>
            </Link>
            <Link href="/join">
              <Button variant="outline">Join Room</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{room.name} - Chillink</title>
        <meta name="description" content={`Join ${room.name} voice room on Chillink`} />
      </Head>
      
      <Layout>
        <div className="max-w-6xl mx-auto">
          {/* Room Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-secondary-900">{room.name}</h1>
                  {room.isPrivate && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {room.description && (
                  <p className="text-secondary-600 mb-3">{room.description}</p>
                )}
                <div className="flex items-center space-x-6 text-sm text-secondary-500">
                  <span>Owner: <strong className="text-secondary-900">{room.owner.username}</strong></span>
                  <span>Created: {formatRelativeTime(new Date(room.createdAt))}</span>
                  <span>Members: {room.memberCount}/{room.maxMembers}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-6">
                <VoiceStatus />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleShareRoom}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>Share Room</span>
              </Button>
              
              <Button
                onClick={refreshRoom}
                variant="ghost"
                className="flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </Button>
              
              {!isOwner && (
                <Button
                  onClick={() => setShowLeaveModal(true)}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Leave Room
                </Button>
              )}
              
              {isOwner && (
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                >
                  Delete Room
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Voice Controls */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-secondary-900">Voice Chat</h2>
                </CardHeader>
                <CardContent>
                  <VoiceControls roomId={room.id} />
                </CardContent>
              </Card>
              
              {/* Room Info */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-secondary-900">Room Information</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-secondary-600">Invite Code:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="bg-secondary-100 px-2 py-1 rounded font-mono text-secondary-900">
                          {room.inviteCode}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleShareRoom}
                          className="p-1"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="text-secondary-600">Room Type:</span>
                      <p className="mt-1 font-medium text-secondary-900">
                        {room.isPrivate ? 'Private' : 'Public'}
                      </p>
                    </div>
                    <div>
                      <span className="text-secondary-600">Created:</span>
                      <p className="mt-1 font-medium text-secondary-900">
                        {new Date(room.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-secondary-600">Capacity:</span>
                      <p className="mt-1 font-medium text-secondary-900">
                        {room.memberCount} / {room.maxMembers} members
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Voice Users */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-secondary-900">Voice Chat</h3>
                </CardHeader>
                <CardContent>
                  <VoiceUsersList />
                </CardContent>
              </Card>
              
              {/* Room Members */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-secondary-900">
                    Room Members ({room.memberCount})
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {room.members?.map((member) => (
                      <div
                        key={member.userId}
                        className="flex items-center space-x-3 p-2 rounded-lg bg-secondary-50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-medium">
                          {member.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-secondary-900">
                            {member.user.username}
                            {member.userId === room.owner.id && (
                              <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                Owner
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-secondary-500">
                            Joined {formatRelativeTime(new Date(member.joinedAt))}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm text-secondary-500 text-center py-4">
                        No members to display
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Leave Room Modal */}
        <Modal
          isOpen={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          title="Leave Room"
        >
          <div className="space-y-4">
            <p className="text-secondary-600">
              Are you sure you want to leave <strong>{room.name}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowLeaveModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleLeaveRoom}
                loading={loading}
              >
                Leave Room
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Room Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Room"
        >
          <div className="space-y-4">
            <p className="text-secondary-600">
              Are you sure you want to delete <strong>{room.name}</strong>? This action cannot be undone and all members will be removed from the room.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteRoom}
                loading={loading}
              >
                Delete Room
              </Button>
            </div>
          </div>
        </Modal>
      </Layout>
    </>
  );
}