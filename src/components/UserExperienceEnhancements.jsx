import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HelpCircle,
  Lightbulb,
  Zap,
  Target,
  BookOpen,
  Keyboard,
  Mouse,
  Eye,
  Star,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Play,
  Pause,
  RotateCcw,
  Settings,
  User,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Share,
  Copy,
  Edit,
  Trash,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Home,
  Menu,
  MoreHorizontal
} from 'lucide-react';

// Onboarding Tour Component
const OnboardingTour = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Sales Pro CRM',
      description: 'Let\'s take a quick tour to get you started with the key features.',
      target: null,
      content: 'This tour will help you understand the main features and navigation of your CRM system.'
    },
    {
      id: 'navigation',
      title: 'Navigation Menu',
      description: 'Access all main sections from the sidebar navigation.',
      target: '.sidebar-nav',
      content: 'Use the sidebar to navigate between Leads, Contacts, Accounts, Deals, and more.'
    },
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'Your dashboard shows key metrics and recent activities.',
      target: '.dashboard-content',
      content: 'Monitor your sales performance, upcoming tasks, and important notifications here.'
    },
    {
      id: 'search',
      title: 'Global Search',
      description: 'Quickly find any record using the search bar.',
      target: '.search-bar',
      content: 'Search across all your leads, contacts, accounts, and deals from anywhere in the app.'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Stay updated with important alerts and reminders.',
      target: '.notifications-bell',
      content: 'Get notified about follow-ups, deal updates, and system alerts.'
    },
    {
      id: 'profile',
      title: 'User Profile',
      description: 'Manage your account settings and preferences.',
      target: '.user-profile',
      content: 'Access your profile, settings, and logout options from the user menu.'
    }
  ];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-500" />
              {currentTourStep.title}
            </DialogTitle>
            <Badge variant="outline">
              {currentStep + 1} of {tourSteps.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </DialogHeader>
        
        <div className="space-y-4">
          <DialogDescription className="text-base">
            {currentTourStep.description}
          </DialogDescription>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {currentTourStep.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                size="sm"
                onClick={nextStep}
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" onClick={skipTour}>
              Skip Tour
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Keyboard Shortcuts Component
const KeyboardShortcuts = () => {
  const shortcuts = [
    { category: 'Navigation', items: [
      { key: 'Ctrl + K', description: 'Open global search' },
      { key: 'Ctrl + /', description: 'Show keyboard shortcuts' },
      { key: 'Alt + 1-9', description: 'Navigate to menu items' },
      { key: 'Esc', description: 'Close dialogs/modals' }
    ]},
    { category: 'Actions', items: [
      { key: 'Ctrl + N', description: 'Create new record' },
      { key: 'Ctrl + S', description: 'Save current form' },
      { key: 'Ctrl + E', description: 'Edit current record' },
      { key: 'Delete', description: 'Delete selected item' }
    ]},
    { category: 'Lists & Tables', items: [
      { key: 'Arrow Keys', description: 'Navigate table rows' },
      { key: 'Enter', description: 'Open selected item' },
      { key: 'Space', description: 'Select/deselect item' },
      { key: 'Ctrl + A', description: 'Select all items' }
    ]},
    { category: 'Forms', items: [
      { key: 'Tab', description: 'Next field' },
      { key: 'Shift + Tab', description: 'Previous field' },
      { key: 'Ctrl + Enter', description: 'Submit form' },
      { key: 'Ctrl + Z', description: 'Undo last action' }
    ]}
  ];

  return (
    <div className="space-y-6">
      {shortcuts.map((category) => (
        <Card key={category.category}>
          <CardHeader>
            <CardTitle className="text-lg">{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.items.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Interactive Tooltips Component
const InteractiveTooltips = () => {
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);
  const [tooltipDelay, setTooltipDelay] = useState(500);

  const tooltipExamples = [
    { icon: User, label: 'User Profile', tooltip: 'Access your account settings and preferences' },
    { icon: Bell, label: 'Notifications', tooltip: 'View recent alerts and reminders' },
    { icon: Search, label: 'Search', tooltip: 'Find leads, contacts, accounts, and deals' },
    { icon: Filter, label: 'Filter', tooltip: 'Filter results by various criteria' },
    { icon: Download, label: 'Export', tooltip: 'Download data in various formats' },
    { icon: Upload, label: 'Import', tooltip: 'Import data from external sources' },
    { icon: Share, label: 'Share', tooltip: 'Share records with team members' },
    { icon: Copy, label: 'Copy', tooltip: 'Copy record information to clipboard' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tooltip Settings</CardTitle>
          <CardDescription>
            Customize how tooltips appear and behave
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Tooltips</Label>
            <Switch
              checked={tooltipsEnabled}
              onCheckedChange={setTooltipsEnabled}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Tooltip Delay (ms)</Label>
            <Input
              type="number"
              value={tooltipDelay}
              onChange={(e) => setTooltipDelay(Number(e.target.value))}
              min="0"
              max="2000"
              step="100"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tooltip Examples</CardTitle>
          <CardDescription>
            Hover over the icons below to see tooltips in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider delayDuration={tooltipDelay}>
            <div className="grid grid-cols-4 gap-4">
              {tooltipExamples.map((item, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-20 flex-col space-y-2"
                      disabled={!tooltipsEnabled}
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="text-xs">{item.label}</span>
                    </Button>
                  </TooltipTrigger>
                  {tooltipsEnabled && (
                    <TooltipContent>
                      <p className="max-w-xs">{item.tooltip}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
};

// Smart Suggestions Component
const SmartSuggestions = () => {
  const [suggestions] = useState([
    {
      id: 1,
      type: 'productivity',
      title: 'Set up email templates',
      description: 'Create reusable email templates to save time on common communications.',
      action: 'Create Templates',
      priority: 'high',
      category: 'Email'
    },
    {
      id: 2,
      type: 'workflow',
      title: 'Configure lead scoring',
      description: 'Set up automatic lead scoring to prioritize your best prospects.',
      action: 'Setup Scoring',
      priority: 'medium',
      category: 'Leads'
    },
    {
      id: 3,
      type: 'integration',
      title: 'Connect your calendar',
      description: 'Sync your calendar to automatically track meetings and appointments.',
      action: 'Connect Calendar',
      priority: 'medium',
      category: 'Integration'
    },
    {
      id: 4,
      type: 'reporting',
      title: 'Create custom dashboard',
      description: 'Build a personalized dashboard with your most important metrics.',
      action: 'Build Dashboard',
      priority: 'low',
      category: 'Analytics'
    },
    {
      id: 5,
      type: 'automation',
      title: 'Set up follow-up reminders',
      description: 'Automate follow-up reminders to never miss important touchpoints.',
      action: 'Setup Reminders',
      priority: 'high',
      category: 'Automation'
    }
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'productivity': return Zap;
      case 'workflow': return Target;
      case 'integration': return Settings;
      case 'reporting': return Eye;
      case 'automation': return Play;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => {
        const Icon = getTypeIcon(suggestion.type);
        return (
          <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{suggestion.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Button size="sm" variant="outline">
                      {suggestion.action}
                    </Button>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Main UX Enhancements Component
export default function UserExperienceEnhancements() {
  const [activeTab, setActiveTab] = useState('onboarding');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    setShowOnboarding(false);
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Experience</h1>
          <p className="text-muted-foreground">
            Enhance your workflow with guided tours, shortcuts, and smart suggestions
          </p>
        </div>
        <Button onClick={startOnboarding}>
          <Play className="h-4 w-4 mr-2" />
          Start Tour
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="onboarding" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Onboarding</span>
          </TabsTrigger>
          <TabsTrigger value="shortcuts" className="flex items-center space-x-2">
            <Keyboard className="h-4 w-4" />
            <span>Shortcuts</span>
          </TabsTrigger>
          <TabsTrigger value="tooltips" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>Tooltips</span>
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4" />
            <span>Suggestions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Onboarding & Tours
              </CardTitle>
              <CardDescription>
                Interactive guided tours to help users learn the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">Welcome Tour</h3>
                  <p className="text-sm text-muted-foreground">
                    Introduction to main features and navigation
                  </p>
                  {onboardingCompleted && (
                    <Badge variant="secondary" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <Button onClick={startOnboarding}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Tour
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Feature Tours</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Leads Management
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Deal Pipeline
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Reporting & Analytics
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Start</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Zap className="h-4 w-4 mr-2" />
                      Setup Checklist
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Configuration Guide
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Profile Setup
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Keyboard className="h-5 w-5 mr-2" />
                Keyboard Shortcuts
              </CardTitle>
              <CardDescription>
                Learn keyboard shortcuts to work more efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeyboardShortcuts />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tooltips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                Interactive Tooltips
              </CardTitle>
              <CardDescription>
                Contextual help and guidance throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveTooltips />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Smart Suggestions
              </CardTitle>
              <CardDescription>
                Personalized recommendations to improve your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmartSuggestions />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}