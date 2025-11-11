'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  IconPhone,
  IconPhoneOff,
  IconVideo,
  IconVideoOff,
  IconMicrophone,
  IconMicrophoneOff,
  IconX,
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  callType: 'audio' | 'video';
  recipientName: string;
  recipientImage?: string;
  channelName: string;
}

export function CallDialog({
  isOpen,
  onClose,
  callType,
  recipientName,
  recipientImage,
  channelName,
}: CallDialogProps) {
  const [AgoraRTC, setAgoraRTC] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<number[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load AgoraRTC dynamically on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !AgoraRTC) {
      import('agora-rtc-sdk-ng').then((module) => {
        setAgoraRTC(module.default);
        console.log('AgoraRTC loaded in component');
      }).catch((error) => {
        console.error('Failed to load AgoraRTC:', error);
        toast.error('Failed to load calling library');
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen && AgoraRTC) {
      initializeCall();
    }

    return () => {
      cleanup();
    };
  }, [isOpen, AgoraRTC]);

  useEffect(() => {
    if (isJoined && !durationIntervalRef.current) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    };
  }, [isJoined]);

  const initializeCall = async () => {
    if (!AgoraRTC) {
      console.log('AgoraRTC not ready, waiting...');
      return; // Will retry when AgoraRTC loads
    }

    try {
      setIsCalling(true);
      console.log('Initializing call with AgoraRTC...');

      // Get Agora token from API
      const response = await fetch(
        `/api/call/token?channel=${channelName}&role=publisher`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token API error:', errorData);
        
        // Show user-friendly error message
        if (errorData.message && errorData.message.includes('not configured')) {
          toast.error('Calling feature not configured. Please contact administrator.');
        } else {
          toast.error(errorData.message || 'Failed to initialize call');
        }
        
        onClose();
        return;
      }

      const { token, appId } = await response.json();

      console.log('Received token data:', { appId: appId ? 'present' : 'missing', token: token ? 'present' : 'missing' });

      if (!appId || !token) {
        toast.error('Calling service not available. Please try again later.');
        onClose();
        return;
      }

      // Create Agora client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Set up event listeners
      client.on('user-published', async (user: any, mediaType: any) => {
        await client.subscribe(user, mediaType);

        if (mediaType === 'video') {
          setRemoteUsers((prev) => [...new Set([...prev, user.uid as number])]);
          
          // Play remote video
          const remoteVideoTrack = user.videoTrack;
          if (remoteVideoTrack && remoteVideoRef.current) {
            remoteVideoTrack.play(remoteVideoRef.current);
          }
        }

        if (mediaType === 'audio') {
          const remoteAudioTrack = user.audioTrack;
          remoteAudioTrack?.play();
        }
      });

      client.on('user-unpublished', (user: any) => {
        setRemoteUsers((prev) => prev.filter((uid) => uid !== user.uid));
      });

      client.on('user-left', (user: any) => {
        setRemoteUsers((prev) => prev.filter((uid) => uid !== user.uid));
      });

      // Join channel
      await client.join(appId, channelName, token, null);

      // Create and publish local tracks
      if (callType === 'video') {
        localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack();
        localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();

        if (localVideoRef.current && localVideoTrackRef.current) {
          localVideoTrackRef.current.play(localVideoRef.current);
        }

        await client.publish([
          localVideoTrackRef.current,
          localAudioTrackRef.current,
        ]);
      } else {
        localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish([localAudioTrackRef.current]);
      }

      setIsJoined(true);
      setIsCalling(false);
      toast.success('Call connected');
    } catch (error) {
      console.error('Error initializing call:', error);
      toast.error(
        error instanceof Error && error.message.includes('not configured')
          ? 'Calling service not configured'
          : 'Failed to start call'
      );
      setIsCalling(false);
      onClose();
    }
  };

  const cleanup = async () => {
    try {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
      }

      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }

      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }

      setIsJoined(false);
      setRemoteUsers([]);
      setCallDuration(0);
      setIsAudioMuted(false);
      setIsVideoMuted(false);
    } catch (error) {
      console.error('Error cleaning up call:', error);
    }
  };

  const endCall = async () => {
    await cleanup();
    onClose();
    toast.info('Call ended');
  };

  const toggleAudio = () => {
    if (localAudioTrackRef.current) {
      if (isAudioMuted) {
        localAudioTrackRef.current.setEnabled(true);
      } else {
        localAudioTrackRef.current.setEnabled(false);
      }
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrackRef.current) {
      if (isVideoMuted) {
        localVideoTrackRef.current.setEnabled(true);
      } else {
        localVideoTrackRef.current.setEnabled(false);
      }
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <DialogTitle className="sr-only">
          {callType === 'video' ? 'Video' : 'Voice'} call with {recipientName}
        </DialogTitle>
        <DialogHeader className="sr-only">
          <DialogDescription>
            Active {callType} call session
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-full flex flex-col bg-black">
          {/* Call Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={recipientImage} />
                  <AvatarFallback>{recipientName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{recipientName}</p>
                  <p className="text-sm text-white/80">
                    {isCalling
                      ? 'Connecting...'
                      : isJoined
                      ? formatDuration(callDuration)
                      : remoteUsers.length > 0
                      ? 'In call'
                      : 'Ringing...'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={endCall}
                className="text-white hover:bg-white/20"
              >
                <IconX className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Video Container */}
          <div className="flex-1 relative">
            {callType === 'video' ? (
              <>
                {/* Remote Video (Full Screen) */}
                <div
                  ref={remoteVideoRef}
                  className="w-full h-full bg-gray-900"
                >
                  {remoteUsers.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-white">
                        <Avatar className="h-24 w-24 mx-auto mb-4">
                          <AvatarImage src={recipientImage} />
                          <AvatarFallback className="text-2xl">
                            {recipientName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-lg">
                          {isCalling ? 'Connecting...' : 'Waiting for response...'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute top-20 right-4 w-40 h-32 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
                  <div
                    ref={localVideoRef}
                    className="w-full h-full bg-gray-800"
                  />
                  {isVideoMuted && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <IconVideoOff className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Audio Only View */
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <Avatar className="h-32 w-32 mx-auto mb-6">
                    <AvatarImage src={recipientImage} />
                    <AvatarFallback className="text-4xl">
                      {recipientName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-semibold mb-2">{recipientName}</h3>
                  <p className="text-lg text-white/80">
                    {isCalling
                      ? 'Connecting...'
                      : isJoined
                      ? formatDuration(callDuration)
                      : 'Ringing...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center justify-center gap-4">
              {/* Mute Audio */}
              <Button
                variant="secondary"
                size="lg"
                onClick={toggleAudio}
                className={`rounded-full h-14 w-14 ${
                  isAudioMuted ? 'bg-red-500 hover:bg-red-600' : ''
                }`}
                disabled={isCalling}
              >
                {isAudioMuted ? (
                  <IconMicrophoneOff className="h-6 w-6" />
                ) : (
                  <IconMicrophone className="h-6 w-6" />
                )}
              </Button>

              {/* End Call */}
              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                className="rounded-full h-16 w-16"
              >
                <IconPhoneOff className="h-7 w-7" />
              </Button>

              {/* Mute Video */}
              {callType === 'video' && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={toggleVideo}
                  className={`rounded-full h-14 w-14 ${
                    isVideoMuted ? 'bg-red-500 hover:bg-red-600' : ''
                  }`}
                  disabled={isCalling}
                >
                  {isVideoMuted ? (
                    <IconVideoOff className="h-6 w-6" />
                  ) : (
                    <IconVideo className="h-6 w-6" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
