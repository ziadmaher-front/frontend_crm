import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Building2,
  CheckSquare,
  Globe
} from "lucide-react";
import { createPageUrl } from "@/utils";
import ActivityTimeline from "../components/ActivityTimeline";
import QuickActions from "../components/QuickActions";
import AIInsights from "../components/AIInsights";
import { PageSkeleton } from "@/components/ui/loading-states";

export default function LeadDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const leadId = urlParams.get('id');

  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const leads = await base44.entities.Lead.list();
      return leads.find(l => l.id === leadId);
    },
    enabled: !!leadId,
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      const allActivities = await base44.entities.Activity.list();
      return allActivities.filter(a => a.related_to_id === leadId);
    },
    enabled: !!leadId,
  });

  const { data: communications = [], isLoading: communicationsLoading } = useQuery({
    queryKey: ['lead-communications', leadId],
    queryFn: async () => {
      const allComms = await base44.entities.Communication.list();
      return allComms.filter(c => c.related_to_id === leadId);
    },
    enabled: !!leadId,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['lead-tasks', leadId],
    queryFn: async () => {
      const allTasks = await base44.entities.Task.list();
      return allTasks.filter(t => t.related_to_id === leadId);
    },
    enabled: !!leadId,
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['lead-documents', leadId],
    queryFn: async () => {
      const allDocs = await base44.entities.Document.list();
      return allDocs.filter(d => d.related_to_id === leadId);
    },
    enabled: !!leadId,
  });

  // For AI Insights
  const { data: allLeads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list(),
  });

  const { data: allActivities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list(),
  });

  const statusColors = {
    'New': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Contacted': 'bg-purple-100 text-purple-700 border-purple-200',
    'Qualified': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Unqualified': 'bg-gray-100 text-gray-700 border-gray-200',
    'Converted': 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const isLoading = leadLoading || activitiesLoading || communicationsLoading || tasksLoading || documentsLoading;

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!lead) {
    return (
      <div className="p-6">
        <p>Lead not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.location.href = createPageUrl('Leads')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              {lead.first_name} {lead.last_name}
            </h1>
            <p className="text-gray-600">{lead.company} • {lead.job_title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights */}
          <AIInsights 
            entity={lead} 
            entityType="Lead"
            data={{ leads: allLeads, activities: allActivities }}
          />

          {/* Lead Info */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <Badge className={`${statusColors[lead.status]} border`}>
                  {lead.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Lead Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${lead.lead_score || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">{lead.lead_score || 0}/100</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {lead.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {lead.phone || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Company</p>
                <p className="font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  {lead.company || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Lead Source</p>
                <p className="font-medium">{lead.lead_source || '-'}</p>
              </div>
              {lead.website && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Website</p>
                  <a
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                </div>
              )}
              {lead.serial_number && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Serial Number</p>
                  <p className="font-medium font-mono">{lead.serial_number}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline
                activities={activities}
                communications={communications}
                documents={documents}
                tasks={tasks}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions
            relatedTo={{ type: 'Lead', id: leadId }}
            recipientEmail={lead.email}
            recipientPhone={lead.phone}
            recipientName={`${lead.first_name} ${lead.last_name}`}
          />

          {/* Notes */}
          {lead.notes && (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Tasks Summary */}
          {tasks.length > 0 && (
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Tasks ({tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{task.title}</span>
                    <Badge variant={task.status === 'Completed' ? 'secondary' : 'outline'}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
                {tasks.length > 3 && (
                  <Button variant="link" className="text-xs p-0">
                    View all {tasks.length} tasks
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}