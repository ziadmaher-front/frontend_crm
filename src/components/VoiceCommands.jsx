import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Brain, 
  Zap, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Lightbulb, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Save, 
  Edit, 
  Trash2, 
  Copy, 
  Share, 
  Download, 
  Upload, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Menu, 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Star, 
  Heart, 
  Bookmark, 
  Flag, 
  Tag, 
  Link, 
  Paperclip, 
  Image, 
  File, 
  Folder, 
  Archive, 
  Database, 
  Server, 
  Cloud, 
  Wifi, 
  Bluetooth, 
  Battery, 
  Power, 
  Cpu, 
  HardDrive, 
  Memory, 
  Monitor, 
  Keyboard, 
  Mouse, 
  Printer, 
  Scanner, 
  Camera, 
  Video, 
  Headphones, 
  Speaker, 
  Microphone, 
  Radio, 
  Tv, 
  Gamepad, 
  Joystick, 
  Controller, 
  Remote, 
  Watch, 
  Clock, 
  Timer, 
  Stopwatch, 
  Alarm, 
  Bell, 
  Notification, 
  Message, 
  Chat, 
  Comment, 
  Reply, 
  Forward, 
  Send, 
  Receive, 
  Inbox, 
  Outbox, 
  Draft, 
  Sent, 
  Spam, 
  Trash, 
  Delete, 
  Restore, 
  Backup, 
  RefreshCw, 
  Update, 
  Upgrade, 
  Install, 
  Uninstall, 
  Configure, 
  Setup, 
  Initialize, 
  Launch, 
  Start, 
  Stop, 
  Restart, 
  Shutdown, 
  Sleep, 
  Wake, 
  Hibernate, 
  Suspend, 
  Resume, 
  Continue, 
  Pause as PauseIcon, 
  Skip, 
  Next, 
  Previous, 
  First, 
  Last, 
  Begin, 
  End, 
  Finish, 
  Complete, 
  Cancel, 
  Abort, 
  Retry, 
  Repeat, 
  Loop, 
  Shuffle, 
  Random, 
  Sort, 
  Order, 
  Rank, 
  Rate, 
  Score, 
  Grade, 
  Level, 
  Progress, 
  Status, 
  State, 
  Mode, 
  Type, 
  Kind, 
  Category, 
  Group, 
  Class, 
  Set, 
  List, 
  Array, 
  Table, 
  Grid, 
  Chart, 
  Graph, 
  Diagram, 
  Map, 
  Layout, 
  Design, 
  Style, 
  Theme, 
  Color, 
  Paint, 
  Brush, 
  Pen, 
  Pencil, 
  Eraser, 
  Ruler, 
  Compass, 
  Protractor, 
  Calculator, 
  Abacus, 
  Scale, 
  Balance, 
  Weight, 
  Measure, 
  Size, 
  Length, 
  Width, 
  Height, 
  Depth, 
  Area, 
  Volume, 
  Capacity, 
  Speed, 
  Velocity, 
  Acceleration, 
  Force, 
  Pressure, 
  Temperature, 
  Heat, 
  Cold, 
  Fire, 
  Ice, 
  Water, 
  Air, 
  Earth, 
  Wind, 
  Storm, 
  Rain, 
  Snow, 
  Sun, 
  Moon, 
  Star as StarIcon, 
  Planet, 
  Galaxy, 
  Universe, 
  Space, 
  Time, 
  History, 
  Future, 
  Past, 
  Present, 
  Now, 
  Today, 
  Tomorrow, 
  Yesterday, 
  Week, 
  Month, 
  Year, 
  Decade, 
  Century, 
  Millennium, 
  Era, 
  Age, 
  Period, 
  Phase, 
  Stage, 
  Step, 
  Process, 
  Procedure, 
  Method, 
  Technique, 
  Strategy, 
  Tactic, 
  Plan, 
  Goal, 
  Target, 
  Objective, 
  Purpose, 
  Mission, 
  Vision, 
  Dream, 
  Hope, 
  Wish, 
  Want, 
  Need, 
  Desire, 
  Love, 
  Like, 
  Prefer, 
  Choose, 
  Select, 
  Pick, 
  Take, 
  Get, 
  Give, 
  Put, 
  Place, 
  Move, 
  Go, 
  Come, 
  Stay, 
  Leave, 
  Enter, 
  Exit, 
  Open, 
  Close, 
  Show, 
  Hide, 
  Display, 
  View, 
  See, 
  Look, 
  Watch, 
  Observe, 
  Notice, 
  Find, 
  Discover, 
  Explore, 
  Investigate, 
  Research, 
  Study, 
  Learn, 
  Teach, 
  Train, 
  Practice, 
  Exercise, 
  Work, 
  Job, 
  Task, 
  Project, 
  Assignment, 
  Homework, 
  Test, 
  Exam, 
  Quiz, 
  Question, 
  Answer, 
  Solution, 
  Problem, 
  Issue, 
  Bug, 
  Error, 
  Mistake, 
  Fault, 
  Failure, 
  Success, 
  Win, 
  Lose, 
  Draw, 
  Tie, 
  Match, 
  Game, 
  Sport, 
  Play, 
  Fun, 
  Entertainment, 
  Hobby, 
  Interest, 
  Passion, 
  Talent, 
  Skill, 
  Ability, 
  Capability, 
  Capacity, 
  Potential, 
  Power, 
  Strength, 
  Energy, 
  Effort, 
  Hard, 
  Easy, 
  Simple, 
  Complex, 
  Difficult, 
  Challenge, 
  Obstacle, 
  Barrier, 
  Block, 
  Wall, 
  Door, 
  Window, 
  Bridge, 
  Path, 
  Road, 
  Street, 
  Avenue, 
  Highway, 
  Route, 
  Direction, 
  Way, 
  Method as MethodIcon, 
  Approach, 
  Style as StyleIcon, 
  Fashion, 
  Trend, 
  Popular, 
  Famous, 
  Known, 
  Unknown, 
  Secret, 
  Hidden, 
  Visible, 
  Clear, 
  Obvious, 
  Apparent, 
  Evident, 
  Certain, 
  Sure, 
  Confident, 
  Doubt, 
  Question as QuestionIcon, 
  Wonder, 
  Curious, 
  Interested, 
  Excited, 
  Happy, 
  Sad, 
  Angry, 
  Mad, 
  Upset, 
  Worried, 
  Scared, 
  Afraid, 
  Brave, 
  Bold, 
  Shy, 
  Quiet, 
  Loud, 
  Soft, 
  Hard as HardIcon, 
  Smooth, 
  Rough, 
  Sharp, 
  Dull, 
  Bright, 
  Dark, 
  Light, 
  Heavy, 
  Big, 
  Small, 
  Large, 
  Tiny, 
  Huge, 
  Giant, 
  Mini, 
  Micro, 
  Nano, 
  Mega, 
  Giga, 
  Tera, 
  Peta, 
  Exa, 
  Zetta, 
  Yotta, 
  Kilo, 
  Hecto, 
  Deca, 
  Deci, 
  Centi, 
  Milli, 
  Micro as MicroIcon, 
  Nano as NanoIcon, 
  Pico, 
  Femto, 
  Atto, 
  Zepto, 
  Yocto 
} from 'lucide-react';

export default function VoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 3,
    sensitivity: 'medium',
    wakeWord: 'Hey CRM',
    confirmCommands: true,
    voiceFeedback: true
  });
  const [recognitionStatus, setRecognitionStatus] = useState('idle');
  const [confidence, setConfidence] = useState(0);
  const [availableCommands, setAvailableCommands] = useState([]);
  const [recentCommands, setRecentCommands] = useState([]);
  const [commandSuggestions, setCommandSuggestions] = useState([]);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    initializeSpeechRecognition();
    initializeTextToSpeech();
    loadAvailableCommands();
    loadCommandHistory();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = voiceSettings.continuous;
      recognitionRef.current.interimResults = voiceSettings.interimResults;
      recognitionRef.current.maxAlternatives = voiceSettings.maxAlternatives;
      recognitionRef.current.lang = voiceSettings.language;

      recognitionRef.current.onstart = () => {
        setRecognitionStatus('listening');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const results = Array.from(event.results);
        const transcript = results
          .map(result => result[0].transcript)
          .join('');
        
        const lastResult = results[results.length - 1];
        const confidence = lastResult[0].confidence;
        
        setCurrentCommand(transcript);
        setConfidence(confidence);
        
        if (lastResult.isFinal) {
          processVoiceCommand(transcript, confidence);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setRecognitionStatus('error');
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
        
        if (voiceSettings.voiceFeedback) {
          speak('Sorry, I didn\'t catch that. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setRecognitionStatus('idle');
        setIsListening(false);
        setCurrentCommand('');
        
        if (isEnabled && voiceSettings.continuous) {
          // Restart listening after a short delay
          timeoutRef.current = setTimeout(() => {
            if (isEnabled) {
              startListening();
            }
          }, 1000);
        }
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
      setRecognitionStatus('unsupported');
    }
  };

  const initializeTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      console.warn('Text-to-speech not supported in this browser');
    }
  };

  const loadAvailableCommands = () => {
    const commands = [
      // Navigation Commands
      { category: 'Navigation', command: 'go to dashboard', action: 'navigate', target: '/dashboard' },
      { category: 'Navigation', command: 'open leads', action: 'navigate', target: '/leads' },
      { category: 'Navigation', command: 'show contacts', action: 'navigate', target: '/contacts' },
      { category: 'Navigation', command: 'view deals', action: 'navigate', target: '/deals' },
      { category: 'Navigation', command: 'open calendar', action: 'navigate', target: '/calendar' },
      { category: 'Navigation', command: 'show reports', action: 'navigate', target: '/reports' },
      { category: 'Navigation', command: 'go to settings', action: 'navigate', target: '/settings' },
      
      // Data Entry Commands
      { category: 'Data Entry', command: 'add new lead', action: 'create', target: 'lead' },
      { category: 'Data Entry', command: 'create contact', action: 'create', target: 'contact' },
      { category: 'Data Entry', command: 'new deal', action: 'create', target: 'deal' },
      { category: 'Data Entry', command: 'schedule meeting', action: 'create', target: 'meeting' },
      { category: 'Data Entry', command: 'add task', action: 'create', target: 'task' },
      { category: 'Data Entry', command: 'create note', action: 'create', target: 'note' },
      
      // Search Commands
      { category: 'Search', command: 'search for *', action: 'search', target: 'global' },
      { category: 'Search', command: 'find contact *', action: 'search', target: 'contacts' },
      { category: 'Search', command: 'look up lead *', action: 'search', target: 'leads' },
      { category: 'Search', command: 'find deal *', action: 'search', target: 'deals' },
      
      // Communication Commands
      { category: 'Communication', command: 'call *', action: 'call', target: 'contact' },
      { category: 'Communication', command: 'email *', action: 'email', target: 'contact' },
      { category: 'Communication', command: 'send message to *', action: 'message', target: 'contact' },
      
      // Filter Commands
      { category: 'Filter', command: 'show hot leads', action: 'filter', target: 'leads', filter: 'hot' },
      { category: 'Filter', command: 'display closed deals', action: 'filter', target: 'deals', filter: 'closed' },
      { category: 'Filter', command: 'filter by today', action: 'filter', target: 'date', filter: 'today' },
      { category: 'Filter', command: 'show this week', action: 'filter', target: 'date', filter: 'week' },
      
      // System Commands
      { category: 'System', command: 'refresh data', action: 'refresh', target: 'data' },
      { category: 'System', command: 'export report', action: 'export', target: 'report' },
      { category: 'System', command: 'save changes', action: 'save', target: 'current' },
      { category: 'System', command: 'undo last action', action: 'undo', target: 'last' },
      { category: 'System', command: 'help', action: 'help', target: 'general' },
      
      // Voice Control Commands
      { category: 'Voice Control', command: 'stop listening', action: 'voice', target: 'stop' },
      { category: 'Voice Control', command: 'start listening', action: 'voice', target: 'start' },
      { category: 'Voice Control', command: 'repeat that', action: 'voice', target: 'repeat' },
      { category: 'Voice Control', command: 'speak slower', action: 'voice', target: 'slower' },
      { category: 'Voice Control', command: 'speak faster', action: 'voice', target: 'faster' }
    ];

    setAvailableCommands(commands);
  };

  const loadCommandHistory = () => {
    const history = [
      { command: 'show hot leads', timestamp: new Date(Date.now() - 5 * 60 * 1000), success: true },
      { command: 'add new lead', timestamp: new Date(Date.now() - 15 * 60 * 1000), success: true },
      { command: 'call john smith', timestamp: new Date(Date.now() - 30 * 60 * 1000), success: false },
      { command: 'go to dashboard', timestamp: new Date(Date.now() - 45 * 60 * 1000), success: true },
      { command: 'schedule meeting', timestamp: new Date(Date.now() - 60 * 60 * 1000), success: true }
    ];

    setCommandHistory(history);
    setRecentCommands(history.slice(0, 3));
  };

  const processVoiceCommand = (transcript, confidence) => {
    const command = transcript.toLowerCase().trim();
    
    // Check for wake word if enabled
    if (voiceSettings.wakeWord && !command.includes(voiceSettings.wakeWord.toLowerCase())) {
      return;
    }

    // Remove wake word from command
    const cleanCommand = command.replace(voiceSettings.wakeWord.toLowerCase(), '').trim();
    
    // Find matching command
    const matchedCommand = findMatchingCommand(cleanCommand);
    
    if (matchedCommand) {
      if (voiceSettings.confirmCommands && confidence < 0.8) {
        confirmCommand(matchedCommand, cleanCommand);
      } else {
        executeCommand(matchedCommand, cleanCommand);
      }
    } else {
      handleUnknownCommand(cleanCommand);
    }
    
    // Add to history
    const historyEntry = {
      command: cleanCommand,
      timestamp: new Date(),
      success: !!matchedCommand,
      confidence: confidence
    };
    
    setCommandHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    setRecentCommands(prev => [historyEntry, ...prev.slice(0, 2)]);
  };

  const findMatchingCommand = (command) => {
    // Exact match
    let match = availableCommands.find(cmd => 
      cmd.command.toLowerCase() === command.toLowerCase()
    );
    
    if (match) return match;
    
    // Partial match with wildcards
    match = availableCommands.find(cmd => {
      const pattern = cmd.command.replace(/\*/g, '(.+)');
      const regex = new RegExp(`^${pattern}$`, 'i');
      return regex.test(command);
    });
    
    if (match) return match;
    
    // Fuzzy match (simple similarity)
    const similarities = availableCommands.map(cmd => ({
      command: cmd,
      similarity: calculateSimilarity(command, cmd.command)
    }));
    
    const bestMatch = similarities
      .filter(s => s.similarity > 0.6)
      .sort((a, b) => b.similarity - a.similarity)[0];
    
    return bestMatch?.command;
  };

  const calculateSimilarity = (str1, str2) => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const executeCommand = (matchedCommand, originalCommand) => {
    console.log('Executing command:', matchedCommand, 'Original:', originalCommand);
    
    switch (matchedCommand.action) {
      case 'navigate':
        if (voiceSettings.voiceFeedback) {
          speak(`Navigating to ${matchedCommand.target.replace('/', '')}`);
        }
        // Simulate navigation
        window.history.pushState({}, '', matchedCommand.target);
        break;
        
      case 'create':
        if (voiceSettings.voiceFeedback) {
          speak(`Creating new ${matchedCommand.target}`);
        }
        // Simulate creation
        break;
        
      case 'search':
        const searchTerm = extractSearchTerm(originalCommand, matchedCommand.command);
        if (voiceSettings.voiceFeedback) {
          speak(`Searching for ${searchTerm}`);
        }
        // Simulate search
        break;
        
      case 'call':
        const contactName = extractContactName(originalCommand);
        if (voiceSettings.voiceFeedback) {
          speak(`Calling ${contactName}`);
        }
        // Simulate call
        break;
        
      case 'email':
        const emailContact = extractContactName(originalCommand);
        if (voiceSettings.voiceFeedback) {
          speak(`Opening email to ${emailContact}`);
        }
        // Simulate email
        break;
        
      case 'filter':
        if (voiceSettings.voiceFeedback) {
          speak(`Applying ${matchedCommand.filter} filter`);
        }
        // Simulate filter
        break;
        
      case 'voice':
        handleVoiceControlCommand(matchedCommand.target);
        break;
        
      default:
        if (voiceSettings.voiceFeedback) {
          speak('Command executed');
        }
        break;
    }
  };

  const extractSearchTerm = (command, pattern) => {
    const regex = new RegExp(pattern.replace(/\*/g, '(.+)'), 'i');
    const match = command.match(regex);
    return match ? match[1] : '';
  };

  const extractContactName = (command) => {
    const words = command.split(' ');
    return words.slice(1).join(' '); // Remove first word (action)
  };

  const handleVoiceControlCommand = (target) => {
    switch (target) {
      case 'stop':
        stopListening();
        break;
      case 'start':
        startListening();
        break;
      case 'repeat':
        if (recentCommands.length > 0) {
          speak(`Last command was: ${recentCommands[0].command}`);
        }
        break;
      default:
        break;
    }
  };

  const confirmCommand = (matchedCommand, originalCommand) => {
    if (voiceSettings.voiceFeedback) {
      speak(`Did you want to ${matchedCommand.command}? Say yes to confirm or no to cancel.`);
    }
    
    // Set up confirmation listener
    // This would need additional logic to handle yes/no responses
  };

  const handleUnknownCommand = (command) => {
    console.log('Unknown command:', command);
    
    if (voiceSettings.voiceFeedback) {
      speak('Sorry, I didn\'t understand that command. Try saying "help" for available commands.');
    }
    
    // Generate suggestions based on similarity
    const suggestions = availableCommands
      .map(cmd => ({
        command: cmd,
        similarity: calculateSimilarity(command, cmd.command)
      }))
      .filter(s => s.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(s => s.command);
    
    setCommandSuggestions(suggestions);
  };

  const speak = (text) => {
    if (synthRef.current && voiceSettings.voiceFeedback) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceSettings.language;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      synthRef.current.speak(utterance);
    }
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsEnabled(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setRecognitionStatus('error');
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsEnabled(false);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const getStatusColor = () => {
    switch (recognitionStatus) {
      case 'listening': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'unsupported': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (recognitionStatus) {
      case 'listening': return <Mic className="h-5 w-5 text-green-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'unsupported': return <MicOff className="h-5 w-5 text-gray-400" />;
      default: return <MicOff className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="h-6 w-6 text-blue-600" />
            Voice Commands
          </h2>
          <p className="text-gray-600">Hands-free CRM operation with speech recognition</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isListening ? "destructive" : "default"}
            onClick={toggleListening}
            disabled={recognitionStatus === 'unsupported'}
          >
            {getStatusIcon()}
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Voice Control */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Voice Recognition Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                <Badge variant="outline" className={getStatusColor()}>
                  {recognitionStatus.charAt(0).toUpperCase() + recognitionStatus.slice(1)}
                </Badge>
              </div>
              
              {isListening && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Command:</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {currentCommand || 'Listening...'}
                    </span>
                  </div>
                  
                  {confidence > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Confidence:</span>
                        <span className="text-sm">{Math.round(confidence * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-600 rounded-full transition-all duration-300" 
                          style={{ width: `${confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {recognitionStatus === 'unsupported' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Speech recognition is not supported in this browser. 
                      Please use Chrome, Edge, or Safari for voice commands.
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Command Suggestions */}
          {commandSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Did you mean?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {commandSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        executeCommand(suggestion, suggestion.command);
                        setCommandSuggestions([]);
                      }}
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      {suggestion.command}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Available Commands
              </CardTitle>
              <CardDescription>
                Say "{voiceSettings.wakeWord}" followed by any of these commands
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(
                  availableCommands.reduce((acc, cmd) => {
                    if (!acc[cmd.category]) acc[cmd.category] = [];
                    acc[cmd.category].push(cmd);
                    return acc;
                  }, {})
                ).map(([category, commands]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {commands.slice(0, 6).map((cmd, index) => (
                        <div
                          key={index}
                          className="p-2 bg-gray-50 rounded text-sm font-mono cursor-pointer hover:bg-gray-100"
                          onClick={() => executeCommand(cmd, cmd.command)}
                        >
                          "{cmd.command}"
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Voice Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Language</label>
                <Select 
                  value={voiceSettings.language} 
                  onValueChange={(value) => 
                    setVoiceSettings(prev => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                    <SelectItem value="it-IT">Italian</SelectItem>
                    <SelectItem value="pt-BR">Portuguese</SelectItem>
                    <SelectItem value="zh-CN">Chinese</SelectItem>
                    <SelectItem value="ja-JP">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Wake Word</label>
                <input
                  type="text"
                  value={voiceSettings.wakeWord}
                  onChange={(e) => 
                    setVoiceSettings(prev => ({ ...prev, wakeWord: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Hey CRM"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Sensitivity</label>
                <Select 
                  value={voiceSettings.sensitivity} 
                  onValueChange={(value) => 
                    setVoiceSettings(prev => ({ ...prev, sensitivity: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Continuous Listening</span>
                  <Switch
                    checked={voiceSettings.continuous}
                    onCheckedChange={(checked) => 
                      setVoiceSettings(prev => ({ ...prev, continuous: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Confirm Commands</span>
                  <Switch
                    checked={voiceSettings.confirmCommands}
                    onCheckedChange={(checked) => 
                      setVoiceSettings(prev => ({ ...prev, confirmCommands: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Voice Feedback</span>
                  <Switch
                    checked={voiceSettings.voiceFeedback}
                    onCheckedChange={(checked) => 
                      setVoiceSettings(prev => ({ ...prev, voiceFeedback: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Commands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentCommands.map((cmd, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="text-sm font-mono">{cmd.command}</div>
                      <div className="text-xs text-gray-600">
                        {cmd.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cmd.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      {cmd.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(cmd.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => speak('Voice commands are ready. Say "Hey CRM" followed by your command.')}
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Test Voice Feedback
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Export Command History
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Voice Settings
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Info className="h-4 w-4 mr-2" />
                Voice Command Help
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}