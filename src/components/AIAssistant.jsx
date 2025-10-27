import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Phone,
  Mail,
  FileText,
  BarChart3,
  Lightbulb,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { base44Client } from '@/api/base44Client';

const AIAssistant = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI assistant. I can help you with lead analysis, sales forecasting, task management, and much more. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Show me today's hot leads",
        "What's my sales forecast for this month?",
        "Create a follow-up task",
        "Analyze deal pipeline"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleVoiceInput = () => {
    if (recognition.current) {
      if (isListening) {
        recognition.current.stop();
        setIsListening(false);
      } else {
        recognition.current.start();
        setIsListening(true);
      }
    }
  };

  const processAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    let response = {
      type: 'ai',
      content: '',
      timestamp: new Date(),
      suggestions: [],
      actions: []
    };

    const message = userMessage.toLowerCase();

    if (message.includes('lead') || message.includes('prospect')) {
      response.content = "I've analyzed your leads. Here are the key insights:";
      response.suggestions = [
        "Show lead conversion rates",
        "Identify high-value prospects",
        "Schedule follow-ups",
        "Lead source analysis"
      ];
      response.actions = [
        { type: 'chart', title: 'Lead Score Distribution', icon: BarChart3 },
        { type: 'list', title: 'Top 5 Hot Leads', icon: TrendingUp }
      ];
    } else if (message.includes('forecast') || message.includes('sales')) {
      response.content = "Based on current pipeline data, here's your sales forecast:";
      response.suggestions = [
        "Monthly revenue projection",
        "Deal closure probability",
        "Pipeline health check",
        "Team performance metrics"
      ];
      response.actions = [
        { type: 'chart', title: 'Revenue Forecast', icon: DollarSign },
        { type: 'metric', title: 'Pipeline Value: $125,000', icon: TrendingUp }
      ];
    } else if (message.includes('task') || message.includes('reminder')) {
      response.content = "I can help you manage tasks and reminders. What would you like to do?";
      response.suggestions = [
        "Create follow-up task",
        "Schedule meeting",
        "Set reminder",
        "View overdue tasks"
      ];
      response.actions = [
        { type: 'action', title: 'Create Task', icon: Calendar },
        { type: 'action', title: 'Schedule Call', icon: Phone }
      ];
    } else if (message.includes('deal') || message.includes('opportunity')) {
      response.content = "Let me analyze your deals and opportunities:";
      response.suggestions = [
        "Deal stage analysis",
        "Win/loss ratio",
        "Average deal size",
        "Sales cycle length"
      ];
      response.actions = [
        { type: 'chart', title: 'Deal Pipeline', icon: BarChart3 },
        { type: 'insight', title: 'Deals closing this week: 3', icon: Lightbulb }
      ];
    } else if (message.includes('contact') || message.includes('customer')) {
      response.content = "Here's what I found about your contacts and customers:";
      response.suggestions = [
        "Recent interactions",
        "Contact engagement score",
        "Communication history",
        "Relationship strength"
      ];
      response.actions = [
        { type: 'action', title: 'Send Email', icon: Mail },
        { type: 'list', title: 'Recent Contacts', icon: Users }
      ];
    } else {
      response.content = "I can help you with various CRM tasks. Here are some things I can do:";
      response.suggestions = [
        "Analyze sales performance",
        "Manage leads and contacts",
        "Create tasks and reminders",
        "Generate reports"
      ];
      response.actions = [
        { type: 'insight', title: 'Today: 5 new leads, 3 calls scheduled', icon: Lightbulb }
      ];
    }

    setIsTyping(false);
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    const aiResponse = await processAIResponse(inputMessage);
    aiResponse.id = Date.now() + 1;

    setMessages(prev => [...prev, aiResponse]);
  };

  const handleSuggestionClick = async (suggestion) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: suggestion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    const aiResponse = await processAIResponse(suggestion);
    aiResponse.id = Date.now() + 1;

    setMessages(prev => [...prev, aiResponse]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-96 shadow-2xl border-2 transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`}>
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Online
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white rounded-l-lg rounded-tr-lg' 
                        : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
                    } p-3`}>
                      <p className="text-sm">{message.content}</p>
                      
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.actions.map((action, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white/10 rounded-md">
                              <action.icon className="h-4 w-4" />
                              <span className="text-xs">{action.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-r-lg rounded-tl-lg p-3">
                      <div className="flex space-x-1">
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

            <Separator />
            
            <div className="p-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your CRM data..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVoiceInput}
                  className={`px-3 ${isListening ? 'bg-red-100 text-red-600' : ''}`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button onClick={handleSendMessage} size="sm" className="px-3">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AIAssistant;