import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  AlertCircle,
  Clock,
  Eye,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const STAGES = [
  { id: 'Prospecting', name: 'Prospecting', color: 'bg-blue-500' },
  { id: 'Qualification', name: 'Qualification', color: 'bg-purple-500' },
  { id: 'Proposal', name: 'Proposal', color: 'bg-amber-500' },
  { id: 'Negotiation', name: 'Negotiation', color: 'bg-orange-500' },
  { id: 'Closed Won', name: 'Closed Won', color: 'bg-green-500' },
  { id: 'Closed Lost', name: 'Closed Lost', color: 'bg-red-500' },
];

export default function DealsKanban() {
  const [view, setView] = useState('kanban');
  const queryClient = useQueryClient();

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-updated_date'),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateDealMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Deal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const dealId = result.draggableId;
    const newStage = result.destination.droppableId;

    updateDealMutation.mutate({
      id: dealId,
      data: { stage: newStage }
    });
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getDealAge = (deal) => {
    const created = new Date(deal.created_date);
    const today = new Date();
    const days = Math.floor((today - created) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getDealsByStage = (stage) => {
    return deals.filter(d => d.stage === stage);
  };

  const getStageMetrics = (stage) => {
    const stageDeals = getDealsByStage(stage);
    const totalValue = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const avgAge = stageDeals.length > 0 
      ? stageDeals.reduce((sum, d) => sum + getDealAge(d), 0) / stageDeals.length
      : 0;
    return { count: stageDeals.length, totalValue, avgAge };
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-indigo-500" />
            Deals Pipeline
          </h1>
          <p className="text-gray-600 mt-1">Drag and drop deals between stages</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("kanban")}
              className={view === "kanban" ? "bg-white shadow-sm" : ""}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => window.location.href = createPageUrl('Deals')}
              className={view === "list" ? "bg-white shadow-sm" : ""}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
          <Link to={createPageUrl('Deals')}>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </Link>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {STAGES.map((stage) => {
          const metrics = getStageMetrics(stage.id);
          return (
            <Card key={stage.id} className="border-none shadow-lg">
              <CardContent className="p-4">
                <div className={`w-2 h-2 rounded-full ${stage.color} mb-2`}></div>
                <p className="text-xs text-gray-500 mb-1">{stage.name}</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.count}</p>
                <p className="text-sm font-semibold text-green-600">
                  ${(metrics.totalValue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg {metrics.avgAge.toFixed(0)} days
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGES.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const metrics = getStageMetrics(stage.id);

            return (
              <Droppable key={stage.id} droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-gray-50 rounded-lg p-3 min-h-[600px] transition-all ${
                      snapshot.isDraggingOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : ''
                    }`}
                  >
                    <div className="mb-4 sticky top-0 bg-gray-50 z-10 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                        <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {metrics.count}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-green-600">
                        ${(metrics.totalValue / 1000).toFixed(0)}K total
                      </p>
                    </div>

                    <div className="space-y-3">
                      {stageDeals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`border-none shadow-md hover:shadow-lg transition-all cursor-grab active:cursor-grabbing ${
                                snapshot.isDragging ? 'shadow-2xl rotate-2 ring-2 ring-indigo-400' : ''
                              }`}
                              onClick={() => window.location.href = createPageUrl('Deals')}
                            >
                              <CardContent className="p-4 space-y-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {deal.deal_name}
                                  </h4>
                                  {deal.probability && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                        <div
                                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                                          style={{ width: `${deal.probability}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-gray-600">{deal.probability}%</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="font-bold text-green-600">
                                    ${(deal.amount / 1000).toFixed(0)}K
                                  </span>
                                </div>

                                {deal.expected_close_date && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {format(new Date(deal.expected_close_date), 'MMM d')}
                                    </span>
                                  </div>
                                )}

                                {deal.owner_email && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-4 h-4" />
                                    <span className="truncate">{getUserName(deal.owner_email)}</span>
                                  </div>
                                )}

                                {getDealAge(deal) > 30 && (
                                  <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Stale ({getDealAge(deal)} days)</span>
                                  </div>
                                )}

                                {getDealAge(deal) > 60 && (
                                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                    <Clock className="w-3 h-3" />
                                    <span>At Risk!</span>
                                  </div>
                                )}

                                <div className="pt-2 border-t flex items-center justify-between">
                                  <div className="text-xs text-gray-500">
                                    {getDealAge(deal)} days old
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href = createPageUrl('Deals');
                                    }}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>

                    {stageDeals.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No deals</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}