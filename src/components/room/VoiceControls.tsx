import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { useSocket } from '@/contexts/SocketContext';
import { cn } from '@/lib/utils';

interface VoiceControlsProps {
  roomId: string;
  className?: string;
}

export function VoiceControls({ roomId, className }: VoiceControlsProps) {
  const { 
    isConnected, 
    voiceRoomState, 
    joinVoiceRoom, 
    leaveVoiceRoom, 
    toggleMute 
  } = useSocket();
  
  const [isInVoiceRoom, setIsInVoiceRoom] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    setIsInVoiceRoom(voiceRoomState?.roomId === roomId);
    setIsMuted(voiceRoomState?.isMuted || false);
  }, [voiceRoomState, roomId]);

  const handleJoinVoice = async () => {
    if (!isConnected) return;
    
    setIsConnecting(true);
    try {
      await joinVoiceRoom(roomId);
    } catch (error) {
      console.error('Failed to join voice room:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeaveVoice = () => {
    leaveVoiceRoom();
  };

  const handleToggleMute = () => {
    toggleMute();
  };

  if (!isConnected) {
    return (
      <div className={cn('flex items-center justify-center p-4 bg-secondary-50 rounded-lg', className)}>
        <div className="text-center">
          <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full mb-2 mx-auto" />
          <p className="text-sm text-secondary-600">Connecting to voice server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center space-x-4 p-4 bg-white rounded-lg border', className)}>
      {!isInVoiceRoom ? (
        <Button
          onClick={handleJoinVoice}
          loading={isConnecting}
          className="flex items-center space-x-2"
          size="lg"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <span>Join Voice</span>
        </Button>
      ) : (
        <div className="flex items-center space-x-3">
          {/* Mute/Unmute Button */}
          <Button
            onClick={handleToggleMute}
            variant={isMuted ? 'danger' : 'secondary'}
            size="lg"
            className={cn(
              'flex items-center space-x-2',
              isMuted && 'bg-red-600 hover:bg-red-700 text-white'
            )}
          >
            {isMuted ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>

          {/* Leave Voice Button */}
          <Button
            onClick={handleLeaveVoice}
            variant="outline"
            size="lg"
            className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 3l18 18M9.172 9.172a4 4 0 015.656 0M9.172 9.172L5.636 5.636m3.536 3.536L12 12l2.828 2.828M15 9a9 9 0 11-9.192 1"
              />
            </svg>
            <span>Leave Voice</span>
          </Button>
        </div>
      )}
    </div>
  );
}

interface VoiceStatusProps {
  className?: string;
}

export function VoiceStatus({ className }: VoiceStatusProps) {
  const { isConnected, voiceRoomState } = useSocket();

  if (!isConnected) {
    return (
      <div className={cn('flex items-center space-x-2 text-red-600', className)}>
        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-sm">Disconnected</span>
      </div>
    );
  }

  if (!voiceRoomState?.roomId) {
    return (
      <div className={cn('flex items-center space-x-2 text-secondary-600', className)}>
        <div className="h-2 w-2 bg-secondary-400 rounded-full" />
        <span className="text-sm">Not in voice</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2 text-green-600', className)}>
      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm">
        In voice {voiceRoomState.isMuted && '(muted)'}
      </span>
    </div>
  );
}

interface VoiceUsersListProps {
  className?: string;
}

export function VoiceUsersList({ className }: VoiceUsersListProps) {
  const { voiceRoomState } = useSocket();

  if (!voiceRoomState?.users || voiceRoomState.users.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-secondary-400 mb-2">
          <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-secondary-600">No one in voice chat</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-medium text-secondary-900 mb-3">
        In Voice ({voiceRoomState.users.length})
      </h3>
      <div className="space-y-2">
        {voiceRoomState.users.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2 rounded-lg bg-secondary-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-sm font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-900">
                {user.username}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              {user.isMuted && (
                <div className="text-red-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}