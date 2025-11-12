import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  ShareIcon,
  DocumentTextIcon,
  CalendarIcon,
  BellIcon,
  PlusIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  PhoneIcon,
  EyeIcon,
  HandRaisedIcon,
  ClockIcon,
  TagIcon,
  FolderIcon,
  LinkIcon,
  HeartIcon,
  FaceSmileIcon,
  PhotoIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  UserPlusIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useWebSocket } from '../../hooks/useWebSocket';

// Real-time collaboration engine
class CollaborationEngine {
  constructor(websocket) {
    this.ws = websocket;
    this.activeUsers = new Map();
    this.cursors = new Map();
    this.selections = new Map();
  }

  // User presence management
  updateUserPresence(userId, presence) {
    this.activeUsers.set(userId, {
      ...this.activeUsers.get(userId),
      ...presence,
      lastSeen: Date.now()
    });
    
    this.ws.send({
      type: 'user_presence',
      userId,
      presence
    });
  }

  // Real-time cursor tracking
  updateCursor(userId, position) {
    this.cursors.set(userId, position);
    this.ws.send({
      type: 'cursor_update',
      userId,
      position
    });
  }

  // Collaborative editing
  sendEdit(documentId, operation) {
    this.ws.send({
      type: 'document_edit',
      documentId,
      operation,
      timestamp: Date.now()
    });
  }

  // Screen sharing
  startScreenShare(roomId) {
    return navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
  }

  // Voice/Video calls
  async startCall(roomId, participants) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    this.ws.send({
      type: 'call_start',
      roomId,
      participants
    });
    
    return stream;
  }
}

// User Avatar Component
const UserAvatar = ({ user, size = 'md', showStatus = true, onClick }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg'
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  };

  return (
    <div className="relative inline-block" onClick={onClick}>
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center font-medium text-gray-600 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-1 transition-all`}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span>{user.name?.charAt(0)?.toUpperCase()}</span>
        )}
      </div>
      
      {showStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColors[user.status || 'offline']}`}></div>
      )}
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message, currentUser, onReact, onReply }) => {
  const [showActions, setShowActions] = useState(false);
  const isOwn = message.userId === currentUser.id;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && (
          <div className="flex items-center space-x-2 mb-1">
            <UserAvatar user={message.user} size="sm" showStatus={false} />
            <span className="text-xs font-medium text-gray-600">{message.user.name}</span>
            <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
          </div>
        )}
        
        <div className={`relative px-4 py-2 rounded-lg ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {message.replyTo && (
            <div className={`text-xs mb-2 p-2 rounded border-l-2 ${
              isOwn ? 'border-blue-300 bg-blue-500' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="font-medium">{message.replyTo.user.name}</div>
              <div className="truncate">{message.replyTo.content}</div>
            </div>
          )}
          
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <PaperClipIcon className="h-3 w-3" />
                  <span>{attachment.name}</span>
                </div>
              ))}
            </div>
          )}
          
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className="flex items-center space-x-1 mt-2">
              {Object.entries(message.reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${
                    users.includes(currentUser.id)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  } hover:bg-opacity-80 transition-colors`}
                >
                  <span>{emoji}</span>
                  <span>{users.length}</span>
                </button>
              ))}
            </div>
          )}
          
          {isOwn && (
            <div className="text-xs text-blue-200 mt-1 text-right">
              {formatTime(message.timestamp)}
            </div>
          )}
        </div>
      </div>

      {/* Message Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`flex items-center space-x-1 ${isOwn ? 'order-1 mr-2' : 'order-3 ml-2'}`}
          >
            <button
              onClick={() => onReact(message.id, '👍')}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Like"
            >
              <HeartIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onReply(message)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Reply"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Team Chat Component
const TeamChat = ({ roomId, participants }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const ws = useWebSocket();

  // Load chat messages
  const { data: chatMessages, isLoading } = useQuery(
    ['chat-messages', roomId],
    async () => {
      const response = await fetch(`/api/chat/${roomId}/messages`);
      if (!response.ok) throw new Error('Failed to load messages');
      return response.json();
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    async (messageData) => {
      const response = await fetch(`/api/chat/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    {
      onSuccess: (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        setNewMessage('');
        setReplyTo(null);
      },
      onError: () => {
        showNotification('Failed to send message', 'error');
      }
    }
  );

  // Handle WebSocket messages
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (data) => {
      switch (data.type) {
        case 'new_message':
          if (data.roomId === roomId) {
            setMessages(prev => [...prev, data.message]);
          }
          break;
        case 'user_typing':
          if (data.roomId === roomId && data.userId !== user.id) {
            setTypingUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
            setTimeout(() => {
              setTypingUsers(prev => prev.filter(id => id !== data.userId));
            }, 3000);
          }
          break;
        case 'message_reaction':
          if (data.roomId === roomId) {
            setMessages(prev => prev.map(msg => 
              msg.id === data.messageId 
                ? { ...msg, reactions: data.reactions }
                : msg
            ));
          }
          break;
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, roomId, user.id]);

  // Initialize messages
  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (newMessage && !isTyping) {
      setIsTyping(true);
      ws?.send({
        type: 'user_typing',
        roomId,
        userId: user.id
      });
    } else if (!newMessage && isTyping) {
      setIsTyping(false);
    }
  }, [newMessage, isTyping, ws, roomId, user.id]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage.trim(),
      userId: user.id,
      roomId,
      replyTo: replyTo?.id,
      timestamp: Date.now()
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const response = await fetch(`/api/chat/${roomId}/messages/${messageId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, userId: user.id })
      });
      
      if (!response.ok) throw new Error('Failed to add reaction');
      
      const { reactions } = await response.json();
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, reactions } : msg
      ));
    } catch (error) {
      showNotification('Failed to add reaction', 'error');
    }
  };

  const handleReply = (message) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">Team Chat</span>
          <span className="text-sm text-gray-500">({participants.length} members)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            {participants.slice(0, 5).map((participant) => (
              <UserAvatar key={participant.id} user={participant} size="sm" />
            ))}
            {participants.length > 5 && (
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                +{participants.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                currentUser={user}
                onReact={handleReaction}
                onReply={handleReply}
              />
            ))}
            
            {typingUsers.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>
                  {typingUsers.length === 1 
                    ? `${participants.find(p => p.id === typingUsers[0])?.name} is typing...`
                    : `${typingUsers.length} people are typing...`
                  }
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">Replying to</span>
              <span className="font-medium text-gray-700">{replyTo.user.name}</span>
              <span className="text-gray-500 truncate max-w-xs">{replyTo.content}</span>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <PhotoIcon className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <PaperClipIcon className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <FaceSmileIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isLoading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Video Call Component
const VideoCall = ({ roomId, participants, onEnd }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef(null);
  const { user } = useAuth();
  const { showNotification } = useNotifications();

  // Initialize local stream
  useEffect(() => {
    const initializeStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        showNotification('Failed to access camera/microphone', 'error');
      }
    };

    initializeStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setIsScreenSharing(true);
      // Replace video track with screen share
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = localStream.getVideoTracks()[0];
      
      // Handle screen share end
      videoTrack.onended = () => {
        setIsScreenSharing(false);
        // Switch back to camera
      };
      
    } catch (error) {
      showNotification('Failed to start screen sharing', 'error');
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    onEnd();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 p-4 h-full">
        {/* Local Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            You {isMuted && '(muted)'} {isVideoOff && '(video off)'}
          </div>
          {isScreenSharing && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
              Sharing Screen
            </div>
          )}
        </div>

        {/* Remote Videos */}
        {participants.filter(p => p.id !== user.id).map((participant) => (
          <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <UserAvatar user={participant} size="xl" showStatus={false} />
            </div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {participant.name}
            </div>
          </div>
        ))}
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center space-x-4 bg-gray-800 rounded-full px-6 py-3">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            <MicrophoneIcon className={`h-5 w-5 text-white ${isMuted ? 'line-through' : ''}`} />
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            <VideoCameraIcon className={`h-5 w-5 text-white ${isVideoOff ? 'line-through' : ''}`} />
          </button>
          
          <button
            onClick={startScreenShare}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            <ShareIcon className="h-5 w-5 text-white" />
          </button>
          
          <button
            onClick={endCall}
            className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <PhoneIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Participant List */}
      <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-4 max-w-xs">
        <h3 className="text-white font-medium mb-2">Participants ({participants.length})</h3>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-2">
              <UserAvatar user={participant} size="sm" />
              <span className="text-white text-sm">{participant.name}</span>
              {participant.id === user.id && (
                <span className="text-gray-400 text-xs">(You)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Team Collaboration Component
const TeamCollaboration = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Load collaboration rooms
  const { data: rooms, isLoading } = useQuery(
    'collaboration-rooms',
    async () => {
      const response = await fetch('/api/collaboration/rooms');
      if (!response.ok) throw new Error('Failed to load rooms');
      return response.json();
    }
  );

  // Create room mutation
  const createRoomMutation = useMutation(
    async (roomData) => {
      const response = await fetch('/api/collaboration/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      if (!response.ok) throw new Error('Failed to create room');
      return response.json();
    },
    {
      onSuccess: (newRoom) => {
        queryClient.invalidateQueries('collaboration-rooms');
        setSelectedRoom(newRoom);
        setShowCreateRoom(false);
        showNotification('Room created successfully', 'success');
      },
      onError: () => {
        showNotification('Failed to create room', 'error');
      }
    }
  );

  const tabs = [
    { id: 'chat', name: 'Chat', icon: ChatBubbleLeftRightIcon },
    { id: 'rooms', name: 'Rooms', icon: UserGroupIcon },
    { id: 'files', name: 'Files', icon: DocumentTextIcon },
    { id: 'calendar', name: 'Calendar', icon: CalendarIcon }
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <UserGroupIcon className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Team Collaboration</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateRoom(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>New Room</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="p-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Room List */}
          {activeTab === 'rooms' && (
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Rooms</h3>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {rooms?.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedRoom?.id === room.id
                          ? 'bg-blue-100 border border-blue-200'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{room.name}</div>
                          <div className="text-sm text-gray-500">{room.participants.length} members</div>
                        </div>
                        {room.hasUnread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              {/* Room Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedRoom.name}</h2>
                    <p className="text-sm text-gray-600">{selectedRoom.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowVideoCall(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <VideoCameraIcon className="h-4 w-4" />
                    <span>Start Call</span>
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              <TeamChat
                roomId={selectedRoom.id}
                participants={selectedRoom.participants}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a room to start collaborating</h3>
                <p className="text-gray-600 mb-4">Choose a room from the sidebar or create a new one</p>
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Room
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Call Modal */}
      <AnimatePresence>
        {showVideoCall && selectedRoom && (
          <VideoCall
            roomId={selectedRoom.id}
            participants={selectedRoom.participants}
            onEnd={() => setShowVideoCall(false)}
          />
        )}
      </AnimatePresence>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Create New Room</h3>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  createRoomMutation.mutate({
                    name: formData.get('name'),
                    description: formData.get('description'),
                    type: formData.get('type'),
                    participants: [user.id]
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter room name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter room description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type
                  </label>
                  <select
                    name="type"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Discussion</option>
                    <option value="project">Project Room</option>
                    <option value="support">Support Channel</option>
                    <option value="social">Social Chat</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createRoomMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {createRoomMutation.isLoading ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamCollaboration;