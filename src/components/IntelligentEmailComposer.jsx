import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Sparkles, 
  Brain, 
  Wand2, 
  Target, 
  Clock, 
  TrendingUp, 
  Users, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Send,
  Save,
  Eye,
  Zap,
  BarChart3,
  MessageSquare,
  Smile,
  Frown,
  Meh,
  ThumbsUp,
  Calendar,
  Phone,
  FileText,
  Globe
} from 'lucide-react';

export default function IntelligentEmailComposer({ recipient, context, onSend, onSave }) {
  const [emailData, setEmailData] = useState({
    to: recipient?.email || '',
    subject: '',
    body: '',
    tone: 'professional',
    priority: 'normal',
    template: null
  });

  const [aiSuggestions, setAiSuggestions] = useState({
    subjects: [],
    content: [],
    improvements: [],
    tone: null
  });

  const [emailAnalysis, setEmailAnalysis] = useState({
    sentiment: null,
    readability: null,
    engagement: null,
    length: null,
    cta: null
  });

  const [smartTemplates, setSmartTemplates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadSmartTemplates();
    if (recipient) {
      generatePersonalizedSuggestions();
    }
  }, [recipient, context]);

  useEffect(() => {
    if (emailData.body) {
      analyzeEmail();
      generateContentSuggestions();
    }
  }, [emailData.body, emailData.tone]);

  const loadSmartTemplates = () => {
    const templates = [
      {
        id: 1,
        name: 'Cold Outreach - Enterprise',
        category: 'prospecting',
        tone: 'professional',
        subject: 'Exploring partnership opportunities with {{company}}',
        body: `Hi {{firstName}},

I hope this email finds you well. I've been following {{company}}'s impressive growth in the {{industry}} sector, particularly your recent {{recentNews}}.

At {{ourCompany}}, we've helped similar organizations like {{similarClient}} achieve {{benefit}} through our {{solution}}. I believe there could be a valuable opportunity for us to discuss how we might support {{company}}'s continued success.

Would you be open to a brief 15-minute conversation next week to explore this further?

Best regards,
{{senderName}}`,
        variables: ['firstName', 'company', 'industry', 'recentNews', 'ourCompany', 'similarClient', 'benefit', 'solution', 'senderName'],
        successRate: 23.5,
        avgResponseTime: '2.3 days'
      },
      {
        id: 2,
        name: 'Follow-up - Demo Request',
        category: 'follow-up',
        tone: 'friendly',
        subject: 'Quick follow-up on our {{product}} demo',
        body: `Hi {{firstName}},

I wanted to follow up on the {{product}} demo we discussed. I know you mentioned being interested in {{specificFeature}} to help with {{painPoint}}.

I've prepared a customized demo that focuses specifically on your use case. The demo would take about 20 minutes and I can show you exactly how {{product}} would integrate with your current {{currentTool}} workflow.

Are you available for a quick call this week? I have openings on {{availableTimes}}.

Looking forward to hearing from you!

Best,
{{senderName}}`,
        variables: ['firstName', 'product', 'specificFeature', 'painPoint', 'currentTool', 'availableTimes', 'senderName'],
        successRate: 45.2,
        avgResponseTime: '1.1 days'
      },
      {
        id: 3,
        name: 'Proposal Follow-up',
        category: 'closing',
        tone: 'confident',
        subject: 'Next steps for {{company}} - {{solution}} implementation',
        body: `Hi {{firstName}},

Thank you for taking the time to review our proposal for {{solution}}. I'm excited about the potential to help {{company}} achieve {{goalMetric}} improvement in {{timeframe}}.

Based on our conversation, I understand your main priorities are:
• {{priority1}}
• {{priority2}}
• {{priority3}}

I'd love to address any questions you might have and discuss the implementation timeline. Would you prefer a call or should I prepare additional documentation on {{specificConcern}}?

I'm confident we can deliver exceptional results for {{company}}, just as we did for {{caseStudyClient}} who saw {{caseStudyResult}}.

Best regards,
{{senderName}}`,
        variables: ['firstName', 'company', 'solution', 'goalMetric', 'timeframe', 'priority1', 'priority2', 'priority3', 'specificConcern', 'caseStudyClient', 'caseStudyResult', 'senderName'],
        successRate: 67.8,
        avgResponseTime: '0.8 days'
      }
    ];

    setSmartTemplates(templates);
  };

  const generatePersonalizedSuggestions = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const suggestions = {
      subjects: [
        `Partnership opportunity with ${recipient?.company || 'your company'}`,
        `Quick question about ${recipient?.company || 'your'} ${recipient?.industry || 'business'} goals`,
        `${recipient?.firstName || 'Hi'} - exploring synergies between our companies`,
        `Helping ${recipient?.company || 'your team'} achieve ${getIndustryGoal(recipient?.industry)}`,
        `${recipient?.firstName || 'Hello'} - ${getPersonalizedHook(recipient)}`
      ],
      content: [
        `I noticed ${recipient?.company || 'your company'} recently ${getRecentActivity(recipient)}. Congratulations on this achievement!`,
        `Given your role as ${recipient?.jobTitle || 'a leader'} at ${recipient?.company || 'your organization'}, I thought you'd be interested in how we've helped similar companies...`,
        `I've been following ${recipient?.company || 'your company'}'s work in ${recipient?.industry || 'your industry'} and I'm impressed by your approach to ${getIndustryChallenge(recipient?.industry)}.`,
        `Based on your LinkedIn profile, it seems like you're focused on ${getJobTitleGoals(recipient?.jobTitle)}. We've had great success helping ${recipient?.jobTitle || 'professionals'} like yourself...`,
        `I saw your recent post about ${getRecentPost(recipient)} and it resonated with challenges we solve for ${recipient?.industry || 'similar'} companies.`
      ]
    };

    setAiSuggestions(suggestions);
    setIsGenerating(false);
  };

  const analyzeEmail = () => {
    const body = emailData.body;
    const wordCount = body.split(' ').length;
    
    // Sentiment analysis (simplified)
    const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'excited', 'thrilled'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated', 'concerned'];
    
    const positiveCount = positiveWords.filter(word => body.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => body.toLowerCase().includes(word)).length;
    
    let sentiment = 'neutral';
    let sentimentIcon = Meh;
    let sentimentColor = 'text-gray-600';
    
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      sentimentIcon = Smile;
      sentimentColor = 'text-green-600';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      sentimentIcon = Frown;
      sentimentColor = 'text-red-600';
    }

    // Readability analysis
    const avgWordsPerSentence = wordCount / (body.split('.').length || 1);
    let readability = 'good';
    let readabilityScore = 75;
    
    if (avgWordsPerSentence > 20) {
      readability = 'complex';
      readabilityScore = 45;
    } else if (avgWordsPerSentence < 10) {
      readability = 'simple';
      readabilityScore = 90;
    }

    // Engagement prediction
    const hasQuestion = body.includes('?');
    const hasPersonalization = body.includes(recipient?.firstName || '{{firstName}}');
    const hasCTA = /\b(call|meeting|demo|schedule|discuss|connect)\b/i.test(body);
    
    let engagementScore = 50;
    if (hasQuestion) engagementScore += 15;
    if (hasPersonalization) engagementScore += 20;
    if (hasCTA) engagementScore += 15;
    if (wordCount > 50 && wordCount < 150) engagementScore += 10;

    // Length analysis
    let lengthFeedback = 'optimal';
    if (wordCount < 50) lengthFeedback = 'too short';
    else if (wordCount > 200) lengthFeedback = 'too long';

    // CTA analysis
    const ctaStrength = hasCTA ? 'strong' : 'weak';

    setEmailAnalysis({
      sentiment: { type: sentiment, icon: sentimentIcon, color: sentimentColor },
      readability: { level: readability, score: readabilityScore },
      engagement: { score: Math.min(engagementScore, 100) },
      length: { wordCount, feedback: lengthFeedback },
      cta: { strength: ctaStrength, present: hasCTA }
    });
  };

  const generateContentSuggestions = () => {
    const improvements = [];
    
    if (emailAnalysis.length?.feedback === 'too short') {
      improvements.push({
        type: 'length',
        suggestion: 'Consider adding more context or a brief case study to increase engagement.',
        priority: 'medium'
      });
    }
    
    if (emailAnalysis.length?.feedback === 'too long') {
      improvements.push({
        type: 'length',
        suggestion: 'Try to shorten your message. Busy executives prefer concise emails.',
        priority: 'high'
      });
    }
    
    if (!emailAnalysis.cta?.present) {
      improvements.push({
        type: 'cta',
        suggestion: 'Add a clear call-to-action to guide the recipient on next steps.',
        priority: 'high'
      });
    }
    
    if (emailAnalysis.engagement?.score < 60) {
      improvements.push({
        type: 'engagement',
        suggestion: 'Add personalization or ask a relevant question to increase engagement.',
        priority: 'medium'
      });
    }

    if (emailAnalysis.sentiment?.type === 'negative') {
      improvements.push({
        type: 'tone',
        suggestion: 'Consider using more positive language to create a better impression.',
        priority: 'high'
      });
    }

    setAiSuggestions(prev => ({ ...prev, improvements }));
  };

  const applyTemplate = (template) => {
    let subject = template.subject;
    let body = template.body;

    // Replace variables with actual data
    const replacements = {
      firstName: recipient?.firstName || '[First Name]',
      company: recipient?.company || '[Company]',
      industry: recipient?.industry || '[Industry]',
      ourCompany: 'Zash CRM',
      senderName: '[Your Name]',
      product: 'Zash CRM',
      recentNews: '[Recent Company News]',
      similarClient: '[Similar Client]',
      benefit: '[Key Benefit]',
      solution: '[Solution Name]'
    };

    template.variables.forEach(variable => {
      const value = replacements[variable] || `[${variable}]`;
      subject = subject.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      body = body.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    setEmailData(prev => ({
      ...prev,
      subject,
      body,
      tone: template.tone,
      template: template.id
    }));
  };

  const insertSuggestion = (suggestion, type) => {
    if (type === 'subject') {
      setEmailData(prev => ({ ...prev, subject: suggestion }));
    } else if (type === 'content') {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentBody = emailData.body;
        const newBody = currentBody.substring(0, start) + suggestion + currentBody.substring(end);
        
        setEmailData(prev => ({ ...prev, body: newBody }));
        
        // Set cursor position after inserted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + suggestion.length, start + suggestion.length);
        }, 0);
      }
    }
  };

  const enhanceWithAI = async () => {
    setIsGenerating(true);
    
    // Simulate AI enhancement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let enhancedBody = emailData.body;
    
    // Add personalization if missing
    if (!enhancedBody.includes(recipient?.firstName) && recipient?.firstName) {
      enhancedBody = `Hi ${recipient.firstName},\n\n${enhancedBody}`;
    }
    
    // Improve tone based on selection
    if (emailData.tone === 'friendly' && !enhancedBody.includes('hope')) {
      enhancedBody = enhancedBody.replace(/^Hi/, 'Hi there! I hope this email finds you well.');
    }
    
    // Add CTA if missing
    if (!emailAnalysis.cta?.present) {
      enhancedBody += '\n\nWould you be available for a brief call this week to discuss this further?';
    }
    
    setEmailData(prev => ({ ...prev, body: enhancedBody }));
    setIsGenerating(false);
  };

  const getIndustryGoal = (industry) => {
    const goals = {
      'Technology': 'digital transformation',
      'Healthcare': 'patient outcomes',
      'Finance': 'operational efficiency',
      'Manufacturing': 'production optimization',
      'Retail': 'customer experience'
    };
    return goals[industry] || 'business growth';
  };

  const getIndustryChallenge = (industry) => {
    const challenges = {
      'Technology': 'scaling operations',
      'Healthcare': 'regulatory compliance',
      'Finance': 'risk management',
      'Manufacturing': 'supply chain optimization',
      'Retail': 'omnichannel integration'
    };
    return challenges[industry] || 'operational challenges';
  };

  const getJobTitleGoals = (jobTitle) => {
    if (!jobTitle) return 'business objectives';
    
    if (jobTitle.toLowerCase().includes('ceo')) return 'strategic growth and market expansion';
    if (jobTitle.toLowerCase().includes('cto')) return 'technology innovation and digital transformation';
    if (jobTitle.toLowerCase().includes('sales')) return 'revenue growth and team performance';
    if (jobTitle.toLowerCase().includes('marketing')) return 'lead generation and brand awareness';
    if (jobTitle.toLowerCase().includes('operations')) return 'operational efficiency and process optimization';
    
    return 'departmental objectives';
  };

  const getPersonalizedHook = (recipient) => {
    if (recipient?.industry) {
      return `innovative solutions for ${recipient.industry} leaders`;
    }
    return 'exploring mutual opportunities';
  };

  const getRecentActivity = (recipient) => {
    const activities = [
      'expanded into new markets',
      'launched a new product line',
      'announced a strategic partnership',
      'completed a successful funding round',
      'won an industry award'
    ];
    return activities[Math.floor(Math.random() * activities.length)];
  };

  const getRecentPost = (recipient) => {
    const topics = [
      'digital transformation challenges',
      'team leadership strategies',
      'industry innovation trends',
      'customer success stories',
      'operational efficiency improvements'
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Intelligent Email Composer
          </h2>
          <p className="text-gray-600">AI-powered email creation with smart suggestions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={enhanceWithAI} disabled={isGenerating}>
            <Wand2 className="h-4 w-4 mr-2" />
            {isGenerating ? 'Enhancing...' : 'AI Enhance'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Composer */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Compose Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">To</label>
                  <Input
                    value={emailData.to}
                    onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="recipient@company.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tone</label>
                  <Select value={emailData.tone} onValueChange={(value) => setEmailData(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="confident">Confident</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  ref={textareaRef}
                  value={emailData.body}
                  onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Compose your email..."
                  rows={12}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onSave?.(emailData)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                </div>
                <Button onClick={() => onSend?.(emailData)} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Analysis */}
          {emailData.body && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Email Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {emailAnalysis.sentiment && (
                        <emailAnalysis.sentiment.icon className={`h-6 w-6 ${emailAnalysis.sentiment.color}`} />
                      )}
                    </div>
                    <p className="text-sm font-medium">Sentiment</p>
                    <p className="text-xs text-gray-600 capitalize">{emailAnalysis.sentiment?.type}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {emailAnalysis.readability?.score}
                    </div>
                    <p className="text-sm font-medium">Readability</p>
                    <p className="text-xs text-gray-600 capitalize">{emailAnalysis.readability?.level}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {emailAnalysis.engagement?.score}%
                    </div>
                    <p className="text-sm font-medium">Engagement</p>
                    <p className="text-xs text-gray-600">Predicted</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {emailAnalysis.length?.wordCount}
                    </div>
                    <p className="text-sm font-medium">Words</p>
                    <p className="text-xs text-gray-600 capitalize">{emailAnalysis.length?.feedback}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {emailAnalysis.cta?.present ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                    <p className="text-sm font-medium">Call to Action</p>
                    <p className="text-xs text-gray-600 capitalize">{emailAnalysis.cta?.strength}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Suggestions Sidebar */}
        <div className="space-y-4">
          <Tabs defaultValue="suggestions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="space-y-4">
              {/* Subject Suggestions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Subject Lines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isGenerating ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Brain className="h-4 w-4 animate-pulse" />
                      Generating suggestions...
                    </div>
                  ) : (
                    aiSuggestions.subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 text-sm"
                        onClick={() => insertSuggestion(subject, 'subject')}
                      >
                        {subject}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Content Suggestions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Content Ideas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {aiSuggestions.content.map((content, index) => (
                    <div
                      key={index}
                      className="p-2 bg-blue-50 rounded cursor-pointer hover:bg-blue-100 text-sm"
                      onClick={() => insertSuggestion(content, 'content')}
                    >
                      {content}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Improvements */}
              {aiSuggestions.improvements.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {aiSuggestions.improvements.map((improvement, index) => (
                      <div key={index} className="p-2 bg-yellow-50 rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={improvement.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                            {improvement.priority}
                          </Badge>
                          <span className="font-medium capitalize">{improvement.type}</span>
                        </div>
                        <p className="text-gray-600">{improvement.suggestion}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              {smartTemplates.map(template => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4" onClick={() => applyTemplate(template)}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{template.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {template.successRate}% success
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.avgResponseTime}
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {template.subject}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}