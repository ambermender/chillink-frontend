import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, Button, Modal, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/hooks/useRooms';
import { generateRoomUrl, copyToClipboard, formatRelativeTime } from '@/lib/utils';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import type { Room } from '@/types';

interface RoomCardProps {
  room: Room;
  onRoomUpdate?: () => void;
}

export function RoomCard({ room, onRoomUpdate }: RoomCardProps) {
  const { user } = useAuth();
  const { joinRoom, leaveRoom, deleteRoom } = useRooms();
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isOwner = user?.id === room.owner?.id;
  const isMember = room.members?.some(member => member.user.id === user?.id);

  const handleJoinRoom = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (room.isPrivate && !password) {
      setShowJoinModal(true);
      return;
    }

    setLoading(true);
    const joinData = {
      roomId: room.id,
      ...(room.isPrivate && { password }),
    };

    const joinedRoom = await joinRoom(joinData);
    if (joinedRoom) {
      setShowJoinModal(false);
      setPassword('');
      router.push(`/room/${room.id}`);
      onRoomUpdate?.();
    }
    setLoading(false);
  };

  const handleLeaveRoom = async () => {
    setLoading(true);
    const success = await leaveRoom(room.id);
    if (success) {
      onRoomUpdate?.();
    }
    setLoading(false);
  };

  const handleDeleteRoom = async () => {
    setLoading(true);
    const success = await deleteRoom(room.id);
    if (success) {
      setShowDeleteModal(false);
      onRoomUpdate?.();
    }
    setLoading(false);
  };

  const handleShareRoom = async () => {
    const roomUrl = generateRoomUrl(room.inviteCode);
    try {
      await copyToClipboard(roomUrl);
      toast.success('Room link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy room link');
    }
  };

  const handleEnterRoom = () => {
    router.push(`/room/${room.id}`);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-secondary-900 truncate">
                {room.name}
              </h3>
              {room.description && (
                <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                  {room.description}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {room.isPrivate && (
                <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-100 text-amber-600">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              <span className="text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded">
                {room.memberCount}/{room.maxMembers}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-600">Owner:</span>
              <span className="font-medium text-secondary-900">
                {room.owner?.username || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-600">Created:</span>
              <span className="text-secondary-900">
                {formatRelativeTime(new Date(room.createdAt))}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-between">
          <div className="flex space-x-2">
            {isMember ? (
              <>
                <Button
                  size="sm"
                  onClick={handleEnterRoom}
                  className="flex-1"
                >
                  Enter Room
                </Button>
                {!isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLeaveRoom}
                    loading={loading}
                  >
                    Leave
                  </Button>
                )}
              </>
            ) : (
              <Button
                size="sm"
                onClick={handleJoinRoom}
                loading={loading}
                disabled={(room.memberCount ?? 0) >= room.maxMembers}
                className="flex-1"
              >
                {(room.memberCount ?? 0) >= room.maxMembers ? 'Full' : 'Join Room'}
              </Button>
            )}
          </div>

          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShareRoom}
              className="p-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
            </Button>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Join Room Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join Private Room"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            This room is private. Please enter the password to join.
          </p>
          <Input
            type="password"
            label="Room Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter room password"
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowJoinModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinRoom}
              loading={loading}
              disabled={!password}
            >
              Join Room
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
            Are you sure you want to delete <strong>{room.name}</strong>? This action cannot be undone.
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
    </>
  );
}