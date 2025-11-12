import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Lightbulb,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Target,
  BarChart3,
  FileText,
  Search,
  Zap,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { AnimatedCard, StaggerContainer } from '@/components/MicroInteractions';

const ConversationalAI = ({ 
  crmData = {}, 
  onQueryExecuted, 
  onActionRequested,
  isMinimized = false,
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI assistant. I can help you with sales insights, deal analysis, lead management, and more. Try asking me something like 'Show me my top deals this month' or 'What leads need follow-up?'",
      timestamp: new Date(),
      suggestions: [
        "Show me my top deals this month",
        "What leads need follow-up?",
        "Analyze my sales performance",
        "Find deals at risk"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Natural Language Processing patterns
  const nlpPatterns = {
    deals: {
      patterns: [
        /show.*deals?/i,
        /top.*deals?/i,
        /best.*deals?/i,
        /deals?.*(month|week|today|quarter)/i,
        /pipeline/i
      ],
      intent: 'show_deals'
    },
    leads: {
      patterns: [
        /leads?/i,
        /prospects?/i,
        /new.*leads?/i,
        /follow.*up/i,
        /contact/i
      ],
      intent: 'show_leads'
    },
    performance: {
      patterns: [
        /performance/i,
        /sales.*report/i,
        /revenue/i,
        /quota/i,
        /target/i,
        /analytics/i
      ],
      intent: 'show_performance'
    },
    risk: {
      patterns: [
        /risk/i,
        /stalled/i,
        /stuck/i,
        /problem/i,
        /issue/i,
        /at.*risk/i
      ],
      intent: 'show_risks'
    },
    forecast: {
      patterns: [
        /forecast/i,
        /predict/i,
        /projection/i,
        /next.*month/i,
        /future/i
      ],
      intent: 'show_forecast'
    },
    tasks: {
      patterns: [
        /tasks?/i,
        /todo/i,
        /schedule/i,
        /calendar/i,
        /meeting/i,
        /appointment/i
      ],
      intent: 'show_tasks'
    }
  };

  // AI Response Generator
  const generateAIResponse = async (query) => {
    const intent = detectIntent(query);
    const entities = extractEntities(query);
    
    switch (intent) {
      case 'show_deals':
        return generateDealsResponse(entities);
      case 'show_leads':
        return generateLeadsResponse(entities);
      case 'show_performance':
        return generatePerformanceResponse(entities);
      case 'show_risks':
        return generateRiskResponse(entities);
      case 'show_forecast':
        return generateForecastResponse(entities);
      case 'show_tasks':
        return generateTasksResponse(entities);
      default:
        return generateGeneralResponse(query);
    }
  };

  const detectIntent = (query) => {
    for (const [category, config] of Object.entries(nlpPatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(query)) {
          return config.intent;
        }
      }
    }
    return 'general';
  };

  const extractEntities = (query) => {
    const entities = {
      timeframe: null,
      amount: null,
      stage: null,
      status: null
    };

    // Time entities
    if (/today/i.test(query)) entities.timeframe = 'today';
    else if (/week/i.test(query)) entities.timeframe = 'week';
    else if (/month/i.test(query)) entities.timeframe = 'month';
    else if (/quarter/i.test(query)) entities.timeframe = 'quarter';
    else if (/year/i.test(query)) entities.timeframe = 'year';

    // Amount entities
    const amountMatch = query.match(/\$?([\d,]+)/);
    if (amountMatch) entities.amount = parseInt(amountMatch[1].replace(',', ''));

    // Stage entities
    if (/prospect/i.test(query)) entities.stage = 'prospecting';
    else if (/qualify/i.test(query)) entities.stage = 'qualification';
    else if (/proposal/i.test(query)) entities.stage = 'proposal';
    else if (/negotiat/i.test(query)) entities.stage = 'negotiation';

    return entities;
  };

  const generateDealsResponse = (entities) => {
    const mockDeals = [
      { name: 'Acme Corp Deal', value: 150000, stage: 'Proposal', probability: 75 },
      { name: 'TechStart Solution', value: 85000, stage: 'Negotiation', probability: 90 },
      { name: 'Global Industries', value: 200000, stage: 'Qualification', probability: 45 }
    ];

    const timeframe = entities.timeframe || 'month';
    const totalValue = mockDeals.reduce((sum, deal) => sum + deal.value, 0);

    return {
      content: `Here are your top deals for this ${timeframe}:`,
      data: mockDeals,
      summary: `Total pipeline value: $${totalValue.toLocaleString()}`,
      actions: [
        { label: 'View All Deals', action: 'navigate_deals' },
        { label: 'Create New Deal', action: 'create_deal' }
      ],
      insights: [
        `You have ${mockDeals.length} active deals`,
        `Average deal size: $${Math.round(totalValue / mockDeals.length).toLocaleString()}`,
        `Highest probability: ${Math.max(...mockDeals.map(d => d.probability))}%`
      ]
    };
  };

  const generateLeadsResponse = (entities) => {
    const mockLeads = [
      { name: 'Sarah Johnson', company: 'Innovation Labs', score: 85, lastContact: '2 days ago' },
      { name: 'Mike Chen', company: 'Future Systems', score: 72, lastContact: '5 days ago' },
      { name: 'Lisa Rodriguez', company: 'NextGen Solutions', score: 91, lastContact: '1 day ago' }
    ];

    return {
      content: 'Here are your high-priority leads that need attention:',
      data: mockLeads,
      summary: `${mockLeads.length} leads requiring follow-up`,
      actions: [
        { label: 'Contact Lead', action: 'contact_lead' },
        { label: 'Schedule Meeting', action: 'schedule_meeting' }
      ],
      insights: [
        `Average lead score: ${Math.round(mockLeads.reduce((sum, lead) => sum + lead.score, 0) / mockLeads.length)}`,
        `${mockLeads.filter(l => l.score > 80).length} hot leads`,
        'Best time to contact: 10-11 AM or 2-3 PM'
      ]
    };
  };

  const generatePerformanceResponse = (entities) => {
    const mockMetrics = {
      revenue: 450000,
      quota: 500000,
      deals_closed: 12,
      conversion_rate: 24
    };

    return {
      content: 'Here\'s your sales performance summary:',
      data: mockMetrics,
      summary: `${Math.round((mockMetrics.revenue / mockMetrics.quota) * 100)}% of quota achieved`,
      actions: [
        { label: 'View Detailed Report', action: 'view_report' },
        { label: 'Set New Goals', action: 'set_goals' }
      ],
      insights: [
        `Revenue: $${mockMetrics.revenue.toLocaleString()} / $${mockMetrics.quota.toLocaleString()}`,
        `${mockMetrics.deals_closed} deals closed this month`,
        `${mockMetrics.conversion_rate}% conversion rate`
      ]
    };
  };

  const generateRiskResponse = (entities) => {
    const riskDeals = [
      { name: 'Stalled Enterprise Deal', risk: 'High', reason: 'No contact for 15 days' },
      { name: 'Budget Concerns Deal', risk: 'Medium', reason: 'Price objections raised' }
    ];

    return {
      content: 'I found these deals that need immediate attention:',
      data: riskDeals,
      summary: `${riskDeals.length} deals at risk`,
      actions: [
        { label: 'Contact Customer', action: 'contact_customer' },
        { label: 'Review Strategy', action: 'review_strategy' }
      ],
      insights: [
        'Recommended: Follow up within 24 hours',
        'Consider offering value-add services',
        'Schedule stakeholder meeting'
      ]
    };
  };

  const generateForecastResponse = (entities) => {
    return {
      content: 'Based on current pipeline and historical data:',
      data: {
        next_month: 180000,
        confidence: 78,
        deals_likely: 6
      },
      summary: 'Projected revenue: $180,000 next month',
      actions: [
        { label: 'View Forecast Details', action: 'view_forecast' },
        { label: 'Adjust Pipeline', action: 'adjust_pipeline' }
      ],
      insights: [
        '78% confidence level',
        '6 deals likely to close',
        'Focus on high-probability deals'
      ]
    };
  };

  const generateTasksResponse = (entities) => {
    const tasks = [
      { task: 'Follow up with Acme Corp', due: 'Today', priority: 'High' },
      { task: 'Prepare proposal for TechStart', due: 'Tomorrow', priority: 'Medium' },
      { task: 'Schedule demo for Global Industries', due: 'This week', priority: 'High' }
    ];

    return {
      content: 'Here are your upcoming tasks:',
      data: tasks,
      summary: `${tasks.length} tasks pending`,
      actions: [
        { label: 'Mark Complete', action: 'complete_task' },
        { label: 'Add New Task', action: 'add_task' }
      ],
      insights: [
        `${tasks.filter(t => t.priority === 'High').length} high-priority tasks`,
        'Recommended: Complete high-priority tasks first',
        'Average task completion time: 2.5 hours'
      ]
    };
  };

  const generateGeneralResponse = (query) => {
    const responses = [
      "I can help you with sales data, deal analysis, lead management, and performance insights. What would you like to know?",
      "I'm here to assist with your CRM needs. Try asking about your deals, leads, or sales performance.",
      "I can analyze your sales data and provide insights. What specific information are you looking for?"
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        "Show me my pipeline",
        "What deals need attention?",
        "Analyze my performance",
        "Find hot leads"
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputValue);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse.content,
        data: aiResponse.data,
        summary: aiResponse.summary,
        actions: aiResponse.actions,
        insights: aiResponse.insights,
        suggestions: aiResponse.suggestions,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      if (onQueryExecuted) {
        onQueryExecuted(inputValue, aiResponse);
      }
    }, 1500);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleActionClick = (action) => {
    if (onActionRequested) {
      onActionRequested(action);
    }
  };

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input implementation would go here
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`p-2 rounded-full ${
          message.type === 'user' ? 'bg-blue-500' : 'bg-gray-200'
        }`}>
          {message.type === 'user' ? 
            <User className="w-4 h-4 text-white" /> : 
            <Bot className="w-4 h-4 text-gray-600" />
          }
        </div>
        <div className={`p-4 rounded-lg ${
          message.type === 'user' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
          
          {/* Data Display */}
          {message.data && Array.isArray(message.data) && (
            <div className="mt-3 space-y-2">
              {message.data.map((item, idx) => (
                <div key={idx} className="p-2 bg-white/10 rounded text-xs">
                  {typeof item === 'object' ? (
                    <div className="flex justify-between">
                      <span>{item.name || item.task}</span>
                      <span className="font-medium">
                        {item.value ? `$${item.value.toLocaleString()}` : 
                         item.score ? `${item.score}%` : 
                         item.probability ? `${item.probability}%` : 
                         item.priority || item.stage}
                      </span>
                    </div>
                  ) : (
                    <span>{item}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {message.summary && (
            <div className="mt-3 p-2 bg-white/10 rounded text-xs font-medium">
              {message.summary}
            </div>
          )}

          {/* Insights */}
          {message.insights && (
            <div className="mt-3">
              <div className="text-xs font-medium mb-2 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Key Insights:
              </div>
              <ul className="text-xs space-y-1">
                {message.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {message.actions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.actions.map((action, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => handleActionClick(action.action)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {message.suggestions && (
            <div className="mt-3">
              <div className="text-xs font-medium mb-2">Try asking:</div>
              <div className="flex flex-wrap gap-1">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs opacity-70 mt-2">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggleMinimize}
          className="rounded-full w-14 h-14 bg-blue-500 hover:bg-blue-600 shadow-lg"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <AnimatedCard className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <p className="text-sm text-gray-600">Ask me anything about your CRM data</p>
            </div>
          </div>
          {onToggleMinimize && (
            <Button variant="ghost" size="sm" onClick={onToggleMinimize}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gray-200">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="p-4 rounded-lg bg-gray-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about your deals, leads, performance..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={toggleVoiceInput}
              variant="outline"
              size="sm"
              className={isListening ? 'bg-red-50 border-red-200' : ''}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button onClick={handleSendMessage} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  );
};

export default ConversationalAI;