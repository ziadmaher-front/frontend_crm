import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertCircle, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntegrationHealth({ stats = {}, onRefresh }) {
  const uptime = stats.uptime ?? 99.0;
  const active = stats.activeIntegrations ?? 0;
  const total = stats.totalIntegrations ?? 0;
  const failed = stats.failedIntegrations ?? 0;
  const lastSync = stats.lastSync ?? new Date().toISOString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Integration Health
        </CardTitle>
        <CardDescription>Live status and reliability metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">System Uptime</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${uptime > 99 ? 'bg-green-500' : uptime > 95 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-bold">{uptime}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Active Integrations</span>
          <Badge variant="default">{active}/{total}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Failed Integrations</span>
          <Badge variant={failed > 0 ? 'destructive' : 'secondary'}>{failed}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Last Sync</span>
          <span className="text-sm text-muted-foreground">{new Date(lastSync).toLocaleString()}</span>
        </div>

        <div className="pt-4">
          <Button className="w-full" variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All Integrations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

