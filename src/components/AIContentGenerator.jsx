import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { 
  Wand2, 
  Mail, 
  FileText, 
  MessageSquare, 
  Copy, 
  Download,
  RefreshCw,
  Settings,
  Sparkles,
  Target,
  Clock,
  CheckCircle,
  Edit3,
  Send
} from 'lucide-react';

const AIContentGenerator = () => {
  const [activeTab, setActiveTab] = useState('emails');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentHistory, setContentHistory] = useState([]);
  const [settings, setSettings] = useState({
    tone: 'professional',
    length: 'medium',
    personalization: true,
    includeCallToAction: true,
    language: 'english'
  });

  const contentTypes = {
    emails: {
      icon: Mail,
      title: 'Email Templates',
      templates: [
        { id: 'cold_outreach', name: 'Cold Outreach', description: 'Initial contact emails' },
        { id: 'follow_up', name: 'Follow-up', description: 'Follow-up sequences' },
        { id: 'demo_invitation', name: 'Demo Invitation', description: 'Meeting requests' },
        { id: 'proposal_follow', name: 'Proposal Follow-up', description: 'After proposal submission' },
        { id: 'nurture', name: 'Nurture Campaign', description: 'Educational content' }
      ]
    },
    proposals: {
      icon: FileText,
      title: 'Proposals',
      templates: [
        { id: 'business_proposal', name: 'Business Proposal', description: 'Comprehensive business proposals' },
        { id: 'service_proposal', name: 'Service Proposal', description: 'Service-based proposals' },
        { id: 'project_proposal', name: 'Project Proposal', description: 'Project-specific proposals' },
        { id: 'partnership', name: 'Partnership Proposal', description: 'Partnership agreements' }
      ]
    },
    sequences: {
      icon: MessageSquare,
      title: 'Follow-up Sequences',
      templates: [
        { id: 'onboarding', name: 'Onboarding Sequence', description: 'New customer onboarding' },
        { id: 'abandoned_cart', name: 'Abandoned Cart', description: 'Re-engagement sequences' },
        { id: 'win_back', name: 'Win-back Campaign', description: 'Inactive customer re-engagement' },
        { id: 'upsell', name: 'Upsell Sequence', description: 'Product upgrade campaigns' }
      ]
    }
  };

  const mockGeneratedContent = {
    cold_outreach: `Subject: Quick question about [Company Name]'s growth goals

Hi [First Name],

I noticed [Company Name] recently [specific trigger/news]. Congratulations on the milestone!

I'm reaching out because I've been helping similar companies in [Industry] streamline their [specific process] and typically see 30-40% efficiency improvements within the first quarter.

Would you be open to a brief 15-minute conversation to explore how this might apply to [Company Name]? I have some insights specific to your industry that might be valuable.

Best regards,
[Your Name]

P.S. I'll follow up in a few days if I don't hear back, but please let me know if you'd prefer I don't.`,

    business_proposal: `# Business Proposal for [Company Name]

## Executive Summary
This proposal outlines a comprehensive solution to address [Company Name]'s [specific challenge/opportunity]. Our approach combines [key solution elements] to deliver measurable results within [timeframe].

## Problem Statement
Based on our analysis, [Company Name] is facing:
- [Challenge 1 with specific impact]
- [Challenge 2 with quantified metrics]
- [Challenge 3 with business implications]

## Proposed Solution
Our three-phase approach includes:

### Phase 1: Assessment & Planning (Weeks 1-2)
- Comprehensive audit of current systems
- Stakeholder interviews and requirements gathering
- Detailed implementation roadmap

### Phase 2: Implementation (Weeks 3-8)
- [Specific deliverable 1]
- [Specific deliverable 2]
- [Specific deliverable 3]

### Phase 3: Optimization & Training (Weeks 9-12)
- Performance monitoring and optimization
- Team training and knowledge transfer
- Ongoing support framework

## Expected Outcomes
- [Quantified benefit 1]: [specific metric improvement]
- [Quantified benefit 2]: [ROI calculation]
- [Quantified benefit 3]: [efficiency gain]

## Investment
Total project investment: $[amount]
Expected ROI: [percentage] within [timeframe]

## Next Steps
1. Review and approve this proposal
2. Schedule kick-off meeting
3. Begin Phase 1 activities

We're excited about the opportunity to partner with [Company Name] and deliver exceptional results.`,

    onboarding: `Email 1 (Day 0): Welcome & Getting Started

Subject: Welcome to [Company Name]! Here's what happens next

Hi [First Name],

Welcome to the [Company Name] family! We're thrilled to have you on board.

Over the next few days, you'll receive a series of emails to help you get the most out of your new [product/service]. Here's what to expect:

✅ Today: Account setup and first steps
📚 Day 2: Essential features walkthrough  
🎯 Day 5: Advanced tips and best practices
📞 Day 7: Personal check-in call

Your account is ready at: [login link]
Your dedicated success manager: [Name] ([email])

Ready to get started? [CTA Button: Access Your Account]

---

Email 2 (Day 2): Feature Walkthrough

Subject: Master these 3 features in 5 minutes

Hi [First Name],

Now that you've had a day to explore, let's focus on the three features that will give you the biggest impact:

🚀 Feature 1: [Name] - [Brief benefit]
   → Quick tutorial: [link]

📊 Feature 2: [Name] - [Brief benefit]  
   → Video guide: [link]

⚡ Feature 3: [Name] - [Brief benefit]
   → Step-by-step guide: [link]

Questions? Reply to this email or schedule a quick call: [calendar link]

---

Email 3 (Day 5): Pro Tips

Subject: 3 pro tips from our most successful customers

Hi [First Name],

Our most successful customers share these three habits:

💡 Tip 1: [Specific actionable advice]
💡 Tip 2: [Specific actionable advice]  
💡 Tip 3: [Specific actionable advice]

Want to see these in action? Join our weekly group training: [link]

Your success manager [Name] will be calling you in 2 days to see how everything is going and answer any questions.`
  };

  const generateContent = async (templateId, customPrompt = '') => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const content = mockGeneratedContent[templateId] || 'Generated content would appear here...';
      setGeneratedContent(content);
      
      // Add to history
      const newItem = {
        id: Date.now(),
        type: activeTab,
        template: templateId,
        content: content,
        timestamp: new Date(),
        settings: { ...settings }
      };
      setContentHistory(prev => [newItem, ...prev.slice(0, 9)]);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  const downloadContent = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Content Generator</h1>
          <p className="text-muted-foreground">
            Generate personalized emails, proposals, and follow-up sequences with AI
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>AI Powered</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Generation Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              {Object.entries(contentTypes).map(([key, type]) => {
                const Icon = type.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{type.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(contentTypes).map(([key, type]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <type.icon className="h-5 w-5" />
                      <span>{type.title}</span>
                    </CardTitle>
                    <CardDescription>
                      Select a template to generate AI-powered content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {type.templates.map((template) => (
                        <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4" onClick={() => generateContent(template.id)}>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <Button size="sm" className="w-full mt-3" disabled={isGenerating}>
                              {isGenerating ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Wand2 className="h-4 w-4 mr-2" />
                              )}
                              Generate
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Prompt */}
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Generation</CardTitle>
                    <CardDescription>
                      Provide specific instructions for custom content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea 
                      placeholder="Describe what you want to generate... (e.g., 'Create a follow-up email for a SaaS demo that didn't convert, focusing on addressing common objections')"
                      className="min-h-[100px]"
                    />
                    <Button className="w-full" disabled={isGenerating}>
                      {isGenerating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      Generate Custom Content
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Generated Content */}
          {generatedContent && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Generated Content</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(generatedContent)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadContent(generatedContent, 'generated-content.txt')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg">
                    {generatedContent}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings & History Panel */}
        <div className="space-y-4">
          {/* Generation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Generation Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tone</label>
                <Select value={settings.tone} onValueChange={(value) => setSettings(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Length</label>
                <Select value={settings.length} onValueChange={(value) => setSettings(prev => ({ ...prev, length: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Personalization</label>
                <Switch 
                  checked={settings.personalization} 
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, personalization: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Include CTA</label>
                <Switch 
                  checked={settings.includeCallToAction} 
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeCallToAction: checked }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Content History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Recent Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {contentHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No content generated yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contentHistory.map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{item.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{item.template}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.content.substring(0, 100)}...
                        </p>
                        <div className="flex space-x-2">
                          <Button size="xs" variant="outline" onClick={() => setGeneratedContent(item.content)}>
                            View
                          </Button>
                          <Button size="xs" variant="outline" onClick={() => copyToClipboard(item.content)}>
                            Copy
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Content Generated</span>
                <span className="font-medium">{contentHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">This Month</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Success Rate</span>
                <span className="font-medium text-green-600">94%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIContentGenerator;