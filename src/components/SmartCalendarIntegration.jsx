import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Brain, 
  Zap, 
  Users, 
  MapPin, 
  Video, 
  Phone, 
  Coffee, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Star, 
  Target, 
  BarChart3, 
  Lightbulb, 
  Globe, 
  Wifi, 
  Battery, 
  Navigation,
  Timer,
  CalendarDays,
  UserCheck,
  MessageSquare,
  FileText,
  Briefcase,
  DollarSign,
  Activity,
  Sparkles,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function SmartCalendarIntegration() {
  const [meetings, setMeetings] = useState([]);
  const [insights, setInsights] = useState({});
  const [optimalTimes, setOptimalTimes] = useState([]);
  const [conflictAnalysis, setConflictAnalysis] = useState({});
  const [meetingPrep, setMeetingPrep] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadMeetings();
    generateInsights();
    analyzeOptimalTimes();
  }, [selectedDate]);

  const loadMeetings = () => {
    // Simulate calendar data
    const sampleMeetings = [
      {
        id: 1,
        title: 'Sales Demo - TechCorp',
        type: 'demo',
        startTime: '2024-01-15T10:00:00',
        endTime: '2024-01-15T11:00:00',
        attendees: [
          { name: 'John Smith', email: 'john@techcorp.com', role: 'CTO', confirmed: true },
          { name: 'Sarah Johnson', email: 'sarah@techcorp.com', role: 'VP Sales', confirmed: false }
        ],
        location: 'Virtual - Zoom',
        dealValue: 150000,
        probability: 75,
        stage: 'demo',
        priority: 'high',
        preparation: {
          completed: 60,
          tasks: [
            { task: 'Review company background', completed: true },
            { task: 'Prepare custom demo', completed: true },
            { task: 'Send calendar invite', completed: true },
            { task: 'Prepare pricing proposal', completed: false },
            { task: 'Research competitor analysis', completed: false }
          ]
        }
      },
      {
        id: 2,
        title: 'Follow-up Call - RetailPlus',
        type: 'follow-up',
        startTime: '2024-01-15T14:30:00',
        endTime: '2024-01-15T15:00:00',
        attendees: [
          { name: 'Mike Davis', email: 'mike@retailplus.com', role: 'CEO', confirmed: true }
        ],
        location: 'Phone Call',
        dealValue: 85000,
        probability: 45,
        stage: 'negotiation',
        priority: 'medium',
        preparation: {
          completed: 80,
          tasks: [
            { task: 'Review previous meeting notes', completed: true },
            { task: 'Prepare objection handling', completed: true },
            { task: 'Update proposal terms', completed: true },
            { task: 'Schedule technical demo', completed: false }
          ]
        }
      },
      {
        id: 3,
        title: 'Discovery Call - StartupX',
        type: 'discovery',
        startTime: '2024-01-15T16:00:00',
        endTime: '2024-01-15T17:00:00',
        attendees: [
          { name: 'Lisa Chen', email: 'lisa@startupx.com', role: 'Founder', confirmed: true },
          { name: 'Tom Wilson', email: 'tom@startupx.com', role: 'CTO', confirmed: true }
        ],
        location: 'Coffee Shop - Downtown',
        dealValue: 45000,
        probability: 25,
        stage: 'discovery',
        priority: 'low',
        preparation: {
          completed: 40,
          tasks: [
            { task: 'Research company and founders', completed: true },
            { task: 'Prepare discovery questions', completed: true },
            { task: 'Review industry trends', completed: false },
            { task: 'Prepare case studies', completed: false },
            { task: 'Plan next steps', completed: false }
          ]
        }
      }
    ];

    setMeetings(sampleMeetings);
  };

  const generateInsights = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const insights = {
        dailyMetrics: {
          totalMeetings: 3,
          totalDealValue: 280000,
          avgProbability: 48.3,
          preparationScore: 60,
          timeBlocked: 4.5,
          travelTime: 0.5
        },
        recommendations: [
          {
            type: 'preparation',
            priority: 'high',
            message: 'Complete pricing proposal for TechCorp demo to increase close probability',
            action: 'Review and finalize proposal',
            impact: '+15% close rate'
          },
          {
            type: 'scheduling',
            priority: 'medium',
            message: 'Consider rescheduling StartupX meeting to morning for better energy levels',
            action: 'Suggest 10 AM slot',
            impact: '+20% engagement'
          },
          {
            type: 'travel',
            priority: 'low',
            message: 'Allow extra 15 minutes for downtown traffic to StartupX meeting',
            action: 'Update calendar',
            impact: 'Avoid being late'
          }
        ],
        patterns: {
          bestPerformingTime: '10:00 AM - 12:00 PM',
          avgMeetingDuration: 52,
          successRateByType: {
            demo: 68,
            discovery: 42,
            followUp: 71,
            closing: 85
          },
          weeklyTrends: {
            monday: 85,
            tuesday: 92,
            wednesday: 78,
            thursday: 88,
            friday: 65
          }
        }
      };

      setInsights(insights);
      setIsAnalyzing(false);
    }, 1500);
  };

  const analyzeOptimalTimes = () => {
    const optimal = [
      {
        time: '9:00 AM',
        score: 95,
        reason: 'Peak energy and focus time',
        type: 'discovery',
        availability: 'free'
      },
      {
        time: '10:30 AM',
        score: 92,
        reason: 'High productivity window',
        type: 'demo',
        availability: 'free'
      },
      {
        time: '2:00 PM',
        score: 78,
        reason: 'Post-lunch engagement',
        type: 'follow-up',
        availability: 'busy'
      },
      {
        time: '3:30 PM',
        score: 85,
        reason: 'Afternoon focus period',
        type: 'closing',
        availability: 'free'
      }
    ];

    setOptimalTimes(optimal);
  };

  const getMeetingTypeIcon = (type) => {
    switch (type) {
      case 'demo': return Video;
      case 'discovery': return MessageSquare;
      case 'follow-up': return Phone;
      case 'closing': return Briefcase;
      default: return Calendar;
    }
  };

  const getMeetingTypeColor = (type) => {
    switch (type) {
      case 'demo': return 'bg-blue-100 text-blue-800';
      case 'discovery': return 'bg-green-100 text-green-800';
      case 'follow-up': return 'bg-yellow-100 text-yellow-800';
      case 'closing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const scheduleOptimalMeeting = (timeSlot) => {
    // Simulate scheduling
    alert(`Scheduling meeting at ${timeSlot.time} - optimal for ${timeSlot.type} meetings`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Smart Calendar Integration
          </h2>
          <p className="text-gray-600">AI-powered meeting insights and optimal scheduling</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button onClick={generateInsights} disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {insights.dailyMetrics?.totalMeetings || 0}
                  </div>
                  <p className="text-sm text-gray-600">Meetings</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(insights.dailyMetrics?.totalDealValue || 0)}
                  </div>
                  <p className="text-sm text-gray-600">Pipeline Value</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {insights.dailyMetrics?.avgProbability || 0}%
                  </div>
                  <p className="text-sm text-gray-600">Avg Probability</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {insights.dailyMetrics?.preparationScore || 0}%
                  </div>
                  <p className="text-sm text-gray-600">Prep Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {insights.dailyMetrics?.timeBlocked || 0}h
                  </div>
                  <p className="text-sm text-gray-600">Time Blocked</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {insights.dailyMetrics?.travelTime || 0}h
                  </div>
                  <p className="text-sm text-gray-600">Travel Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meetings List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Today's Meetings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {meetings.map(meeting => {
                const TypeIcon = getMeetingTypeIcon(meeting.type);
                return (
                  <div
                    key={meeting.id}
                    className={`p-4 rounded-lg border-l-4 ${getPriorityColor(meeting.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <TypeIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <p className="text-sm text-gray-600">
                            {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getMeetingTypeColor(meeting.type)}>
                          {meeting.type}
                        </Badge>
                        <Badge variant="outline">
                          {meeting.probability}% close
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{meeting.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{formatCurrency(meeting.dealValue)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{meeting.attendees.length} attendees</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Preparation Progress</span>
                        <span className="text-sm text-gray-600">
                          {meeting.preparation.completed}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${meeting.preparation.completed}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {meeting.preparation.tasks.map((task, index) => (
                          <Badge
                            key={index}
                            variant={task.completed ? "default" : "outline"}
                            className="text-xs"
                          >
                            {task.completed ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                            {task.task}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        {meeting.attendees.map((attendee, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <UserCheck className={`h-4 w-4 ${attendee.confirmed ? 'text-green-600' : 'text-gray-400'}`} />
                            <span className="text-xs text-gray-600">{attendee.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.recommendations?.map((rec, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                    <span className="text-xs text-gray-600 capitalize">{rec.type}</span>
                  </div>
                  <p className="text-sm mb-2">{rec.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">{rec.impact}</span>
                    <Button size="sm" variant="outline">
                      {rec.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Optimal Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Optimal Time Slots
              </CardTitle>
              <CardDescription>
                AI-suggested best times for scheduling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {optimalTimes.map((slot, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{slot.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{slot.score}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{slot.reason}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={getMeetingTypeColor(slot.type)}>
                      Best for {slot.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant={slot.availability === 'free' ? 'default' : 'outline'}
                      disabled={slot.availability === 'busy'}
                      onClick={() => scheduleOptimalMeeting(slot)}
                    >
                      {slot.availability === 'free' ? 'Schedule' : 'Busy'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Best Performing Time</h4>
                <p className="text-sm text-gray-600">{insights.patterns?.bestPerformingTime}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Success Rate by Type</h4>
                <div className="space-y-2">
                  {Object.entries(insights.patterns?.successRateByType || {}).map(([type, rate]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Weekly Trends</h4>
                <div className="space-y-2">
                  {Object.entries(insights.patterns?.weeklyTrends || {}).map(([day, score]) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{day}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}