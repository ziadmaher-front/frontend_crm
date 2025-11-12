import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Type, 
  Palette, 
  Globe, 
  Keyboard,
  MousePointer,
  Headphones,
  Settings,
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const AccessibilityTools = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [fontSize, setFontSize] = useState([16]);
  const [contrast, setContrast] = useState([100]);
  const [colorBlindMode, setColorBlindMode] = useState('none');
  const [keyboardNavEnabled, setKeyboardNavEnabled] = useState(true);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [voiceCommands, setVoiceCommands] = useState([]);
  const [lastCommand, setLastCommand] = useState('');

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
    { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
    { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
    { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  const colorBlindModes = [
    { value: 'none', label: 'Normal Vision' },
    { value: 'protanopia', label: 'Protanopia (Red-blind)' },
    { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
    { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' },
    { value: 'achromatopsia', label: 'Achromatopsia (Color-blind)' }
  ];

  const voiceCommandsList = [
    { command: 'navigate to contacts', action: 'Navigate to contacts page', category: 'Navigation' },
    { command: 'navigate to deals', action: 'Navigate to deals page', category: 'Navigation' },
    { command: 'navigate to dashboard', action: 'Navigate to dashboard', category: 'Navigation' },
    { command: 'create new contact', action: 'Open new contact form', category: 'Actions' },
    { command: 'create new deal', action: 'Open new deal form', category: 'Actions' },
    { command: 'search for', action: 'Open search with query', category: 'Search' },
    { command: 'read page', action: 'Read current page content', category: 'Accessibility' },
    { command: 'increase font size', action: 'Increase text size', category: 'Accessibility' },
    { command: 'decrease font size', action: 'Decrease text size', category: 'Accessibility' },
    { command: 'toggle high contrast', action: 'Toggle high contrast mode', category: 'Accessibility' },
    { command: 'help', action: 'Show available commands', category: 'Help' },
    { command: 'repeat', action: 'Repeat last action', category: 'Help' }
  ];

  const [accessibilityReport, setAccessibilityReport] = useState({
    score: 92,
    issues: [
      { type: 'warning', message: 'Some images missing alt text', count: 3 },
      { type: 'error', message: 'Form inputs without labels', count: 1 },
      { type: 'info', message: 'Consider adding skip links', count: 1 }
    ],
    recommendations: [
      'Add alt text to all images',
      'Ensure all form inputs have associated labels',
      'Implement skip navigation links',
      'Increase color contrast ratio for better readability'
    ]
  });

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = currentLanguage;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        if (event.results[event.results.length - 1].isFinal) {
          handleVoiceCommand(transcript.toLowerCase().trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Apply accessibility settings
    applyAccessibilitySettings();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentLanguage, fontSize, contrast, colorBlindMode]);

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    
    // Apply font size
    root.style.setProperty('--accessibility-font-size', `${fontSize[0]}px`);
    
    // Apply contrast
    root.style.setProperty('--accessibility-contrast', `${contrast[0]}%`);
    
    // Apply color blind mode
    let filter = '';
    switch (colorBlindMode) {
      case 'protanopia':
        filter = 'url(#protanopia)';
        break;
      case 'deuteranopia':
        filter = 'url(#deuteranopia)';
        break;
      case 'tritanopia':
        filter = 'url(#tritanopia)';
        break;
      case 'achromatopsia':
        filter = 'grayscale(100%)';
        break;
      default:
        filter = 'none';
    }
    root.style.setProperty('--accessibility-filter', filter);
    
    // Apply keyboard navigation styles
    if (keyboardNavEnabled) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
  };

  const handleVoiceCommand = (command) => {
    setLastCommand(command);
    setVoiceCommands(prev => [
      { command, timestamp: new Date(), executed: true },
      ...prev.slice(0, 9)
    ]);

    // Process voice commands
    if (command.includes('navigate to contacts')) {
      speak('Navigating to contacts page');
      // Navigate to contacts
    } else if (command.includes('navigate to deals')) {
      speak('Navigating to deals page');
      // Navigate to deals
    } else if (command.includes('navigate to dashboard')) {
      speak('Navigating to dashboard');
      // Navigate to dashboard
    } else if (command.includes('create new contact')) {
      speak('Opening new contact form');
      // Open new contact form
    } else if (command.includes('create new deal')) {
      speak('Opening new deal form');
      // Open new deal form
    } else if (command.includes('increase font size')) {
      const newSize = Math.min(fontSize[0] + 2, 24);
      setFontSize([newSize]);
      speak(`Font size increased to ${newSize} pixels`);
    } else if (command.includes('decrease font size')) {
      const newSize = Math.max(fontSize[0] - 2, 12);
      setFontSize([newSize]);
      speak(`Font size decreased to ${newSize} pixels`);
    } else if (command.includes('toggle high contrast')) {
      const newContrast = contrast[0] === 100 ? 150 : 100;
      setContrast([newContrast]);
      speak(`High contrast ${newContrast === 150 ? 'enabled' : 'disabled'}`);
    } else if (command.includes('read page')) {
      speak('Reading current page content. This is the accessibility tools page where you can configure voice navigation, text size, contrast, and other accessibility features.');
    } else if (command.includes('help')) {
      speak('Available commands include: navigate to contacts, navigate to deals, create new contact, create new deal, increase font size, decrease font size, toggle high contrast, read page, and help.');
    } else {
      speak('Command not recognized. Say help to hear available commands.');
    }
  };

  const speak = (text) => {
    if (speechEnabled && synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      synthRef.current.speak(utterance);
    }
  };

  const toggleVoiceRecognition = () => {
    if (!voiceEnabled) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      speak('Voice recognition started. I\'m listening for commands.');
    }
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    if (recognitionRef.current) {
      recognitionRef.current.lang = langCode;
    }
    const language = languages.find(lang => lang.code === langCode);
    speak(`Language changed to ${language?.name}`);
  };

  const runAccessibilityAudit = () => {
    // Simulate accessibility audit
    speak('Running accessibility audit');
    
    setTimeout(() => {
      setAccessibilityReport({
        score: Math.floor(Math.random() * 20) + 80,
        issues: [
          { type: 'warning', message: 'Some images missing alt text', count: Math.floor(Math.random() * 5) },
          { type: 'error', message: 'Form inputs without labels', count: Math.floor(Math.random() * 3) },
          { type: 'info', message: 'Consider adding skip links', count: 1 }
        ].filter(issue => issue.count > 0),
        recommendations: [
          'Add alt text to all images',
          'Ensure all form inputs have associated labels',
          'Implement skip navigation links',
          'Increase color contrast ratio for better readability'
        ]
      });
      
      speak('Accessibility audit completed');
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Accessibility Tools</h1>
          <p className="text-muted-foreground">Voice navigation, multi-language support, and accessibility features</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={runAccessibilityAudit} variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Run Audit
          </Button>
        </div>
      </motion.div>

      {/* Quick Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voice Control</CardTitle>
              {voiceEnabled ? <Mic className="h-4 w-4 text-green-600" /> : <MicOff className="h-4 w-4 text-gray-400" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {voiceEnabled ? (isListening ? 'Listening' : 'Ready') : 'Disabled'}
              </div>
              <p className="text-xs text-muted-foreground">
                {voiceCommands.length} commands executed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Language</CardTitle>
              <Globe className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {languages.find(lang => lang.code === currentLanguage)?.flag}
              </div>
              <p className="text-xs text-muted-foreground">
                {languages.find(lang => lang.code === currentLanguage)?.name}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Font Size</CardTitle>
              <Type className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fontSize[0]}px</div>
              <p className="text-xs text-muted-foreground">
                {fontSize[0] > 16 ? 'Enlarged' : fontSize[0] < 16 ? 'Reduced' : 'Default'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A11y Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accessibilityReport.score}%</div>
              <p className="text-xs text-muted-foreground">
                {accessibilityReport.issues.length} issues found
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="voice" className="space-y-4">
        <TabsList>
          <TabsTrigger value="voice">Voice Control</TabsTrigger>
          <TabsTrigger value="visual">Visual Settings</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="audit">Accessibility Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Voice Recognition</CardTitle>
                <CardDescription>Control the application using voice commands</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Voice Control</Label>
                    <p className="text-sm text-muted-foreground">Allow voice commands for navigation</p>
                  </div>
                  <Switch
                    checked={voiceEnabled}
                    onCheckedChange={setVoiceEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Text-to-Speech</Label>
                    <p className="text-sm text-muted-foreground">Enable audio feedback</p>
                  </div>
                  <Switch
                    checked={speechEnabled}
                    onCheckedChange={setSpeechEnabled}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={toggleVoiceRecognition}
                    disabled={!voiceEnabled}
                    className={isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {isListening ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Listening
                      </>
                    )}
                  </Button>
                  
                  {lastCommand && (
                    <Badge variant="outline" className="ml-2">
                      Last: "{lastCommand}"
                    </Badge>
                  )}
                </div>

                {isListening && (
                  <Alert>
                    <Mic className="h-4 w-4" />
                    <AlertDescription>
                      Listening for voice commands... Try saying "navigate to contacts" or "help"
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voice Commands</CardTitle>
                <CardDescription>Available voice commands and recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {voiceCommandsList.map((cmd, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">"{cmd.command}"</div>
                        <div className="text-xs text-muted-foreground">{cmd.action}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {cmd.category}
                      </Badge>
                    </div>
                  ))}
                </div>

                {voiceCommands.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Recent Commands</h4>
                    <div className="space-y-2">
                      {voiceCommands.slice(0, 3).map((cmd, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>"{cmd.command}"</span>
                          <span className="text-muted-foreground">
                            {new Date(cmd.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Text & Display</CardTitle>
                <CardDescription>Adjust text size and visual settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Font Size: {fontSize[0]}px</Label>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    max={24}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Small (12px)</span>
                    <span>Large (24px)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contrast: {contrast[0]}%</Label>
                  <Slider
                    value={contrast}
                    onValueChange={setContrast}
                    max={200}
                    min={50}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low (50%)</span>
                    <span>High (200%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Screen Reader Mode</Label>
                    <p className="text-sm text-muted-foreground">Optimize for screen readers</p>
                  </div>
                  <Switch
                    checked={screenReaderMode}
                    onCheckedChange={setScreenReaderMode}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color & Vision</CardTitle>
                <CardDescription>Color blind support and visual adjustments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Color Blind Support</Label>
                  <Select value={colorBlindMode} onValueChange={setColorBlindMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorBlindModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="w-full h-8 bg-gradient-to-r from-red-500 to-blue-500 rounded mb-2"></div>
                    <p className="text-xs text-center">Color Preview</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="w-full h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded mb-2"></div>
                    <p className="text-xs text-center">Adjusted View</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>Multi-language support and localization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languages.map((language) => (
                  <motion.div
                    key={language.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-colors ${
                        currentLanguage === language.code 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleLanguageChange(language.code)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-2">{language.flag}</div>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-xs text-muted-foreground">{language.code}</div>
                        {currentLanguage === language.code && (
                          <CheckCircle className="h-4 w-4 text-blue-600 mx-auto mt-2" />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Navigation Settings</CardTitle>
                <CardDescription>Keyboard and mouse navigation preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Keyboard Navigation</Label>
                    <p className="text-sm text-muted-foreground">Enhanced keyboard shortcuts and focus indicators</p>
                  </div>
                  <Switch
                    checked={keyboardNavEnabled}
                    onCheckedChange={setKeyboardNavEnabled}
                  />
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Navigate to Dashboard</span>
                      <Badge variant="outline">Ctrl + D</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Navigate to Contacts</span>
                      <Badge variant="outline">Ctrl + C</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Navigate to Deals</span>
                      <Badge variant="outline">Ctrl + L</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Search</span>
                      <Badge variant="outline">Ctrl + K</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Help</span>
                      <Badge variant="outline">F1</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Focus Management</CardTitle>
                <CardDescription>Focus indicators and skip links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Focus indicators help users navigate using keyboard. Skip links allow users to jump to main content.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Keyboard className="h-4 w-4 mr-2" />
                    Test Keyboard Navigation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MousePointer className="h-4 w-4 mr-2" />
                    Test Focus Indicators
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Test Skip Links
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Score</CardTitle>
                <CardDescription>Overall accessibility compliance rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {accessibilityReport.score}%
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {accessibilityReport.score >= 90 ? 'Excellent' : 
                     accessibilityReport.score >= 80 ? 'Good' : 
                     accessibilityReport.score >= 70 ? 'Fair' : 'Needs Improvement'}
                  </p>
                  <Button onClick={runAccessibilityAudit} className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Run New Audit
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues Found</CardTitle>
                <CardDescription>Accessibility issues that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accessibilityReport.issues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {issue.type === 'error' && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                      {issue.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                      {issue.type === 'info' && <Info className="h-5 w-5 text-blue-600 mt-0.5" />}
                      <div className="flex-1">
                        <div className="font-medium">{issue.message}</div>
                        <div className="text-sm text-muted-foreground">
                          {issue.count} instance{issue.count !== 1 ? 's' : ''} found
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Suggested improvements for better accessibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {accessibilityReport.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SVG Filters for Color Blind Support */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"/>
          </filter>
          <filter id="tritanopia">
            <feColorMatrix values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"/>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default AccessibilityTools;