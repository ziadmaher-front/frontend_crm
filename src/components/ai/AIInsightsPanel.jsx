// AI Insights Panel - Intelligent Recommendations and Analytics
import React, { useState, useEffect, useMemo } from 'react';
import { 
  SparklesIcon,
  LightBulbIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useAIInsights } from '@/hooks/ai/useAIInsights';
import { usePredictiveAnalytics } from '@/hooks/ai/usePredictiveAnalytics';
import { useRecommendations } from '@/hooks/ai/useRecommendations';
import { cn } from '@/utils/cn';

const AIInsightsPanel = ({ 
  entityType = 'general', 
  entityId = null, 
  entityData = null,
  className = '',
  onActionClick = null,
}) => {
  const [activeTab, setActiveTab] = useState('insights');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    insights, 
    isLoading: insightsLoading, 
    refresh: refreshInsights 
  } = useAIInsights(entityType, entityId, entityData);

  const { 
    predictions, 
    isLoading: predictionsLoading 
  } = usePredictiveAnalytics(entityType, entityData);

  const { 
    recommendations, 
    isLoading: recommendationsLoading 
  } = useRecommendations(entityType, entityData);

  // Refresh all AI data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshInsights();
    } finally {
      setRefreshing(false);
    }
  };

  // Get insight icon based on type
  const getInsightIcon = (type, sentiment = 'neutral') => {
    const iconClass = "h-5 w-5";
    
    switch (type) {
      case 'opportunity':
        return <TrendingUpIcon className={cn(iconClass, "text-green-600")} />;
      case 'risk':
        return <ExclamationTriangleIcon className={cn(iconClass, "text-red-600")} />;
      case 'recommendation':
        return <LightBulbIcon className={cn(iconClass, "text-blue-600")} />;
      case 'trend':
        return sentiment === 'positive' 
          ? <TrendingUpIcon className={cn(iconClass, "text-green-600")} />
          : <TrendingDownIcon className={cn(iconClass, "text-red-600")} />;
      case 'action':
        return <CheckCircleIcon className={cn(iconClass, "text-purple-600")} />;
      default:
        return <SparklesIcon className={cn(iconClass, "text-gray-600")} />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Insights Tab Content
  const InsightsContent = () => (
    <div className="space-y-4">
      {insightsLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : insights?.length > 0 ? (
        insights.map((insight, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getInsightIcon(insight.type, insight.sentiment)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {insight.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(insight.priority)}
                    >
                      {insight.priority}
                    </Badge>
                    {insight.confidence && (
                      <Badge variant="secondary">
                        {Math.round(insight.confidence * 100)}% confident
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {insight.description}
                </p>
                {insight.metrics && (
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {insight.metrics.map((metric, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {metric.value}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {insight.actions && insight.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {insight.actions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => onActionClick?.(action)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center py-8">
          <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No insights available at the moment
          </p>
        </div>
      )}
    </div>
  );

  // Predictions Tab Content
  const PredictionsContent = () => (
    <div className="space-y-4">
      {predictionsLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : predictions?.length > 0 ? (
        predictions.map((prediction, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {prediction.title}
              </h4>
              <Badge variant="outline">
                {prediction.timeframe}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Probability
                </span>
                <span className="text-sm font-medium">
                  {Math.round(prediction.probability * 100)}%
                </span>
              </div>
              <Progress value={prediction.probability * 100} className="h-2" />
              
              {prediction.factors && (
                <div className="mt-4">
                  <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Key Factors
                  </h5>
                  <div className="space-y-1">
                    {prediction.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {factor.name}
                        </span>
                        <span className={cn(
                          "font-medium",
                          factor.impact > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {factor.impact > 0 ? '+' : ''}{Math.round(factor.impact * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center py-8">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No predictions available
          </p>
        </div>
      )}
    </div>
  );

  // Recommendations Tab Content
  const RecommendationsContent = () => (
    <div className="space-y-4">
      {recommendationsLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      ) : recommendations?.length > 0 ? (
        recommendations.map((recommendation, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <LightBulbIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {recommendation.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {recommendation.category}
                    </Badge>
                    {recommendation.impact && (
                      <Badge 
                        variant="secondary"
                        className={cn(
                          recommendation.impact === 'high' && "bg-green-100 text-green-800",
                          recommendation.impact === 'medium' && "bg-yellow-100 text-yellow-800",
                          recommendation.impact === 'low' && "bg-gray-100 text-gray-800"
                        )}
                      >
                        {recommendation.impact} impact
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {recommendation.description}
                </p>
                
                {recommendation.expectedOutcome && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
                    <h5 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Expected Outcome
                    </h5>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {recommendation.expectedOutcome}
                    </p>
                  </div>
                )}
                
                {recommendation.steps && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recommended Steps
                    </h5>
                    <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {recommendation.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 w-4 h-4 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {recommendation.actions && (
                  <div className="flex flex-wrap gap-2">
                    {recommendation.actions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant={idx === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={() => onActionClick?.(action)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center py-8">
          <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No recommendations available
          </p>
        </div>
      )}
    </div>
  );

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            AI Insights
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="mt-6">
          <InsightsContent />
        </TabsContent>
        
        <TabsContent value="predictions" className="mt-6">
          <PredictionsContent />
        </TabsContent>
        
        <TabsContent value="recommendations" className="mt-6">
          <RecommendationsContent />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AIInsightsPanel;