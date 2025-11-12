import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Clock, 
  Award,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Users,
  Phone
} from 'lucide-react';

const AISalesCoaching = () => {
  const [activeCall, setActiveCall] = useState(null);
  const [coachingSuggestions, setCoachingSuggestions] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [isListening, setIsListening] = useState(false);

  // Mock real-time coaching suggestions
  const mockSuggestions = [
    {
      id: 1,
      type: 'opportunity',
      priority: 'high',
      message: 'Customer mentioned budget concerns - suggest value-based pricing approach',
      action: 'Present ROI calculator',
      confidence: 92
    },
    {
      id: 2,
      type: 'objection',
      priority: 'medium',
      message: 'Detected price objection - recommend competitive analysis',
      action: 'Share case study',
      confidence: 87
    },
    {
      id: 3,
      type: 'engagement',
      priority: 'low',
      message: 'Customer engagement dropping - ask open-ended question',
      action: 'Use discovery questions',
      confidence: 78
    }
  ];

  const mockMetrics = {
    callScore: 85,
    talkRatio: 65,
    questionRate: 12,
    objectionHandling: 78,
    closingAttempts: 3,
    nextSteps: 'Follow-up scheduled'
  };

  const mockPerformanceData = {
    weeklyStats: {
      callsCompleted: 24,
      avgCallScore: 82,
      conversionRate: 34,
      revenueGenerated: 125000
    },
    improvements: [
      { area: 'Discovery Questions', current: 78, target: 85, improvement: '+7%' },
      { area: 'Objection Handling', current: 82, target: 90, improvement: '+8%' },
      { area: 'Closing Techniques', current: 75, target: 85, improvement: '+10%' },
      { area: 'Product Knowledge', current: 88, target: 92, improvement: '+4%' }
    ]
  };

  useEffect(() => {
    // Simulate real-time suggestions during active call
    if (activeCall) {
      const interval = setInterval(() => {
        setCoachingSuggestions(prev => {
          const newSuggestion = mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)];
          return [{ ...newSuggestion, id: Date.now(), timestamp: new Date() }, ...prev.slice(0, 4)];
        });
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [activeCall]);

  const startCall = () => {
    setActiveCall({
      id: Date.now(),
      contact: 'John Smith - Acme Corp',
      startTime: new Date(),
      type: 'Discovery Call'
    });
    setIsListening(true);
    setCoachingSuggestions([]);
  };

  const endCall = () => {
    setActiveCall(null);
    setIsListening(false);
    // Generate call summary and metrics
    setTimeout(() => {
      setPerformanceMetrics(mockMetrics);
    }, 1000);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'opportunity': return <Target className="h-4 w-4" />;
      case 'objection': return <AlertCircle className="h-4 w-4" />;
      case 'engagement': return <MessageSquare className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Sales Coaching</h1>
          <p className="text-muted-foreground">
            Real-time coaching and performance insights powered by AI
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isListening ? "default" : "secondary"} className="flex items-center space-x-1">
            <Brain className="h-3 w-3" />
            <span>{isListening ? 'AI Active' : 'AI Standby'}</span>
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="live-coaching" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live-coaching">Live Coaching</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="training">Training Modules</TabsTrigger>
        </TabsList>

        <TabsContent value="live-coaching" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Call Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Call Control</span>
                </CardTitle>
                <CardDescription>
                  Start a call to receive real-time AI coaching
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!activeCall ? (
                  <Button onClick={startCall} className="w-full">
                    Start Call Session
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{activeCall.contact}</p>
                          <p className="text-sm text-muted-foreground">{activeCall.type}</p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Live
                        </Badge>
                      </div>
                    </div>
                    <Button onClick={endCall} variant="destructive" className="w-full">
                      End Call
                    </Button>
                  </div>
                )}

                {/* Real-time Metrics */}
                {activeCall && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Real-time Metrics</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">65%</div>
                        <div className="text-xs text-muted-foreground">Talk Ratio</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-green-600">12</div>
                        <div className="text-xs text-muted-foreground">Questions</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5" />
                  <span>AI Suggestions</span>
                </CardTitle>
                <CardDescription>
                  Real-time coaching recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {coachingSuggestions.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {activeCall ? 'Listening for coaching opportunities...' : 'Start a call to see suggestions'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {coachingSuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="p-3 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getSuggestionIcon(suggestion.type)}
                              <Badge variant={getSuggestionColor(suggestion.priority)}>
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {suggestion.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm">{suggestion.message}</p>
                          <Button size="sm" variant="outline" className="w-full">
                            {suggestion.action}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Call Summary */}
          {Object.keys(performanceMetrics).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Call Summary</CardTitle>
                <CardDescription>AI-generated performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{performanceMetrics.callScore}</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{performanceMetrics.talkRatio}%</div>
                    <div className="text-sm text-muted-foreground">Talk Ratio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{performanceMetrics.questionRate}</div>
                    <div className="text-sm text-muted-foreground">Questions Asked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{performanceMetrics.objectionHandling}%</div>
                    <div className="text-sm text-muted-foreground">Objection Handling</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Weekly Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{mockPerformanceData.weeklyStats.callsCompleted}</div>
                    <div className="text-sm text-muted-foreground">Calls Completed</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{mockPerformanceData.weeklyStats.avgCallScore}</div>
                    <div className="text-sm text-muted-foreground">Avg Call Score</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{mockPerformanceData.weeklyStats.conversionRate}%</div>
                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">${mockPerformanceData.weeklyStats.revenueGenerated.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Revenue Generated</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Improvement Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Improvement Areas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockPerformanceData.improvements.map((area, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{area.area}</span>
                      <Badge variant="outline">{area.improvement}</Badge>
                    </div>
                    <Progress value={area.current} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current: {area.current}%</span>
                      <span>Target: {area.target}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Discovery Questions', progress: 78, lessons: 12 },
              { title: 'Objection Handling', progress: 82, lessons: 8 },
              { title: 'Closing Techniques', progress: 75, lessons: 15 },
              { title: 'Product Knowledge', progress: 88, lessons: 20 },
              { title: 'Negotiation Skills', progress: 65, lessons: 10 },
              { title: 'Relationship Building', progress: 92, lessons: 6 }
            ].map((module, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>{module.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {module.lessons} lessons available
                  </div>
                  <Button size="sm" className="w-full">
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISalesCoaching;