
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Building2, 
  Smartphone,
  MapPin,
  TrendingUp,
  FileText,
  CheckCircle,
  MessageSquare, // Added for WhatsApp
  Calendar // Added for CalendarScheduler
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/loading-states";
import { format } from "date-fns";
import ActivityTimeline from "../components/ActivityTimeline";
import SendEmailDialog from "../components/SendEmailDialog";
import QuickActions from "../components/QuickActions";
import AIInsights from "../components/AIInsights";
import CalendarScheduler from "../components/CalendarScheduler"; // New import
import ClickToCall from "../components/ClickToCall"; // New import
import WhatsAppSender from "../components/WhatsAppSender"; // New import

export default function ContactDetails() {
  const { id: contactId } = useParams();
  const navigate = useNavigate();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false); // New state
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false); // New state

  const { data: contact, isLoading: contactLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      if (!contactId) return null;
      return await base44.entities.Contact.get(contactId);
    },
    enabled: !!contactId,
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', contactId],
    queryFn: async () => {
      const all = await base44.entities.Activity.list('-activity_date');
      return all.filter(a => a.related_to_type === 'Contact' && a.related_to_id === contactId);
    },
    enabled: !!contactId,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', contactId],
    queryFn: async () => {
      const all = await base44.entities.Task.list('-created_date');
      return all.filter(t => t.related_to_type === 'Contact' && t.related_to_id === contactId);
    },
    enabled: !!contactId,
  });

  const { data: communications = [], isLoading: communicationsLoading } = useQuery({
    queryKey: ['communications', contactId],
    queryFn: async () => {
      const all = await base44.entities.Communication.list('-created_date');
      return all.filter(c => c.related_to_type === 'Contact' && c.related_to_id === contactId);
    },
    enabled: !!contactId,
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['documents', contactId],
    queryFn: async () => {
      const all = await base44.entities.Document.list('-created_date');
      return all.filter(d => d.related_to_type === 'Contact' && d.related_to_id === contactId);
    },
    enabled: !!contactId,
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', contactId],
    queryFn: async () => {
      const all = await base44.entities.Deal.list();
      return all.filter(d => d.contact_id === contactId);
    },
    enabled: !!contactId,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  // Combined loading state
  const isLoading = contactLoading || activitiesLoading || tasksLoading || communicationsLoading || documentsLoading || dealsLoading || usersLoading;

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!contact) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/contacts')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Contact not found</h1>
        </div>
      </div>
    );
  }

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100" onClick={() => navigate('/contacts')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {contact.first_name?.[0]}{contact.last_name?.[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {contact.first_name} {contact.last_name}
                  </h1>
                  {contact.serial_number && (
                    <Badge variant="outline" className="mt-1 font-mono">
                      {contact.serial_number}
                    </Badge>
                  )}
                  {contact.account_name && (
                    <p className="text-gray-600 mt-1">{contact.account_name}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap"> {/* Added flex-wrap */}
              <QuickActions relatedTo={{ type: 'Contact', id: contactId }} />
              <ClickToCall 
                phoneNumber={contact.phone || contact.mobile_phone} 
                recipientName={`${contact.first_name} ${contact.last_name}`}
                relatedTo={{ type: 'Contact', id: contactId }}
              />
              <Button onClick={() => setShowWhatsAppDialog(true)} variant="outline" className="gap-2">
                <MessageSquare className="w-4 h-4 text-green-600" />
                WhatsApp
              </Button>
              <Button onClick={() => setShowCalendarDialog(true)} variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </Button>
              <Button onClick={() => setShowEmailDialog(true)} className="bg-purple-600">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* AI Insights */}
            <AIInsights 
              entity={contact} 
              entityType="Contact"
              data={{ 
                contacts: [contact], 
                deals: deals,
                activities: activities,
                tasks: tasks
              }}
            />

            <div className="grid grid-cols-4 gap-4">
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Deals</p>
                  <p className="text-3xl font-bold text-emerald-600">{deals.length}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Activities</p>
                  <p className="text-3xl font-bold text-purple-600">{activities.length}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Tasks</p>
                  <p className="text-3xl font-bold text-amber-600">{tasks.length}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Documents</p>
                  <p className="text-3xl font-bold text-indigo-600">{documents.length}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="deals">Deals</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-6">
                <ActivityTimeline 
                  activities={activities}
                  communications={communications}
                  documents={documents}
                  tasks={tasks}
                />
              </TabsContent>

              <TabsContent value="deals" className="mt-6">
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <Link to={`/deals/${deal.id}`} key={deal.id}>
                      <Card className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-lg">{deal.deal_name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{deal.stage}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-emerald-600">${deal.amount?.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">{deal.probability}% probability</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  {deals.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No deals associated</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <Card key={task.id} className="border-none shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <CheckCircle className={`w-5 h-5 mt-1 ${
                              task.status === 'Completed' ? 'text-green-500' : 'text-gray-400'
                            }`} />
                            <div>
                              <h4 className="font-semibold">{task.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                Due: {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '-'}
                              </p>
                            </div>
                          </div>
                          <Badge>{task.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No tasks assigned</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-indigo-500" />
                            <div>
                              <h4 className="font-semibold">{doc.document_name}</h4>
                              <p className="text-xs text-gray-500">
                                {doc.document_type} • {format(new Date(doc.created_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(doc.file_url, '_blank')}>
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {documents.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No documents attached</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {contact.email || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {contact.phone || '-'}
                  </p>
                </div>
                {contact.mobile_phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mobile Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      {contact.mobile_phone}
                    </p>
                  </div>
                )}
                {contact.account_name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Name</p>
                    <p className="font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {contact.account_name}
                    </p>
                  </div>
                )}
                {contact.department && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Department</p>
                    <p className="font-medium">{contact.department}</p>
                  </div>
                )}
                {contact.territory && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Territory</p>
                    <p className="font-medium">{contact.territory}</p>
                  </div>
                )}
                {contact.assistant_name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Assistant Name</p>
                    <p className="font-medium">{contact.assistant_name}</p>
                  </div>
                )}
                {contact.currency_code && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Currency Code</p>
                    <p className="font-medium">{contact.currency_code}</p>
                  </div>
                )}
                {contact.serial_number && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Serial Number</p>
                    <p className="font-medium font-mono">{contact.serial_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {(contact.mailing_street || contact.mailing_city || contact.mailing_state || contact.mailing_zip || contact.mailing_country) && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Mailing Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contact.mailing_street && (
                    <div>
                      <p className="text-xs text-gray-500">Street</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {contact.mailing_street}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {contact.mailing_city && (
                      <div>
                        <p className="text-xs text-gray-500">City</p>
                        <p className="text-sm font-medium">{contact.mailing_city}</p>
                      </div>
                    )}
                    {contact.mailing_state && (
                      <div>
                        <p className="text-xs text-gray-500">State</p>
                        <p className="text-sm font-medium">{contact.mailing_state}</p>
                      </div>
                    )}
                    {contact.mailing_zip && (
                      <div>
                        <p className="text-xs text-gray-500">Zip Code</p>
                        <p className="text-sm font-medium">{contact.mailing_zip}</p>
                      </div>
                    )}
                    {contact.mailing_country && (
                      <div>
                        <p className="text-xs text-gray-500">Country</p>
                        <p className="text-sm font-medium">{contact.mailing_country}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SendEmailDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        relatedTo={{ type: 'Contact', id: contactId }}
        recipient={contact} // Changed to pass the full contact object
      />

      <CalendarScheduler
        open={showCalendarDialog}
        onOpenChange={setShowCalendarDialog}
        attendees={[contact]}
        relatedTo={{ type: 'Contact', id: contactId }}
      />

      <WhatsAppSender
        open={showWhatsAppDialog}
        onOpenChange={setShowWhatsAppDialog}
        recipient={contact}
        relatedTo={{ type: 'Contact', id: contactId }}
      />
    </div>
  );
}