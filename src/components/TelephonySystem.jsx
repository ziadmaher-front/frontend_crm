import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Phone, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed,
  PhoneOff,
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Pause,
  Play,
  Record,
  Square,
  Users,
  Clock,
  Calendar,
  Search,
  Filter,
  Download,
  Share,
  Star,
  MessageSquare,
  User,
  Building,
  MapPin,
  Mail,
  Plus,
  Settings,
  History,
  Headphones,
  Speaker,
  Video,
  VideoOff
} from 'lucide-react';

const TelephonySystem = () => {
  const [activeCall, setActiveCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [dialNumber, setDialNumber] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('dialer');
  const callTimer = useRef(null);

  // Sample call history data
  const sampleCallHistory = [
    {
      id: 1,
      contact: {
        name: 'Sarah Johnson',
        company: 'Acme Corp',
        phone: '+1 (555) 123-4567',
        avatar: null,
        type: 'lead'
      },
      type: 'outgoing',
      status: 'completed',
      duration: '5:23',
      timestamp: '2024-01-15 10:30 AM',
      recording: true,
      notes: 'Discussed Q1 pricing and contract terms'
    },
    {
      id: 2,
      contact: {
        name: 'Mike Chen',
        company: 'Tech Solutions',
        phone: '+1 (555) 987-6543',
        avatar: null,
        type: 'customer'
      },
      type: 'incoming',
      status: 'completed',
      duration: '12:45',
      timestamp: '2024-01-15 09:15 AM',
      recording: true,
      notes: 'Support call regarding integration issues'
    },
    {
      id: 3,
      contact: {
        name: 'Emma Wilson',
        company: 'Global Industries',
        phone: '+1 (555) 456-7890',
        avatar: null,
        type: 'prospect'
      },
      type: 'outgoing',
      status: 'missed',
      duration: '0:00',
      timestamp: '2024-01-14 4:20 PM',
      recording: false,
      notes: ''
    },
    {
      id: 4,
      contact: {
        name: 'John Doe',
        company: 'StartupXYZ',
        phone: '+1 (555) 321-0987',
        avatar: null,
        type: 'lead'
      },
      type: 'incoming',
      status: 'completed',
      duration: '8:12',
      timestamp: '2024-01-14 2:45 PM',
      recording: true,
      notes: 'Initial discovery call - very interested in our solution'
    }
  ];

  // Sample contacts data
  const sampleContacts = [
    {
      id: 1,
      name: 'Sarah Johnson',
      company: 'Acme Corp',
      phone: '+1 (555) 123-4567',
      email: 'sarah@acmecorp.com',
      type: 'lead',
      avatar: null,
      lastCall: '2024-01-15',
      callCount: 3
    },
    {
      id: 2,
      name: 'Mike Chen',
      company: 'Tech Solutions',
      phone: '+1 (555) 987-6543',
      email: 'mike@techsolutions.com',
      type: 'customer',
      avatar: null,
      lastCall: '2024-01-15',
      callCount: 8
    },
    {
      id: 3,
      name: 'Emma Wilson',
      company: 'Global Industries',
      phone: '+1 (555) 456-7890',
      email: 'emma@global.com',
      type: 'prospect',
      avatar: null,
      lastCall: '2024-01-14',
      callCount: 1
    }
  ];

  useEffect(() => {
    setCallHistory(sampleCallHistory);
    setContacts(sampleContacts);
  }, []);

  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      callTimer.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    }

    return () => {
      if (callTimer.current) {
        clearInterval(callTimer.current);
      }
    };
  }, [activeCall]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDial = (number) => {
    const contact = contacts.find(c => c.phone === number) || {
      name: 'Unknown',
      phone: number,
      company: '',
      type: 'unknown'
    };

    setActiveCall({
      id: Date.now(),
      contact,
      type: 'outgoing',
      status: 'dialing',
      startTime: new Date(),
      duration: 0
    });

    // Simulate call connection
    setTimeout(() => {
      setActiveCall(prev => ({ ...prev, status: 'connected' }));
      setCallDuration(0);
    }, 3000);
  };

  const handleEndCall = () => {
    if (activeCall) {
      const completedCall = {
        ...activeCall,
        status: 'completed',
        duration: formatDuration(callDuration),
        timestamp: new Date().toLocaleString(),
        recording: isRecording,
        notes: ''
      };

      setCallHistory(prev => [completedCall, ...prev]);
      setActiveCall(null);
      setCallDuration(0);
      setIsRecording(false);
      setIsMuted(false);
    }
  };

  const handleAnswerCall = () => {
    setActiveCall(prev => ({ ...prev, status: 'connected' }));
    setCallDuration(0);
  };

  const getCallIcon = (type, status) => {
    if (status === 'missed') return <PhoneMissed className="h-4 w-4 text-red-500" />;
    if (type === 'incoming') return <PhoneIncoming className="h-4 w-4 text-green-500" />;
    if (type === 'outgoing') return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
    return <Phone className="h-4 w-4" />;
  };

  const getContactTypeColor = (type) => {
    switch (type) {
      case 'customer': return 'bg-green-100 text-green-800';
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'prospect': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const DialPad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['*', '0', '#']
    ];

    return (
      <div className="space-y-4">
        <div className="text-center">
          <Input
            value={dialNumber}
            onChange={(e) => setDialNumber(e.target.value)}
            placeholder="Enter phone number"
            className="text-center text-lg font-mono"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {keys.flat().map((key) => (
            <Button
              key={key}
              variant="outline"
              className="h-12 w-12 text-lg font-semibold"
              onClick={() => setDialNumber(prev => prev + key)}
            >
              {key}
            </Button>
          ))}
        </div>
        
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setDialNumber('')}
            disabled={!dialNumber}
          >
            Clear
          </Button>
          <Button
            onClick={() => handleDial(dialNumber)}
            disabled={!dialNumber}
            className="bg-green-500 hover:bg-green-600"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
        </div>
      </div>
    );
  };

  const CallHistoryItem = ({ call }) => (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-2">
        {getCallIcon(call.type, call.status)}
        <Avatar className="h-8 w-8">
          <AvatarImage src={call.contact.avatar} />
          <AvatarFallback className="text-xs">
            {call.contact.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{call.contact.name}</p>
            <p className="text-sm text-gray-500">{call.contact.company}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{call.duration}</p>
            <p className="text-xs text-gray-500">{call.timestamp}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className={getContactTypeColor(call.contact.type)}>
            {call.contact.type}
          </Badge>
          {call.recording && (
            <Badge variant="outline" className="text-xs">
              <Record className="h-3 w-3 mr-1" />
              Recorded
            </Badge>
          )}
        </div>
        
        {call.notes && (
          <p className="text-sm text-gray-600 mt-1">{call.notes}</p>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <Button size="sm" variant="outline" onClick={() => handleDial(call.contact.phone)}>
          <Phone className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline">
          <MessageSquare className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const ContactItem = ({ contact }) => (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
      <Avatar className="h-10 w-10">
        <AvatarImage src={contact.avatar} />
        <AvatarFallback>
          {contact.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{contact.name}</p>
            <p className="text-sm text-gray-500">{contact.company}</p>
          </div>
          <Badge variant="outline" className={getContactTypeColor(contact.type)}>
            {contact.type}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {contact.phone}
          </span>
          <span className="flex items-center gap-1">
            <History className="h-3 w-3" />
            {contact.callCount} calls
          </span>
        </div>
      </div>
      
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => handleDial(contact.phone)}>
          <Phone className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline">
          <Mail className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Active Call Overlay */}
      {activeCall && (
        <Card className="fixed top-4 right-4 w-80 z-50 shadow-lg border-2 border-blue-500">
          <CardContent className="p-4">
            <div className="text-center space-y-4">
              <Avatar className="h-16 w-16 mx-auto">
                <AvatarImage src={activeCall.contact.avatar} />
                <AvatarFallback className="text-lg">
                  {activeCall.contact.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold">{activeCall.contact.name}</h3>
                <p className="text-sm text-gray-500">{activeCall.contact.phone}</p>
                <p className="text-xs text-gray-400">{activeCall.contact.company}</p>
              </div>
              
              <div className="text-center">
                {activeCall.status === 'dialing' && (
                  <p className="text-sm text-blue-600">Calling...</p>
                )}
                {activeCall.status === 'ringing' && (
                  <p className="text-sm text-green-600">Incoming call</p>
                )}
                {activeCall.status === 'connected' && (
                  <p className="text-lg font-mono">{formatDuration(callDuration)}</p>
                )}
              </div>
              
              <div className="flex justify-center gap-2">
                {activeCall.status === 'ringing' && (
                  <>
                    <Button
                      onClick={handleAnswerCall}
                      className="bg-green-500 hover:bg-green-600 rounded-full h-12 w-12"
                    >
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={handleEndCall}
                      variant="destructive"
                      className="rounded-full h-12 w-12"
                    >
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </>
                )}
                
                {(activeCall.status === 'dialing' || activeCall.status === 'connected') && (
                  <>
                    <Button
                      variant={isMuted ? "destructive" : "outline"}
                      onClick={() => setIsMuted(!isMuted)}
                      className="rounded-full h-10 w-10"
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant={isSpeakerOn ? "default" : "outline"}
                      onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      className="rounded-full h-10 w-10"
                    >
                      {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <Speaker className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={() => setIsRecording(!isRecording)}
                      className="rounded-full h-10 w-10"
                    >
                      {isRecording ? <Square className="h-4 w-4" /> : <Record className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      onClick={handleEndCall}
                      variant="destructive"
                      className="rounded-full h-12 w-12"
                    >
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Telephony System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dialer">Dialer</TabsTrigger>
              <TabsTrigger value="history">Call History</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dialer" className="space-y-6">
              <DialPad />
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-3">Recent Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contacts.slice(0, 4).map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleDial(contact.phone)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="text-xs">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.phone}</p>
                      </div>
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search call history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {callHistory.map((call) => (
                    <CallHistoryItem key={call.id} call={call} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="contacts" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <ContactItem key={contact.id} contact={contact} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TelephonySystem;