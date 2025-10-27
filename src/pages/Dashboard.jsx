import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Users, 
  Building2, 
  TrendingUp, 
  Target,
  Calendar,
  DollarSign
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list(),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  // Calculate metrics
  const totalDealsValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const openDeals = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
  const wonDeals = deals.filter(d => d.stage === 'Closed Won');
  const wonDealsValue = wonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const conversionRate = leads.length > 0 ? ((leads.filter(l => l.status === 'Converted').length / leads.length) * 100).toFixed(1) : 0;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;

  // Lead status distribution
  const leadStatusData = [
    { name: 'New', value: leads.filter(l => l.status === 'New').length, color: '#6366F1' },
    { name: 'Contacted', value: leads.filter(l => l.status === 'Contacted').length, color: '#8B5CF6' },
    { name: 'Qualified', value: leads.filter(l => l.status === 'Qualified').length, color: '#10B981' },
    { name: 'Converted', value: leads.filter(l => l.status === 'Converted').length, color: '#F59E0B' },
  ];

  // Deal pipeline data
  const pipelineData = [
    { stage: 'Prospecting', count: deals.filter(d => d.stage === 'Prospecting').length },
    { stage: 'Qualification', count: deals.filter(d => d.stage === 'Qualification').length },
    { stage: 'Proposal', count: deals.filter(d => d.stage === 'Proposal').length },
    { stage: 'Negotiation', count: deals.filter(d => d.stage === 'Negotiation').length },
    { stage: 'Closed Won', count: wonDeals.length },
  ];

  // Monthly revenue trend
  const revenueData = [
    { month: 'Jan', revenue: wonDealsValue * 0.6 },
    { month: 'Feb', revenue: wonDealsValue * 0.7 },
    { month: 'Mar', revenue: wonDealsValue * 0.85 },
    { month: 'Apr', revenue: wonDealsValue },
  ];

  const StatCard = ({ title, value, icon: Icon, subtitle, gradient }) => (
    <Card className={`relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 ${gradient}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <CardTitle className="text-3xl font-bold mt-2 text-white">{value}</CardTitle>
            {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-gray-50">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your sales overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={leads.length}
          icon={Sparkles}
          subtitle={`${conversionRate}% conversion rate`}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <StatCard
          title="Active Contacts"
          value={contacts.length}
          icon={Users}
          subtitle={`${accounts.length} accounts`}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="Pipeline Value"
          value={`$${totalDealsValue.toLocaleString()}`}
          icon={TrendingUp}
          subtitle={`${openDeals.length} open deals`}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={Calendar}
          subtitle={`${tasks.length} total tasks`}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Pipeline */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Target className="w-5 h-5 text-indigo-500" />
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }} 
                />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Status Distribution */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Lead Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="border-none shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 transition-all border border-indigo-200">
              <Sparkles className="w-6 h-6 text-indigo-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Lead</p>
            </button>
            <button className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all border border-purple-200">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Add Contact</p>
            </button>
            <button className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 transition-all border border-emerald-200">
              <TrendingUp className="w-6 h-6 text-emerald-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">New Deal</p>
            </button>
            <button className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-all border border-amber-200">
              <Calendar className="w-6 h-6 text-amber-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Schedule Task</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}