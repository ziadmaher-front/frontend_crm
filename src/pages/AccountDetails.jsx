
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
  Globe,
  Users,
  TrendingUp,
  FileText,
  MapPin,
  DollarSign,
  Calendar, // Added Calendar import
  MessageSquare // Added MessageSquare import
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import ActivityTimeline from "../components/ActivityTimeline";
import QuickActions from "../components/QuickActions";
import AIInsights from "../components/AIInsights";
import CalendarScheduler from "../components/CalendarScheduler"; // Added CalendarScheduler import
import ClickToCall from "../components/ClickToCall"; // Added ClickToCall import
import WhatsAppSender from "../components/WhatsAppSender"; // Added WhatsAppSender import

export default function AccountDetails() {
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const accountId = urlParams.get('id');

  const { data: account } = useQuery({
    queryKey: ['account', accountId],
    queryFn: async () => {
      const accounts = await base44.entities.Account.list();
      return accounts.find(a => a.id === accountId);
    },
    enabled: !!accountId,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', accountId],
    queryFn: async () => {
      const all = await base44.entities.Contact.list();
      return all.filter(c => c.account_id === accountId);
    },
    enabled: !!accountId,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals', accountId],
    queryFn: async () => {
      const all = await base44.entities.Deal.list();
      return all.filter(d => d.account_id === accountId);
    },
    enabled: !!accountId,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', accountId],
    queryFn: async () => {
      const all = await base44.entities.Activity.list('-activity_date');
      return all.filter(a => a.related_to_type === 'Account' && a.related_to_id === accountId);
    },
    enabled: !!accountId,
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['communications', accountId],
    queryFn: async () => {
      const all = await base44.entities.Communication.list('-created_date');
      return all.filter(c => c.related_to_type === 'Account' && c.related_to_id === accountId);
    },
    enabled: !!accountId,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', accountId],
    queryFn: async () => {
      const all = await base44.entities.Document.list('-created_date');
      return all.filter(d => d.related_to_type === 'Account' && d.related_to_id === accountId);
    },
    enabled: !!accountId,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  if (!account) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Accounts')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  const typeColors = {
    'Customer': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Prospect': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Partner': 'bg-purple-100 text-purple-700 border-purple-200',
    'Competitor': 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const wonDeals = deals.filter(d => d.stage === 'Closed Won');
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  // Get primary contact for quick actions
  const primaryContact = contacts.length > 0 ? contacts[0] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Accounts')}>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {account.company_name?.[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {account.company_name}
                  </h1>
                  {account.serial_number && (
                    <Badge variant="outline" className="mt-1 font-mono">
                      {account.serial_number}
                    </Badge>
                  )}
                  {account.industry && (
                    <p className="text-gray-600 mt-1">{account.industry}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap"> {/* Added flex-wrap */}
              <QuickActions relatedTo={{ type: 'Account', id: accountId }} />
              {primaryContact && (
                <>
                  <ClickToCall 
                    phoneNumber={primaryContact.phone || primaryContact.mobile} 
                    recipientName={`${primaryContact.first_name} ${primaryContact.last_name}`}
                    relatedTo={{ type: 'Account', id: accountId }}
                  />
                  <Button onClick={() => setShowWhatsAppDialog(true)} variant="outline" className="gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    WhatsApp
                  </Button>
                </>
              )}
              <Button onClick={() => setShowCalendarDialog(true)} variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </Button>
              <Badge className={`${typeColors[account.account_type]} text-lg px-4 py-2`}>
                {account.account_type}
              </Badge>
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
              entity={account} 
              entityType="Account"
              data={{ 
                accounts: [account], 
                contacts: contacts,
                deals: deals,
                activities: activities 
              }}
            />

            <div className="grid grid-cols-4 gap-4">
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600">${(wonValue / 1000).toFixed(0)}K</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Deals</p>
                  <p className="text-3xl font-bold text-indigo-600">{deals.length}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Contacts</p>
                  <p className="text-3xl font-bold text-purple-600">{contacts.length}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Activities</p>
                  <p className="text-3xl font-bold text-amber-600">{activities.length}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
                <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-6">
                <ActivityTimeline 
                  activities={activities}
                  communications={communications}
                  documents={documents}
                  tasks={[]}
                />
              </TabsContent>

              <TabsContent value="contacts" className="mt-6">
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <Card 
                      key={contact.id} 
                      className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => window.location.href = createPageUrl('ContactDetails') + '?id=' + contact.id}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                            {contact.first_name?.[0]}{contact.last_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{contact.first_name} {contact.last_name}</h4>
                            <p className="text-sm text-gray-600">{contact.job_title}</p>
                            <p className="text-xs text-gray-500 mt-1">{contact.email}</p>
                          </div>
                          <div className="flex gap-2">
                            {contact.phone && (
                              <Button variant="outline" size="sm">
                                <Phone className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {contacts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No contacts found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="deals" className="mt-6">
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <Card 
                      key={deal.id} 
                      className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => window.location.href = createPageUrl('DealDetails') + '?id=' + deal.id}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{deal.deal_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{deal.stage}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Expected Close: {deal.expected_close_date ? format(new Date(deal.expected_close_date), 'MMM d, yyyy') : '-'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">${deal.amount?.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">{deal.probability}% probability</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {deals.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No deals found</p>
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
                <CardTitle className="text-lg">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {account.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Website</p>
                      <a href={account.website.startsWith('http') ? account.website : `https://${account.website}`} 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        {account.website}
                      </a>
                    </div>
                  </div>
                )}
                {account.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium">{account.email}</p>
                    </div>
                  </div>
                )}
                {account.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{account.phone}</p>
                    </div>
                  </div>
                )}
                {account.employee_count && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Employees</p>
                      <p className="text-sm font-medium">{account.employee_count}</p>
                    </div>
                  </div>
                )}
                {account.annual_revenue > 0 && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Annual Revenue</p>
                      <p className="text-sm font-medium text-emerald-600">${account.annual_revenue.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {(account.billing_address || account.billing_city || account.billing_country) && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <p className="text-sm text-gray-700">
                      {[account.billing_address, account.billing_city, account.billing_country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {(account.shipping_address || account.shipping_city || account.shipping_country) && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <p className="text-sm text-gray-700">
                      {[account.shipping_address, account.shipping_city, account.shipping_country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {account.assigned_users?.length > 0 && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {account.assigned_users.map((email) => (
                    <div key={email} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                        {getUserName(email)[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{getUserName(email)}</p>
                        <p className="text-xs text-gray-500">{email}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {account.notes && (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{account.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CalendarScheduler
        open={showCalendarDialog}
        onOpenChange={setShowCalendarDialog}
        attendees={contacts}
        relatedTo={{ type: 'Account', id: accountId }}
      />

      {primaryContact && (
        <WhatsAppSender
          open={showWhatsAppDialog}
          onOpenChange={setShowWhatsAppDialog}
          recipient={primaryContact}
          relatedTo={{ type: 'Account', id: accountId }}
        />
      )}
    </div>
  );
}
