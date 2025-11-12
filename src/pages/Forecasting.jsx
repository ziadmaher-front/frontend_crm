import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Target, 
  Users, 
  DollarSign,
  Calendar,
  Award,
  AlertCircle,
  Activity,
  BarChart3,
  Plus
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";

export default function Forecasting() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPeriod] = useState('quarter');
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list(),
  });

  const { data: targets = [] } = useQuery({
    queryKey: ['salesTargets'],
    queryFn: () => base44.entities.SalesTarget.list(),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: forecasts = [] } = useQuery({
    queryKey: ['forecasts'],
    queryFn: () => base44.entities.Forecast.list('-created_date'),
  });

  const getCurrentPeriodDates = () => {
    const now = new Date();
    switch(selectedPeriod) {
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'quarter':
        return {
          start: startOfQuarter(now),
          end: endOfQuarter(now)
        };
      case 'year':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        };
      default:
        return { start: now, end: now };
    }
  };

  const { start: periodStart, end: periodEnd } = getCurrentPeriodDates();

  const currentPeriodDeals = deals.filter(deal => {
    const closeDate = deal.expected_close_date || deal.actual_close_date;
    if (!closeDate) return false;
    const dealDate = new Date(closeDate);
    return dealDate >= periodStart && dealDate <= periodEnd;
  });

  const openDeals = currentPeriodDeals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
  const wonDeals = currentPeriodDeals.filter(d => d.stage === 'Closed Won');
  const lostDeals = currentPeriodDeals.filter(d => d.stage === 'Closed Lost');
  
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const weightedPipeline = openDeals.reduce((sum, d) => sum + ((d.amount || 0) * (d.probability || 0) / 100), 0);
  const wonRevenue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
  const winRate = (wonDeals.length + lostDeals.length) > 0 
    ? (wonDeals.length / (wonDeals.length + lostDeals.length) * 100).toFixed(1)
    : 0;

  const myTarget = targets.find(t => 
    t.user_email === currentUser?.email && 
    t.year === selectedYear &&
    (selectedPeriod === 'quarter' ? t.quarter === selectedQuarter : true)
  );

  const targetAchievement = myTarget 
    ? ((myTarget.actual_revenue / myTarget.target_revenue) * 100).toFixed(1)
    : 0;

  const teamPerformance = teams.map(team => {
    const teamTargets = targets.filter(t => t.team_id === team.id);
    const totalTarget = teamTargets.reduce((sum, t) => sum + (t.target_revenue || 0), 0);
    const totalActual = teamTargets.reduce((sum, t) => sum + (t.actual_revenue || 0), 0);
    const achievement = totalTarget > 0 ? (totalActual / totalTarget * 100).toFixed(1) : 0;

    return {
      name: team.team_name,
      target: totalTarget,
      actual: totalActual,
      achievement: parseFloat(achievement)
    };
  });

  const individualPerformance = users
    .filter(u => u.is_active)
    .map(user => {
      const userTargets = targets.filter(t => t.user_email === user.email);
      const totalTarget = userTargets.reduce((sum, t) => sum + (t.target_revenue || 0), 0);
      const totalActual = userTargets.reduce((sum, t) => sum + (t.actual_revenue || 0), 0);
      const achievement = totalTarget > 0 ? (totalActual / totalTarget * 100).toFixed(1) : 0;

      return {
        name: user.full_name,
        email: user.email,
        target: totalTarget,
        actual: totalActual,
        achievement: parseFloat(achievement),
        team: teams.find(t => t.member_emails?.includes(user.email))?.team_name || 'No Team'
      };
    })
    .filter(u => u.target > 0)
    .sort((a, b) => b.actual - a.actual);

  const pipelineByStage = [
    { stage: 'Prospecting', value: deals.filter(d => d.stage === 'Prospecting').reduce((s, d) => s + (d.amount || 0), 0), count: deals.filter(d => d.stage === 'Prospecting').length },
    { stage: 'Qualification', value: deals.filter(d => d.stage === 'Qualification').reduce((s, d) => s + (d.amount || 0), 0), count: deals.filter(d => d.stage === 'Qualification').length },
    { stage: 'Proposal', value: deals.filter(d => d.stage === 'Proposal').reduce((s, d) => s + (d.amount || 0), 0), count: deals.filter(d => d.stage === 'Proposal').length },
    { stage: 'Negotiation', value: deals.filter(d => d.stage === 'Negotiation').reduce((s, d) => s + (d.amount || 0), 0), count: deals.filter(d => d.stage === 'Negotiation').length },
    { stage: 'Closed Won', value: wonRevenue, count: wonDeals.length },
  ];

  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthDeals = deals.filter(d => {
      const closeDate = d.actual_close_date || d.expected_close_date;
      if (!closeDate) return false;
      const dealDate = new Date(closeDate);
      return dealDate.getMonth() === date.getMonth() && dealDate.getFullYear() === date.getFullYear();
    });
    
    const won = monthDeals.filter(d => d.stage === 'Closed Won');
    const revenue = won.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    return {
      month: format(date, 'MMM'),
      revenue: revenue,
      deals: won.length
    };
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-indigo-500" />
            Sales Forecasting & Performance
          </h1>
          <p className="text-gray-600 mt-1">Track targets, forecast revenue, and analyze team performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Q{selectedQuarter} {selectedYear}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/80">Pipeline Value</p>
              <TrendingUp className="w-5 h-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold text-white">${(pipelineValue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-white/70 mt-1">{openDeals.length} open deals</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/80">Weighted Pipeline</p>
              <DollarSign className="w-5 h-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold text-white">${(weightedPipeline / 1000).toFixed(0)}K</p>
            <p className="text-xs text-white/70 mt-1">Probability adjusted</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/80">Won This Period</p>
              <Award className="w-5 h-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold text-white">${(wonRevenue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-white/70 mt-1">{wonDeals.length} deals closed</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-amber-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/80">Win Rate</p>
              <Activity className="w-5 h-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold text-white">{winRate}%</p>
            <p className="text-xs text-white/70 mt-1">{wonDeals.length}W / {lostDeals.length}L</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/80">Target Achievement</p>
              <Target className="w-5 h-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold text-white">{targetAchievement}%</p>
            {myTarget && (
              <p className="text-xs text-white/70 mt-1">
                ${(myTarget.actual_revenue / 1000).toFixed(0)}K / ${(myTarget.target_revenue / 1000).toFixed(0)}K
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  Revenue Trend (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#6366F1" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Pipeline by Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pipelineByStage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {individualPerformance.slice(0, 5).map((performer, index) => (
                    <div key={performer.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-amber-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' :
                          'bg-indigo-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{performer.name}</p>
                          <p className="text-xs text-gray-500">{performer.team}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">${(performer.actual / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-500">{performer.achievement}% of target</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Team Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={teamPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value, name) => 
                        name === 'achievement' ? `${value}%` : `$${(value / 1000).toFixed(0)}K`
                      }
                    />
                    <Legend />
                    <Bar dataKey="target" fill="#94A3B8" name="Target" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="actual" fill="#10B981" name="Actual" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="targets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sales Targets & Achievement</h2>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Set New Target
            </Button>
          </div>

          {myTarget && (
            <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  My Current Target
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Revenue Target</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      ${(myTarget.target_revenue / 1000).toFixed(0)}K
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Actual: ${(myTarget.actual_revenue / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Achievement</p>
                    <p className="text-3xl font-bold text-emerald-600">{targetAchievement}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(targetAchievement, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Deals Target</p>
                    <p className="text-3xl font-bold text-purple-600">{myTarget.target_deals || 0}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Closed: {myTarget.actual_deals || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${((myTarget.target_revenue - myTarget.actual_revenue) / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Period</p>
                    <p className="text-lg font-bold text-gray-900">{myTarget.period_type}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">End Date</p>
                    <p className="text-lg font-bold text-gray-900">
                      {format(new Date(myTarget.end_date), 'MMM d')}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge className={
                      targetAchievement >= 100 ? 'bg-green-100 text-green-700' :
                      targetAchievement >= 75 ? 'bg-blue-100 text-blue-700' :
                      targetAchievement >= 50 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {targetAchievement >= 100 ? 'Achieved' :
                       targetAchievement >= 75 ? 'On Track' :
                       targetAchievement >= 50 ? 'At Risk' : 'Behind'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Individual Performance Scorecard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rep</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Target</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Achievement</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gap</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {individualPerformance.map((performer) => (
                      <tr key={performer.email} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{performer.name}</p>
                          <p className="text-xs text-gray-500">{performer.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm">{performer.team}</td>
                        <td className="px-4 py-3 text-right font-semibold">${(performer.target / 1000).toFixed(0)}K</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                          ${(performer.actual / 1000).toFixed(0)}K
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  performer.achievement >= 100 ? 'bg-green-500' :
                                  performer.achievement >= 75 ? 'bg-blue-500' :
                                  performer.achievement >= 50 ? 'bg-amber-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(performer.achievement, 100)}%` }}
                              />
                            </div>
                            <span className="font-semibold w-12">{performer.achievement}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {performer.actual >= performer.target ? (
                            <span className="text-green-600">+${((performer.actual - performer.target) / 1000).toFixed(0)}K</span>
                          ) : (
                            <span className="text-red-600">-${((performer.target - performer.actual) / 1000).toFixed(0)}K</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={
                            performer.achievement >= 100 ? 'bg-green-100 text-green-700' :
                            performer.achievement >= 75 ? 'bg-blue-100 text-blue-700' :
                            performer.achievement >= 50 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }>
                            {performer.achievement >= 100 ? 'Achieved' :
                             performer.achievement >= 75 ? 'On Track' :
                             performer.achievement >= 50 ? 'At Risk' : 'Behind'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Team Organization & Performance</h2>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => {
              const teamTarget = targets.find(t => t.team_id === team.id);
              const teamAchievement = teamTarget 
                ? ((teamTarget.actual_revenue / teamTarget.target_revenue) * 100).toFixed(1)
                : 0;

              return (
                <Card key={team.id} className="border-none shadow-lg hover:shadow-xl transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{team.team_name}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{team.team_type}</p>
                      </div>
                      <Badge className={team.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {team.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <p className="text-xs text-indigo-600 mb-1">Members</p>
                        <p className="text-2xl font-bold text-indigo-700">
                          {team.member_emails?.length || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-purple-600 mb-1">Territory</p>
                        <p className="text-sm font-semibold text-purple-700">
                          {team.territory || 'Global'}
                        </p>
                      </div>
                    </div>

                    {teamTarget && (
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-gray-700">Target Achievement</p>
                          <p className="text-2xl font-bold text-emerald-600">{teamAchievement}%</p>
                        </div>
                        <div className="w-full bg-white rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full"
                            style={{ width: `${Math.min(teamAchievement, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>${(teamTarget.actual_revenue / 1000).toFixed(0)}K</span>
                          <span>${(teamTarget.target_revenue / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-1">Manager</p>
                      <p className="text-sm font-medium">
                        {users.find(u => u.email === team.manager_email)?.full_name || team.manager_email}
                      </p>
                    </div>

                    {team.product_line_ids?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {team.product_line_ids.map((plId) => (
                          <Badge key={plId} variant="outline" className="text-xs">
                            Product Line
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button variant="outline" className="w-full mt-2">
                      View Team Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {teams.length === 0 && (
            <Card className="border-none shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No teams created yet</h3>
                <p className="text-gray-400 mt-1">Create your first team to start organizing your sales force</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Revenue Forecasts</h2>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Forecast
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Card className="border-none shadow-md">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Best Case</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${((pipelineValue + wonRevenue) / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">If all deals close</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Most Likely</p>
                <p className="text-2xl font-bold text-indigo-600">
                  ${((weightedPipeline + wonRevenue) / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">Weighted by probability</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Committed</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${(wonRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">Already closed</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-md">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="text-2xl font-bold text-blue-600">
                  {((weightedPipeline / (pipelineValue || 1)) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Forecast confidence</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Submitted Forecasts</CardTitle>
            </CardHeader>
            <CardContent>
              {forecasts.length > 0 ? (
                <div className="space-y-3">
                  {forecasts.slice(0, 10).map((forecast) => (
                    <div key={forecast.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{forecast.forecast_name}</h4>
                          <Badge className={
                            forecast.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            forecast.status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                            forecast.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {forecast.status}
                          </Badge>
                          <Badge variant="outline">{forecast.forecast_type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {forecast.period_type} • Q{forecast.quarter} {forecast.year}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">
                          ${(forecast.forecasted_revenue / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-gray-500">
                          {forecast.deal_count || 0} deals
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No forecasts submitted yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}