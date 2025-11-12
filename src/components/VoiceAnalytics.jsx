import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Volume2, 
  TrendingUp,
  TrendingDown,
  Heart,
  Frown,
  Smile,
  Meh,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  MessageSquare,
  Users,
  Target,
  Zap
} from 'lucide-react';

const VoiceAnalytics = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState({});
  const [callHistory, setCallHistory] = useState([]);

  // Mock call data
  const mockCallHistory = [
    {
      id: 1,
      contact: 'Sarah Johnson - TechCorp',
      date: '2024-01-15',
      duration: '00:23:45',
      sentiment: {
        overall: 0.78,
        customer: 0.82,
        agent: 0.74,
        trend: 'positive'
      },
      emotions: {
        positive: 65,
        neutral: 25,
        negative: 10
      },
      insights: {
        talkRatio: { agent: 45, customer: 55 },
        interruptionCount: 3,
        silenceDuration: 12,
        speakingPace: 'normal',
        keyTopics: ['pricing', 'features', 'timeline', 'integration'],
        objections: ['budget concerns', 'implementation time'],
        commitments: ['follow-up meeting', 'technical demo']
      },
      transcription: [
        { speaker: 'Agent', time: '00:01:23', text: 'Thank you for taking the time to speak with me today, Sarah.' },
        { speaker: 'Customer', time: '00:01:28', text: 'Of course! I\'m excited to learn more about your solution.' },
        { speaker: 'Agent', time: '00:01:35', text: 'Great! Let me start by understanding your current challenges...' }
      ],
      recommendations: [
        'Customer showed high interest - schedule demo within 48 hours',
        'Address budget concerns with ROI calculator',
        'Follow up on integration timeline questions'
      ],
      score: 8.5
    },
    {
      id: 2,
      contact: 'Michael Chen - Global Solutions',
      date: '2024-01-14',
      duration: '00:18:32',
      sentiment: {
        overall: 0.45,
        customer: 0.38,
        agent: 0.52,
        trend: 'declining'
      },
      emotions: {
        positive: 25,
        neutral: 45,
        negative: 30
      },
      insights: {
        talkRatio: { agent: 70, customer: 30 },
        interruptionCount: 8,
        silenceDuration: 25,
        speakingPace: 'fast',
        keyTopics: ['competition', 'pricing', 'concerns'],
        objections: ['too expensive', 'complex setup', 'competitor preference'],
        commitments: []
      },
      transcription: [
        { speaker: 'Agent', time: '00:00:45', text: 'Hi Michael, thanks for joining the call today.' },
        { speaker: 'Customer', time: '00:00:52', text: 'Sure, but I only have about 15 minutes.' },
        { speaker: 'Agent', time: '00:00:58', text: 'No problem, let me quickly show you our key features...' }
      ],
      recommendations: [
        'Customer seemed rushed - consider shorter, more focused approach',
        'Too much agent talking - ask more discovery questions',
        'Address competitor comparison directly'
      ],
      score: 4.2
    }
  ];

  const mockRealTimeAnalysis = {
    sentiment: 0.72,
    emotion: 'positive',
    speakingPace: 'normal',
    volume: 65,
    clarity: 88,
    engagement: 0.85,
    keyPhrases: ['interested', 'budget', 'timeline', 'next steps'],
    currentTopic: 'pricing discussion',
    recommendations: [
      'Customer mentioned budget - present value proposition',
      'Good engagement level - continue current approach'
    ]
  };

  useEffect(() => {
    setCallHistory(mockCallHistory);
  }, []);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRealTimeAnalysis({
          ...mockRealTimeAnalysis,
          sentiment: Math.max(0, Math.min(1, mockRealTimeAnalysis.sentiment + (Math.random() - 0.5) * 0.1)),
          engagement: Math.max(0, Math.min(1, mockRealTimeAnalysis.engagement + (Math.random() - 0.5) * 0.1)),
          volume: Math.max(0, Math.min(100, mockRealTimeAnalysis.volume + (Math.random() - 0.5) * 10))
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setCurrentCall({
      id: Date.now(),
      contact: 'Live Call',
      startTime: new Date(),
      duration: '00:00:00'
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    setCurrentCall(null);
    setRealTimeAnalysis({});
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment >= 0.7) return 'text-green-600';
    if (sentiment >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment >= 0.7) return <Smile className="h-4 w-4 text-green-600" />;
    if (sentiment >= 0.4) return <Meh className="h-4 w-4 text-yellow-600" />;
    return <Frown className="h-4 w-4 text-red-600" />;
  };

  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case 'positive': return 'bg-green-500';
      case 'neutral': return 'bg-gray-500';
      case 'negative': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Analytics</h1>
          <p className="text-muted-foreground">
            Real-time call analysis with sentiment and conversation insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isRecording ? "default" : "secondary"} className="flex items-center space-x-1">
            {isRecording ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
            <span>{isRecording ? 'Recording' : 'Standby'}</span>
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Analysis</TabsTrigger>
          <TabsTrigger value="history">Call History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recording Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="h-5 w-5" />
                  <span>Call Recording</span>
                </CardTitle>
                <CardDescription>
                  Start recording to analyze call in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isRecording ? (
                  <Button onClick={startRecording} className="w-full">
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                        <Mic className="h-8 w-8 text-white" />
                      </div>
                      <p className="font-medium">Recording Active</p>
                      <p className="text-sm text-muted-foreground">00:05:23</p>
                    </div>
                    <Button onClick={stopRecording} variant="destructive" className="w-full">
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                )}

                {/* Audio Controls */}
                {currentCall && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-1/3"></div>
                      </div>
                      <Volume2 className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Real-time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Real-time Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isRecording ? (
                  <div className="text-center text-muted-foreground py-8">
                    Start recording to see real-time analysis
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className={`text-2xl font-bold ${getSentimentColor(realTimeAnalysis.sentiment)}`}>
                          {Math.round(realTimeAnalysis.sentiment * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Sentiment</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(realTimeAnalysis.engagement * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Volume Level</span>
                        <span>{realTimeAnalysis.volume}%</span>
                      </div>
                      <Progress value={realTimeAnalysis.volume} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Clarity</span>
                        <span>{realTimeAnalysis.clarity}%</span>
                      </div>
                      <Progress value={realTimeAnalysis.clarity} />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Current Topic</h4>
                      <Badge variant="outline">{realTimeAnalysis.currentTopic}</Badge>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Key Phrases</h4>
                      <div className="flex flex-wrap gap-1">
                        {realTimeAnalysis.keyPhrases?.map((phrase, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Live Coaching</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isRecording ? (
                  <div className="text-center text-muted-foreground py-8">
                    AI coaching will appear during calls
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {realTimeAnalysis.recommendations?.map((rec, index) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                            <p className="text-sm">{rec}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {callHistory.map((call) => (
              <Card key={call.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Call Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold">{call.contact}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{call.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Volume2 className="h-4 w-4" />
                        <span>{call.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Score:</span>
                        <Badge variant={call.score >= 7 ? "default" : call.score >= 5 ? "secondary" : "destructive"}>
                          {call.score}/10
                        </Badge>
                      </div>
                    </div>

                    {/* Sentiment Analysis */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Sentiment Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Overall</span>
                          <div className="flex items-center space-x-2">
                            {getSentimentIcon(call.sentiment.overall)}
                            <span className={`text-sm ${getSentimentColor(call.sentiment.overall)}`}>
                              {Math.round(call.sentiment.overall * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Customer</span>
                          <span className={`text-sm ${getSentimentColor(call.sentiment.customer)}`}>
                            {Math.round(call.sentiment.customer * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Agent</span>
                          <span className={`text-sm ${getSentimentColor(call.sentiment.agent)}`}>
                            {Math.round(call.sentiment.agent * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key Insights */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Key Insights</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Talk Ratio</span>
                          <span>{call.insights.talkRatio.agent}% / {call.insights.talkRatio.customer}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Interruptions</span>
                          <span>{call.insights.interruptionCount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pace</span>
                          <Badge variant="outline" className="text-xs">
                            {call.insights.speakingPace}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-xs font-medium">Topics:</span>
                        <div className="flex flex-wrap gap-1">
                          {call.insights.keyTopics.slice(0, 3).map((topic, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">AI Recommendations</h4>
                      <ScrollArea className="h-[120px]">
                        <div className="space-y-2">
                          {call.recommendations.map((rec, index) => (
                            <div key={index} className="p-2 bg-muted rounded text-xs">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      {call.insights.objections.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {call.insights.objections.length} Objections
                        </Badge>
                      )}
                      {call.insights.commitments.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {call.insights.commitments.length} Commitments
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Transcript
                      </Button>
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Replay
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-muted-foreground">Total Calls</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">7.2</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">68%</div>
                <div className="text-sm text-muted-foreground">Positive Sentiment</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">18:45</div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Call Quality Score</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">+12%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Customer Sentiment</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">+8%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Talk Ratio Balance</span>
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">-5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Improvement Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Active Listening</span>
                      <span>72%</span>
                    </div>
                    <Progress value={72} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Objection Handling</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Closing Techniques</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} />
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

export default VoiceAnalytics;