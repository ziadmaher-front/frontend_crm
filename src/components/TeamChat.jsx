import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Smile, 
  Search, 
  Plus, 
  Hash, 
  Lock, 
  Users, 
  Settings,
  Phone,
  Video,
  MoreVertical,
  Pin,
  Star,
  Reply,
  Edit,
  Trash2,
  File,
  Image,
  Download,
  Eye,
  CheckCheck,
  Clock,
  AlertCircle,
  Bell,
  BellOff
} from 'lucide-react';

const TeamChat = () => {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedDM, setSelectedDM] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('channels');
  const messagesEndRef = useRef(null);

  // Sample channels data
  const channels = [
    {
      id: 1,
      name: 'general',
      type: 'public',
      description: 'General team discussions',
      members: 12,
      unreadCount: 3,
      lastActivity: '2 min ago',
      isOnline: true
    },
    {
      id: 2,
      name: 'sales-team',
      type: 'private',
      description: 'Sales team coordination',
      members: 8,
      unreadCount: 0,
      lastActivity: '1 hour ago',
      isOnline: true
    },
    {
      id: 3,
      name: 'product-updates',
      type: 'public',
      description: 'Product announcements and updates',
      members: 25,
      unreadCount: 1,
      lastActivity: '30 min ago',
      isOnline: true
    },
    {
      id: 4,
      name: 'support',
      type: 'public',
      description: 'Customer support discussions',
      members: 6,
      unreadCount: 0,
      lastActivity: '3 hours ago',
      isOnline: false
    }
  ];

  // Sample direct messages
  const directMessages = [
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        avatar: null,
        status: 'online',
        role: 'Sales Manager'
      },
      unreadCount: 2,
      lastMessage: 'Can we discuss the Q1 targets?',
      lastActivity: '5 min ago'
    },
    {
      id: 2,
      user: {
        name: 'Mike Chen',
        email: 'mike@company.com',
        avatar: null,
        status: 'away',
        role: 'Developer'
      },
      unreadCount: 0,
      lastMessage: 'The new feature is ready for testing',
      lastActivity: '2 hours ago'
    },
    {
      id: 3,
      user: {
        name: 'Emma Wilson',
        email: 'emma@company.com',
        avatar: null,
        status: 'offline',
        role: 'Marketing Lead'
      },
      unreadCount: 1,
      lastMessage: 'Thanks for the campaign feedback!',
      lastActivity: '1 day ago'
    }
  ];

  // Sample messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        avatar: null
      },
      content: 'Good morning team! Ready for our weekly sync?',
      timestamp: '9:00 AM',
      type: 'text',
      reactions: [
        { emoji: '👍', count: 3, users: ['Mike Chen', 'Emma Wilson', 'John Doe'] },
        { emoji: '☕', count: 1, users: ['Lisa Davis'] }
      ],
      isEdited: false,
      isPinned: false
    },
    {
      id: 2,
      user: {
        name: 'Mike Chen',
        avatar: null
      },
      content: 'Absolutely! I have some updates on the new CRM features.',
      timestamp: '9:02 AM',
      type: 'text',
      reactions: [],
      isEdited: false,
      isPinned: false
    },
    {
      id: 3,
      user: {
        name: 'Emma Wilson',
        avatar: null
      },
      content: '',
      timestamp: '9:05 AM',
      type: 'file',
      file: {
        name: 'Q1_Marketing_Plan.pdf',
        size: '2.4 MB',
        type: 'pdf'
      },
      reactions: [],
      isEdited: false,
      isPinned: false
    },
    {
      id: 4,
      user: {
        name: 'John Doe',
        avatar: null
      },
      content: 'Great work on the marketing plan, Emma! The strategy looks solid.',
      timestamp: '9:10 AM',
      type: 'text',
      reactions: [
        { emoji: '🎯', count: 2, users: ['Sarah Johnson', 'Mike Chen'] }
      ],
      isEdited: false,
      isPinned: true
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      user: {
        name: 'You',
        avatar: null
      },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      reactions: [],
      isEdited: false,
      isPinned: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const ChannelItem = ({ channel, isSelected, onClick }) => (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
        isSelected ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 flex-1">
        {channel.type === 'private' ? (
          <Lock className="h-4 w-4 text-gray-500" />
        ) : (
          <Hash className="h-4 w-4 text-gray-500" />
        )}
        <span className="font-medium">{channel.name}</span>
      </div>
      <div className="flex items-center gap-2">
        {channel.unreadCount > 0 && (
          <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
            {channel.unreadCount}
          </Badge>
        )}
        <div className={`w-2 h-2 rounded-full ${channel.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
      </div>
    </div>
  );

  const DMItem = ({ dm, isSelected, onClick }) => (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
        isSelected ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={dm.user.avatar} />
          <AvatarFallback className="text-xs">
            {dm.user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(dm.user.status)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">{dm.user.name}</span>
          {dm.unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
              {dm.unreadCount}
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{dm.lastMessage}</p>
      </div>
    </div>
  );

  const MessageBubble = ({ message }) => (
    <div className="group flex gap-3 p-2 hover:bg-gray-50 rounded-lg">
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.user.avatar} />
        <AvatarFallback className="text-xs">
          {message.user.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{message.user.name}</span>
          <span className="text-xs text-gray-500">{message.timestamp}</span>
          {message.isEdited && (
            <Badge variant="outline" className="text-xs">edited</Badge>
          )}
          {message.isPinned && (
            <Pin className="h-3 w-3 text-yellow-500" />
          )}
        </div>
        
        {message.type === 'text' ? (
          <p className="text-sm text-gray-900">{message.content}</p>
        ) : message.type === 'file' ? (
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg max-w-xs">
            <File className="h-8 w-8 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">{message.file.name}</p>
              <p className="text-xs text-gray-500">{message.file.size}</p>
            </div>
            <Button size="sm" variant="outline">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        ) : null}
        
        {message.reactions.length > 0 && (
          <div className="flex gap-1 mt-2">
            {message.reactions.map((reaction, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
          <Reply className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
          <Star className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const currentChannel = selectedChannel || channels[0];
  const currentDM = selectedDM;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Team Chat</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="channels" className="flex-1 p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-gray-700">Channels</h3>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {channels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isSelected={selectedChannel?.id === channel.id}
                  onClick={() => {
                    setSelectedChannel(channel);
                    setSelectedDM(null);
                  }}
                />
              ))}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="messages" className="flex-1 p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-gray-700">Direct Messages</h3>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {directMessages.map((dm) => (
                <DMItem
                  key={dm.id}
                  dm={dm}
                  isSelected={selectedDM?.id === dm.id}
                  onClick={() => {
                    setSelectedDM(dm);
                    setSelectedChannel(null);
                  }}
                />
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentDM ? (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentDM.user.avatar} />
                    <AvatarFallback className="text-xs">
                      {currentDM.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{currentDM.user.name}</h3>
                    <p className="text-sm text-gray-500">{currentDM.user.role}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(currentDM.user.status)}`} />
                </>
              ) : (
                <>
                  {currentChannel.type === 'private' ? (
                    <Lock className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Hash className="h-5 w-5 text-gray-500" />
                  )}
                  <div>
                    <h3 className="font-medium">{currentChannel.name}</h3>
                    <p className="text-sm text-gray-500">{currentChannel.members} members</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Video className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Bell className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-1">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-end gap-2">
            <Button size="sm" variant="outline">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <Textarea
                placeholder={`Message ${currentDM ? currentDM.user.name : `#${currentChannel.name}`}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-[40px] max-h-32 resize-none"
              />
            </div>
            <Button size="sm" variant="outline">
              <Smile className="h-4 w-4" />
            </Button>
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;