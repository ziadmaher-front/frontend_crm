import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Search,
  Filter,
  Archive,
  Star,
  Clock,
  CheckCheck,
  User,
  Bot,
  AlertCircle,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LiveChat = () => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: null,
        status: 'online'
      },
      lastMessage: 'Hi, I need help with my recent order',
      timestamp: '2 min ago',
      unreadCount: 2,
      status: 'active',
      priority: 'high',
      assignedTo: 'John Doe'
    },
    {
      id: 2,
      customer: {
        name: 'Mike Chen',
        email: 'mike@example.com',
        avatar: null,
        status: 'away'
      },
      lastMessage: 'Thank you for the quick response!',
      timestamp: '15 min ago',
      unreadCount: 0,
      status: 'resolved',
      priority: 'medium',
      assignedTo: 'Jane Smith'
    },
    {
      id: 3,
      customer: {
        name: 'Emma Wilson',
        email: 'emma@example.com',
        avatar: null,
        status: 'offline'
      },
      lastMessage: 'Can you help me with pricing?',
      timestamp: '1 hour ago',
      unreadCount: 1,
      status: 'waiting',
      priority: 'low',
      assignedTo: null
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'customer',
      content: 'Hi, I need help with my recent order',
      timestamp: '2:30 PM',
      status: 'delivered'
    },
    {
      id: 2,
      sender: 'agent',
      content: 'Hello Sarah! I\'d be happy to help you with your order. Could you please provide me with your order number?',
      timestamp: '2:31 PM',
      status: 'read'
    },
    {
      id: 3,
      sender: 'customer',
      content: 'Sure, it\'s #ORD-12345. I haven\'t received any shipping updates.',
      timestamp: '2:32 PM',
      status: 'delivered'
    },
    {
      id: 4,
      sender: 'system',
      content: 'Order #ORD-12345 was shipped via FedEx. Tracking: 1234567890',
      timestamp: '2:33 PM',
      status: 'info'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const messagesEndRef = useRef(null);

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
      sender: 'agent',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate customer typing response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const customerResponse = {
          id: messages.length + 2,
          sender: 'customer',
          content: 'Thank you for the information!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered'
        };
        setMessages(prev => [...prev, customerResponse]);
      }, 2000);
    }, 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'resolved': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const ConversationItem = ({ conversation, isSelected, onClick }) => (
    <div
      className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 ${
        isSelected ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.customer.avatar} />
            <AvatarFallback>
              {conversation.customer.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            conversation.customer.status === 'online' ? 'bg-green-500' :
            conversation.customer.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium truncate">{conversation.customer.name}</h4>
            <div className="flex items-center gap-1">
              {conversation.unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                  {conversation.unreadCount}
                </Badge>
              )}
              <span className="text-xs text-gray-500">{conversation.timestamp}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`} />
              <span className="text-xs text-gray-500 capitalize">{conversation.status}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className={`h-3 w-3 ${getPriorityColor(conversation.priority)}`} />
              <span className={`text-xs ${getPriorityColor(conversation.priority)}`}>
                {conversation.priority}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MessageBubble = ({ message }) => {
    const isAgent = message.sender === 'agent';
    const isSystem = message.sender === 'system';
    
    if (isSystem) {
      return (
        <div className="flex justify-center my-2">
          <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
            <Bot className="h-3 w-3 inline mr-1" />
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isAgent 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
          <div className={`flex items-center justify-between mt-1 ${
            isAgent ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span className="text-xs">{message.timestamp}</span>
            {isAgent && (
              <CheckCheck className={`h-3 w-3 ml-2 ${
                message.status === 'read' ? 'text-blue-200' : 'text-blue-300'
              }`} />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Live Chat</h2>
            <Button size="sm" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {['all', 'active', 'waiting', 'resolved'].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                className="text-xs"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversation?.id === conversation.id}
              onClick={() => setSelectedConversation(conversation)}
            />
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.customer.avatar} />
                    <AvatarFallback>
                      {selectedConversation.customer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedConversation.customer.name}</h3>
                    <p className="text-sm text-gray-500">{selectedConversation.customer.email}</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(selectedConversation.status)}>
                    {selectedConversation.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-2">
                <Button size="sm" variant="outline">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Smile className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
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
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveChat;