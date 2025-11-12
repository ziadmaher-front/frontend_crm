import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  MessageSquare, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  Settings,
  Bell,
  BellOff,
  Star,
  Archive,
  Trash2,
  Edit,
  Share,
  Download,
  Upload,
  FileText,
  Image,
  File,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ScreenShare,
  StopCircle,
  Circle,
  Camera,
  CameraOff,
  Monitor,
  Smartphone,
  Headphones,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const UnifiedCommunicationHub = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const videoRef = useRef(null);

  // Mock data for contacts
  const contacts = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Sales Manager',
      avatar: '/api/placeholder/40/40',
      status: 'online',
      lastSeen: 'now',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@company.com',
      department: 'Sales',
      timezone: 'EST'
    },
    {
      id: 2,
      name: 'Mike Chen',
      role: 'Lead Developer',
      avatar: '/api/placeholder/40/40',
      status: 'busy',
      lastSeen: '5 min ago',
      phone: '+1 (555) 234-5678',
      email: 'mike.chen@company.com',
      department: 'Engineering',
      timezone: 'PST'
    },
    {
      id: 3,
      name: 'Emily Davis',
      role: 'Marketing Director',
      avatar: '/api/placeholder/40/40',
      status: 'away',
      lastSeen: '1 hour ago',
      phone: '+1 (555) 345-6789',
      email: 'emily.davis@company.com',
      department: 'Marketing',
      timezone: 'CST'
    },
    {
      id: 4,
      name: 'David Wilson',
      role: 'Customer Success',
      avatar: '/api/placeholder/40/40',
      status: 'offline',
      lastSeen: '2 hours ago',
      phone: '+1 (555) 456-7890',
      email: 'david.wilson@company.com',
      department: 'Support',
      timezone: 'EST'
    }
  ];

  // Mock data for channels
  const channels = [
    {
      id: 1,
      name: 'General',
      type: 'public',
      members: 24,
      unread: 3,
      lastMessage: 'Great work on the quarterly report!',
      lastActivity: '2 min ago',
      description: 'General company discussions'
    },
    {
      id: 2,
      name: 'Sales Team',
      type: 'private',
      members: 8,
      unread: 0,
      lastMessage: 'Meeting scheduled for tomorrow at 2 PM',
      lastActivity: '15 min ago',
      description: 'Sales team coordination'
    },
    {
      id: 3,
      name: 'Product Updates',
      type: 'announcement',
      members: 45,
      unread: 1,
      lastMessage: 'New feature release v2.1.0',
      lastActivity: '1 hour ago',
      description: 'Product announcements and updates'
    },
    {
      id: 4,
      name: 'Customer Feedback',
      type: 'public',
      members: 12,
      unread: 5,
      lastMessage: 'Customer reported issue with login',
      lastActivity: '30 min ago',
      description: 'Customer feedback and support'
    }
  ];

  // Mock data for messages
  const messages = [
    {
      id: 1,
      sender: 'Sarah Johnson',
      avatar: '/api/placeholder/32/32',
      content: 'Hey team! Just wanted to share the latest sales numbers. We\'re up 15% from last quarter!',
      timestamp: '10:30 AM',
      type: 'text',
      reactions: [{ emoji: '👍', count: 3 }, { emoji: '🎉', count: 2 }],
      isOwn: false
    },
    {
      id: 2,
      sender: 'You',
      avatar: '/api/placeholder/32/32',
      content: 'That\'s fantastic news! Great work everyone.',
      timestamp: '10:32 AM',
      type: 'text',
      reactions: [],
      isOwn: true
    },
    {
      id: 3,
      sender: 'Mike Chen',
      avatar: '/api/placeholder/32/32',
      content: 'I\'ve uploaded the technical specifications for the new feature.',
      timestamp: '10:35 AM',
      type: 'file',
      fileName: 'tech-specs-v2.1.pdf',
      fileSize: '2.4 MB',
      reactions: [{ emoji: '👍', count: 1 }],
      isOwn: false
    },
    {
      id: 4,
      sender: 'Emily Davis',
      avatar: '/api/placeholder/32/32',
      content: 'Can we schedule a quick call to discuss the marketing campaign?',
      timestamp: '10:40 AM',
      type: 'text',
      reactions: [],
      isOwn: false
    }
  ];

  // Mock data for recent calls
  const recentCalls = [
    {
      id: 1,
      contact: 'Sarah Johnson',
      avatar: '/api/placeholder/32/32',
      type: 'video',
      direction: 'incoming',
      duration: '15:32',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      contact: 'Mike Chen',
      avatar: '/api/placeholder/32/32',
      type: 'audio',
      direction: 'outgoing',
      duration: '8:45',
      timestamp: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      contact: 'Emily Davis',
      avatar: '/api/placeholder/32/32',
      type: 'video',
      direction: 'missed',
      duration: '0:00',
      timestamp: '1 day ago',
      status: 'missed'
    }
  ];

  // Mock data for meetings
  const upcomingMeetings = [
    {
      id: 1,
      title: 'Weekly Sales Review',
      participants: ['Sarah Johnson', 'Mike Chen', 'Emily Davis'],
      startTime: '2:00 PM',
      duration: '1 hour',
      type: 'video',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Product Demo',
      participants: ['David Wilson', 'Sarah Johnson'],
      startTime: '4:30 PM',
      duration: '30 min',
      type: 'video',
      status: 'scheduled'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getChannelIcon = (type) => {
    switch (type) {
      case 'public': return '#';
      case 'private': return '🔒';
      case 'announcement': return '📢';
      default: return '#';
    }
  };

  const startVideoCall = (contact) => {
    setSelectedContact(contact);
    setIsVideoCall(true);
    setIsAudioCall(false);
  };

  const startAudioCall = (contact) => {
    setSelectedContact(contact);
    setIsAudioCall(true);
    setIsVideoCall(false);
  };

  const endCall = () => {
    setIsVideoCall(false);
    setIsAudioCall(false);
    setSelectedContact(null);
    setIsMuted(false);
    setIsVideoEnabled(true);
    setIsScreenSharing(false);
    setIsRecording(false);
  };

  const sendMessage = () => {
    if (messageText.trim()) {
      // Add message logic here
      setMessageText('');
    }
  };

  const ContactCard = ({ contact, onClick }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onClick(contact)}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar>
              <AvatarImage src={contact.avatar} />
              <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(contact.status)}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{contact.name}</p>
            <p className="text-sm text-muted-foreground truncate">{contact.role}</p>
            <p className="text-xs text-muted-foreground">{contact.lastSeen}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); startVideoCall(contact); }}>
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); startAudioCall(contact); }}>
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ChannelCard = ({ channel, onClick }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onClick(channel)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-medium">
              {getChannelIcon(channel.type)}
            </div>
            <div>
              <p className="font-medium">{channel.name}</p>
              <p className="text-sm text-muted-foreground">{channel.members} members</p>
            </div>
          </div>
          <div className="text-right">
            {channel.unread > 0 && (
              <Badge variant="destructive" className="mb-1">{channel.unread}</Badge>
            )}
            <p className="text-xs text-muted-foreground">{channel.lastActivity}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2 truncate">{channel.lastMessage}</p>
      </CardContent>
    </Card>
  );

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${message.isOwn ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2 max-w-[70%]`}>
        {!message.isOwn && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={message.avatar} />
            <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        )}
        <div className={`rounded-lg p-3 ${message.isOwn ? 'bg-blue-500 text-white ml-2' : 'bg-gray-100 mr-2'}`}>
          {!message.isOwn && (
            <p className="text-xs font-medium mb-1">{message.sender}</p>
          )}
          {message.type === 'text' ? (
            <p className="text-sm">{message.content}</p>
          ) : message.type === 'file' ? (
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">{message.fileName}</p>
                <p className="text-xs opacity-75">{message.fileSize}</p>
              </div>
            </div>
          ) : null}
          <p className="text-xs opacity-75 mt-1">{message.timestamp}</p>
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex space-x-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <span key={index} className="text-xs bg-white bg-opacity-20 rounded px-1">
                  {reaction.emoji} {reaction.count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const VideoCallInterface = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
        />
        
        {/* Remote participant video */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Avatar className="w-16 h-16">
              <AvatarImage src={selectedContact?.avatar} />
              <AvatarFallback className="text-white text-xl">
                {selectedContact?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Call info */}
        <div className="absolute top-4 left-4 text-white">
          <h2 className="text-xl font-semibold">{selectedContact?.name}</h2>
          <p className="text-sm opacity-75">Video Call • 05:32</p>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
            <Circle className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Recording</span>
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="bg-gray-900 p-6">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-12 h-12"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12"
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            className="rounded-full w-12 h-12"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
          >
            <ScreenShare className="h-5 w-5" />
          </Button>

          <Button
            variant={isRecording ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-12 h-12"
            onClick={() => setIsRecording(!isRecording)}
          >
            <Circle className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-12 h-12"
            onClick={endCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  const AudioCallInterface = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 z-50 flex flex-col items-center justify-center text-white">
      <div className="text-center mb-8">
        <Avatar className="w-32 h-32 mx-auto mb-4">
          <AvatarImage src={selectedContact?.avatar} />
          <AvatarFallback className="text-4xl">
            {selectedContact?.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-3xl font-semibold mb-2">{selectedContact?.name}</h2>
        <p className="text-lg opacity-75">Audio Call • 03:45</p>
      </div>

      {isRecording && (
        <div className="mb-6 bg-red-500 bg-opacity-20 border border-red-400 px-4 py-2 rounded-full flex items-center gap-2">
          <Circle className="h-4 w-4 animate-pulse" />
          <span>Recording</span>
        </div>
      )}

      <div className="flex items-center space-x-6">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="lg"
          className="rounded-full w-16 h-16"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>

        <Button
          variant={isRecording ? "destructive" : "secondary"}
          size="lg"
          className="rounded-full w-16 h-16"
          onClick={() => setIsRecording(!isRecording)}
        >
          <Circle className="h-6 w-6" />
        </Button>

        <Button
          variant="destructive"
          size="lg"
          className="rounded-full w-16 h-16"
          onClick={endCall}
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Video/Audio Call Interfaces */}
      {isVideoCall && <VideoCallInterface />}
      {isAudioCall && <AudioCallInterface />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Communication Hub</h1>
          <p className="text-muted-foreground">Unified messaging, calls, and collaboration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Meeting
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Conversation
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversations</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <Input placeholder="Search conversations..." />
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[480px]">
                  <div className="space-y-2 p-4">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedContact?.id === contact.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={contact.avatar} />
                              <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(contact.status)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{contact.name}</p>
                            <p className="text-sm text-muted-foreground truncate">Last message preview...</p>
                          </div>
                          <div className="text-xs text-muted-foreground">{contact.lastSeen}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2">
              {selectedContact ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={selectedContact.avatar} />
                            <AvatarFallback>{selectedContact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedContact.status)}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{selectedContact.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedContact.role} • {selectedContact.status}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => startVideoCall(selectedContact)}>
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => startAudioCall(selectedContact)}>
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px] p-4">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                    </ScrollArea>
                    <div className="border-t p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Input
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1"
                        />
                        <Button variant="ghost" size="sm">
                          <Smile className="h-4 w-4" />
                        </Button>
                        <Button onClick={sendMessage} disabled={!messageText.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">Choose a contact to start messaging</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCalls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={call.avatar} />
                          <AvatarFallback>{call.contact.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{call.contact}</p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            {call.type === 'video' ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                            <span>{call.direction}</span>
                            <span>•</span>
                            <span>{call.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{call.duration}</p>
                        <Badge variant={call.status === 'missed' ? 'destructive' : 'secondary'}>
                          {call.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full gap-2">
                  <Video className="h-4 w-4" />
                  Start Video Call
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Phone className="h-4 w-4" />
                  Start Audio Call
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <ScreenShare className="h-4 w-4" />
                  Share Screen
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Input placeholder="Search contacts..." className="w-64" />
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} onClick={setSelectedContact} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Input placeholder="Search channels..." className="w-64" />
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Channel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} onClick={setSelectedChannel} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{meeting.title}</h3>
                        <Badge>{meeting.status}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meeting.startTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {meeting.participants.length} participants
                        </div>
                        <div className="flex items-center gap-1">
                          {meeting.type === 'video' ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                          {meeting.type}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {meeting.participants.slice(0, 3).map((participant, index) => (
                            <Avatar key={index} className="w-6 h-6 border-2 border-white">
                              <AvatarFallback className="text-xs">
                                {participant.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <Button size="sm">Join</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meeting Room</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Ready to meet?</h3>
                    <p className="text-muted-foreground mb-4">Start an instant meeting or join a scheduled one</p>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full gap-2">
                      <Video className="h-4 w-4" />
                      Start Instant Meeting
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedCommunicationHub;