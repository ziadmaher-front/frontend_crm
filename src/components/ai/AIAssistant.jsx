import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  LightBulbIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  CogIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';

// AI Assistant Engine
class AIAssistantEngine {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    this.baseURL = '/api/ai';
    this.conversationHistory = [];
    this.context = {};
  }

  async sendMessage(message, context = {}) {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message,
          context: { ...this.context, ...context },
          history: this.conversationHistory.slice(-10) // Keep last 10 messages for context
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: data.response, timestamp: new Date().toISOString() }
      );

      return data;
    } catch (error) {
      console.error('AI Assistant Error:', error);
      throw error;
    }
  }

  async getRecommendations(type, data) {
    try {
      const response = await fetch(`${this.baseURL}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type, data })
      });

      if (!response.ok) throw new Error('Failed to get recommendations');
      return response.json();
    } catch (error) {
      console.error('Recommendations Error:', error);
      throw error;
    }
  }

  async analyzeData(data, analysisType) {
    try {
      const response = await fetch(`${this.baseURL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data, type: analysisType })
      });

      if (!response.ok) throw new Error('Failed to analyze data');
      return response.json();
    } catch (error) {
      console.error('Analysis Error:', error);
      throw error;
    }
  }

  async generateContent(type, parameters) {
    try {
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type, parameters })
      });

      if (!response.ok) throw new Error('Failed to generate content');
      return response.json();
    } catch (error) {
      console.error('Content Generation Error:', error);
      throw error;
    }
  }

  updateContext(newContext) {
    this.context = { ...this.context, ...newContext };
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

// Speech Recognition Hook
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => setError(event.error);
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, transcript, error, startListening, stopListening };
};

// Text-to-Speech Hook
const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Select a default voice (preferably English)
      const englishVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0];
      
      setSelectedVoice(englishVoice);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speak = useCallback((text) => {
    if (!selectedVoice) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, voices, selectedVoice, setSelectedVoice };
};

// Message Component
const Message = ({ message, isUser, onSpeak, onCopy, onShare }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900 border border-gray-200'
      }`}>
        {!isUser && (
          <div className="flex items-center space-x-2 mb-2">
            <SparklesIcon className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">AI Assistant</span>
          </div>
        )}
        
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        
        {message.timestamp && (
          <div className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}

        {/* Action Buttons */}
        <AnimatePresence>
          {showActions && !isUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -right-2 top-0 flex flex-col space-y-1"
            >
              <button
                onClick={() => onSpeak(message.content)}
                className="p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                title="Read aloud"
              >
                <SpeakerWaveIcon className="h-3 w-3 text-gray-600" />
              </button>
              <button
                onClick={() => onCopy(message.content)}
                className="p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                title="Copy"
              >
                <ClipboardDocumentIcon className="h-3 w-3 text-gray-600" />
              </button>
              <button
                onClick={() => onShare(message.content)}
                className="p-1 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                title="Share"
              >
                <ShareIcon className="h-3 w-3 text-gray-600" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Quick Actions Component
const QuickActions = ({ onAction }) => {
  const actions = [
    { id: 'analyze-performance', label: 'Analyze Performance', icon: ChartBarIcon, color: 'blue' },
    { id: 'lead-insights', label: 'Lead Insights', icon: UserGroupIcon, color: 'green' },
    { id: 'schedule-meeting', label: 'Schedule Meeting', icon: CalendarIcon, color: 'purple' },
    { id: 'generate-report', label: 'Generate Report', icon: DocumentTextIcon, color: 'orange' },
    { id: 'content-ideas', label: 'Content Ideas', icon: LightBulbIcon, color: 'yellow' },
    { id: 'optimize-workflow', label: 'Optimize Workflow', icon: CogIcon, color: 'red' }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100',
    red: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAction(action.id)}
          className={`p-3 rounded-lg border text-left transition-colors ${colorClasses[action.color]}`}
        >
          <div className="flex items-center space-x-2">
            <action.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{action.label}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

// Main AI Assistant Component
const AIAssistant = ({ isOpen, onClose, context = {} }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiEngine] = useState(() => new AIAssistantEngine());
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();
  
  // Speech recognition and text-to-speech
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const { speak, stop, isSpeaking } = useTextToSpeech();

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        content: `Hello ${user?.name || 'there'}! I'm your AI assistant. I can help you with analytics, lead management, scheduling, content generation, and much more. What would you like to work on today?`,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user, messages.length]);

  // Update AI context when context prop changes
  useEffect(() => {
    if (context && Object.keys(context).length > 0) {
      aiEngine.updateContext(context);
    }
  }, [context, aiEngine]);

  // Handle speech recognition transcript
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
      stopListening();
    }
  }, [transcript, stopListening]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation(
    async (message) => {
      const response = await aiEngine.sendMessage(message, context);
      return response;
    },
    {
      onSuccess: (data) => {
        const assistantMessage = {
          id: Date.now(),
          content: data.response,
          isUser: false,
          timestamp: new Date().toISOString(),
          suggestions: data.suggestions,
          actions: data.actions
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Auto-speak response if enabled
        if (data.response && data.autoSpeak) {
          speak(data.response);
        }
        
        // Handle any suggested actions
        if (data.actions && data.actions.length > 0) {
          data.actions.forEach(action => {
            if (action.type === 'notification') {
              showNotification(action.message, action.level || 'info');
            } else if (action.type === 'refresh') {
              queryClient.invalidateQueries(action.queryKey);
            }
          });
        }
      },
      onError: (error) => {
        showNotification('Failed to send message. Please try again.', 'error');
        console.error('Send message error:', error);
      },
      onSettled: () => {
        setIsLoading(false);
      }
    }
  );

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowQuickActions(false);

    sendMessageMutation.mutate(inputMessage.trim());
  };

  const handleQuickAction = async (actionId) => {
    const actionMessages = {
      'analyze-performance': 'Can you analyze my current sales performance and provide insights?',
      'lead-insights': 'Show me insights about my recent leads and conversion opportunities.',
      'schedule-meeting': 'Help me schedule a meeting with my top prospects.',
      'generate-report': 'Generate a comprehensive sales report for this month.',
      'content-ideas': 'Give me some content ideas for engaging with my leads.',
      'optimize-workflow': 'How can I optimize my current sales workflow?'
    };

    const message = actionMessages[actionId];
    if (message) {
      setInputMessage(message);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      showNotification('Message copied to clipboard', 'success');
    } catch (error) {
      showNotification('Failed to copy message', 'error');
    }
  };

  const handleShareMessage = (content) => {
    if (navigator.share) {
      navigator.share({
        title: 'AI Assistant Response',
        text: content
      });
    } else {
      handleCopyMessage(content);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    aiEngine.clearHistory();
    setShowQuickActions(true);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-600">Your intelligent CRM companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={clearConversation}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear conversation"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            
            {isSpeaking && (
              <button
                onClick={stop}
                className="p-2 text-red-500 hover:text-red-600 transition-colors"
                title="Stop speaking"
              >
                <SpeakerXMarkIcon className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isUser={message.isUser}
              onSpeak={speak}
              onCopy={handleCopyMessage}
              onShare={handleShareMessage}
            />
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <AnimatePresence>
          {showQuickActions && messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 pb-4"
            >
              <QuickActions onAction={handleQuickAction} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your CRM data, analytics, or how I can help..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              <button
                onClick={isListening ? stopListening : startListening}
                className={`absolute right-3 top-3 p-1 rounded-full transition-colors ${
                  isListening 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                <MicrophoneIcon className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-blue-600 flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Listening... Speak now</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistant;