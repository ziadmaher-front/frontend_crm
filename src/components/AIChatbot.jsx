import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Settings, 
  Brain, 
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Download,
  Upload,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Paperclip,
  Image,
  FileText,
  Star,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedPersonality, setSelectedPersonality] = useState('professional');
  const [autoResponse, setAutoResponse] = useState(true);
  const messagesEndRef = useRef(null);

  // Sample conversation data
  const sampleConversations = [
    {
      id: 1,
      customer: 'Sarah Johnson',
      status: 'active',
      lastMessage: 'How can I upgrade my subscription?',
      timestamp: '2 min ago',
      satisfaction: 4.5,
      resolved: false,
      priority: 'medium'
    },
    {
      id: 2,
      customer: 'Mike Chen',
      status: 'waiting',
      lastMessage: 'I need help with integration setup',
      timestamp: '5 min ago',
      satisfaction: null,
      resolved: false,
      priority: 'high'
    },
    {
      id: 3,
      customer: 'Emma Wilson',
      status: 'resolved',
      lastMessage: 'Thank you for the quick help!',
      timestamp: '1 hour ago',
      satisfaction: 5.0,
      resolved: true,
      priority: 'low'
    }
  ];

  // Sample analytics data
  const chatbotAnalytics = {
    totalConversations: 1247,
    resolvedAutomatically: 892,
    averageResponseTime: '1.2s',
    satisfactionScore: 4.3,
    escalationRate: 12.5,
    activeConversations: 23,
    dailyInteractions: [
      { date: '2024-01-01', interactions: 45, resolved: 38 },
      { date: '2024-01-02', interactions: 52, resolved: 44 },
      { date: '2024-01-03', interactions: 38, resolved: 32 },
      { date: '2024-01-04', interactions: 61, resolved: 55 },
      { date: '2024-01-05', interactions: 48, resolved: 41 },
      { date: '2024-01-06', interactions: 55, resolved: 49 },
      { date: '2024-01-07', interactions: 43, resolved: 37 }
    ]
  };

  // Sample knowledge base
  const knowledgeBase = [
    {
      category: 'Account Management',
      topics: [
        { title: 'Password Reset', confidence: 95, usage: 234 },
        { title: 'Subscription Upgrade', confidence: 88, usage: 156 },
        { title: 'Billing Issues', confidence: 92, usage: 189 }
      ]
    },
    {
      category: 'Technical Support',
      topics: [
        { title: 'Integration Setup', confidence: 85, usage: 98 },
        { title: 'API Documentation', confidence: 90, usage: 145 },
        { title: 'Troubleshooting', confidence: 87, usage: 167 }
      ]
    },
    {
      category: 'Product Features',
      topics: [
        { title: 'Dashboard Navigation', confidence: 93, usage: 201 },
        { title: 'Report Generation', confidence: 89, usage: 134 },
        { title: 'Data Export', confidence: 91, usage: 112 }
      ]
    }
  ];

  // Sample quick responses
  const quickResponses = [
    'How can I help you today?',
    'Let me check that for you.',
    'I\'ll connect you with a human agent.',
    'Is there anything else I can help with?',
    'Thank you for contacting support!'
  ];

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: 'Hello! I\'m your AI assistant. How can I help you today?',
          timestamp: new Date(),
          confidence: 1.0,
          intent: 'greeting'
        }
      ]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput) => {
    // Simple AI response simulation
    const responses = {
      greeting: [
        'Hello! How can I assist you today?',
        'Hi there! What can I help you with?',
        'Welcome! I\'m here to help.'
      ],
      pricing: [
        'I can help you with pricing information. Our plans start at $29/month for the basic package.',
        'Let me get you the latest pricing details. Would you like to see our current plans?'
      ],
      support: [
        'I\'m here to help with any technical issues. Can you describe the problem you\'re experiencing?',
        'Let me assist you with that. Could you provide more details about the issue?'
      ],
      default: [
        'I understand your question. Let me find the best answer for you.',
        'That\'s a great question! Let me help you with that.',
        'I\'m processing your request. One moment please.'
      ]
    };

    let category = 'default';
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      category = 'greeting';
    } else if (input.includes('price') || input.includes('cost') || input.includes('plan')) {
      category = 'pricing';
    } else if (input.includes('help') || input.includes('support') || input.includes('problem')) {
      category = 'support';
    }

    const responseOptions = responses[category];
    const selectedResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];

    return {
      id: messages.length + 2,
      type: 'bot',
      content: selectedResponse,
      timestamp: new Date(),
      confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
      intent: category,
      suggestions: category === 'pricing' ? ['View Plans', 'Contact Sales', 'Free Trial'] : 
                  category === 'support' ? ['Technical Docs', 'Video Tutorial', 'Live Chat'] : []
    };
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  const handleMessageFeedback = (messageId, feedback) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));
  };

  const MessageBubble = ({ message }) => (
    <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.type === 'bot' && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${message.type === 'user' ? 'order-first' : ''}`}>
        <div className={`p-3 rounded-lg ${
          message.type === 'user' 
            ? 'bg-blue-500 text-white ml-auto' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
          
          {message.type === 'bot' && message.confidence && (
            <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
              <span>Confidence: {(message.confidence * 100).toFixed(0)}%</span>
              {message.intent && <Badge variant="outline" className="text-xs">{message.intent}</Badge>}
            </div>
          )}
        </div>
        
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={() => setInputMessage(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
          
          {message.type === 'bot' && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleMessageFeedback(message.id, 'positive')}
              >
                <ThumbsUp className={`h-3 w-3 ${
                  message.feedback === 'positive' ? 'text-green-500' : 'text-gray-400'
                }`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleMessageFeedback(message.id, 'negative')}
              >
                <ThumbsDown className={`h-3 w-3 ${
                  message.feedback === 'negative' ? 'text-red-500' : 'text-gray-400'
                }`} />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {message.type === 'user' && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );

  const ConversationCard = ({ conversation }) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">{conversation.customer}</h4>
              <Badge variant={
                conversation.status === 'active' ? 'default' :
                conversation.status === 'waiting' ? 'destructive' : 'secondary'
              }>
                {conversation.status}
              </Badge>
              <Badge variant="outline" className={
                conversation.priority === 'high' ? 'border-red-500 text-red-600' :
                conversation.priority === 'medium' ? 'border-yellow-500 text-yellow-600' :
                'border-green-500 text-green-600'
              }>
                {conversation.priority}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{conversation.lastMessage}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{conversation.timestamp}</span>
              {conversation.satisfaction && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{conversation.satisfaction}/5</span>
                </div>
              )}
              {conversation.resolved && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Resolved</span>
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className={`h-4 w-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-blue-500" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Customer Support Chatbot</h2>
          <p className="text-gray-600">Intelligent conversational AI with natural language understanding</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={chatbotEnabled ? 'default' : 'secondary'}>
            {chatbotEnabled ? 'Active' : 'Inactive'}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Conversations"
          value={chatbotAnalytics.totalConversations.toLocaleString()}
          change="+12.5%"
          icon={MessageCircle}
          trend="up"
        />
        <MetricCard
          title="Auto-Resolved"
          value={`${((chatbotAnalytics.resolvedAutomatically / chatbotAnalytics.totalConversations) * 100).toFixed(1)}%`}
          change="+8.3%"
          icon={CheckCircle}
          trend="up"
        />
        <MetricCard
          title="Avg Response Time"
          value={chatbotAnalytics.averageResponseTime}
          change="-15.2%"
          icon={Clock}
          trend="up"
        />
        <MetricCard
          title="Satisfaction Score"
          value={`${chatbotAnalytics.satisfactionScore}/5`}
          change="+0.3"
          icon={Star}
          trend="up"
        />
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
          <TabsTrigger value="conversations">Active Conversations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-blue-500" />
                      AI Assistant
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleVoiceToggle}
                        className={isListening ? 'text-red-500' : ''}
                      >
                        {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      
                      {isTyping && (
                        <div className="flex gap-3 justify-start">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Responses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickResponses.map((response, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => setInputMessage(response)}
                    >
                      {response}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Natural Language Processing</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Intent Recognition</span>
                    <Badge variant="default">95% Accuracy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Generation</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Learning Mode</span>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Conversations</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{sampleConversations.filter(c => c.status === 'active').length} Active</Badge>
              <Badge variant="destructive">{sampleConversations.filter(c => c.status === 'waiting').length} Waiting</Badge>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {sampleConversations.map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Resolution Rate</span>
                    <span className="font-medium">71.5%</span>
                  </div>
                  <Progress value={71.5} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Satisfaction</span>
                    <span className="font-medium">86%</span>
                  </div>
                  <Progress value={86} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Accuracy</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Escalation Rate</span>
                    <span className="font-medium">12.5%</span>
                  </div>
                  <Progress value={12.5} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-gray-600">Total Chats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">892</div>
                    <div className="text-sm text-gray-600">Auto-Resolved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">23</div>
                    <div className="text-sm text-gray-600">Active Now</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">4.3</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {knowledgeBase.map((category, index) => (
                  <div key={index}>
                    <h4 className="font-medium mb-3">{category.category}</h4>
                    <div className="space-y-2">
                      {category.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{topic.title}</span>
                            <div className="text-sm text-gray-600">Used {topic.usage} times</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={topic.confidence} className="w-20 h-2" />
                            <span className="text-sm font-medium">{topic.confidence}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Chatbot Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="chatbot-enabled">Enable Chatbot</Label>
                    <p className="text-sm text-gray-600">Allow AI to handle customer inquiries</p>
                  </div>
                  <Switch 
                    id="chatbot-enabled"
                    checked={chatbotEnabled}
                    onCheckedChange={setChatbotEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-response">Auto Response</Label>
                    <p className="text-sm text-gray-600">Automatically respond to common questions</p>
                  </div>
                  <Switch 
                    id="auto-response"
                    checked={autoResponse}
                    onCheckedChange={setAutoResponse}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="voice-enabled">Voice Support</Label>
                    <p className="text-sm text-gray-600">Enable voice input and output</p>
                  </div>
                  <Switch 
                    id="voice-enabled"
                    checked={voiceEnabled}
                    onCheckedChange={setVoiceEnabled}
                  />
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="personality">AI Personality</Label>
                  <Select value={selectedPersonality} onValueChange={setSelectedPersonality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
                  <Input 
                    id="confidence-threshold"
                    type="number" 
                    placeholder="80"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">Minimum confidence for auto-responses</p>
                </div>

                <div>
                  <Label htmlFor="max-conversation">Max Conversation Length</Label>
                  <Input 
                    id="max-conversation"
                    type="number" 
                    placeholder="50"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">Maximum messages before escalation</p>
                </div>

                <div>
                  <Label htmlFor="response-delay">Response Delay (ms)</Label>
                  <Input 
                    id="response-delay"
                    type="number" 
                    placeholder="1000"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">Simulate human-like response timing</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button>Save Settings</Button>
                  <Button variant="outline">Reset Defaults</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIChatbot;