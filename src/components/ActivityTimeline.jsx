import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  Video, 
  MessageSquare, 
  FileText,
  Clock,
  CheckCircle,
  Eye,
  Download,
  MapPin,
  Navigation,
  Play,
  Square
} from "lucide-react";
import { format } from "date-fns";

const ACTIVITY_ICONS = {
  Email: Mail,
  Call: Phone,
  Meeting: Video,
  SMS: MessageSquare,
  WhatsApp: MessageSquare,
  Note: FileText,
  Document: FileText,
  Visit: Navigation,
};

const ACTIVITY_COLORS = {
  Email: "bg-blue-100 text-blue-700 border-blue-200",
  Call: "bg-green-100 text-green-700 border-green-200",
  Meeting: "bg-purple-100 text-purple-700 border-purple-200",
  SMS: "bg-orange-100 text-orange-700 border-orange-200",
  WhatsApp: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Note: "bg-gray-100 text-gray-700 border-gray-200",
  Document: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Visit: "bg-pink-100 text-pink-700 border-pink-200",
};

export default function ActivityTimeline({ activities, communications, documents, tasks }) {
  // Combine all activities into a single timeline
  const timelineItems = [
    ...(activities || []).map(a => ({ ...a, itemType: 'activity', date: a.activity_date })),
    ...(communications || []).map(c => ({ ...c, itemType: 'communication', date: c.completed_date || c.created_date })),
    ...(documents || []).map(d => ({ ...d, itemType: 'document', date: d.created_date })),
    ...(tasks || []).map(t => ({ ...t, itemType: 'task', date: t.completed_date || t.due_date }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (timelineItems.length === 0) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-8 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No activity recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  const renderVisitDetails = (activity) => {
    if (activity.activity_type !== 'Visit') return null;

    const hasStarted = activity.checked_in || activity.start_time;
    const hasEnded = activity.checked_out || activity.end_time;

    return (
      <div className="mt-3 space-y-3">
        {/* Visit Status */}
        <div className="flex items-center gap-2">
          {!hasStarted && (
            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
              <Clock className="w-3 h-3 mr-1" />
              Scheduled
            </Badge>
          )}
          {hasStarted && !hasEnded && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              <Play className="w-3 h-3 mr-1" />
              In Progress
            </Badge>
          )}
          {hasEnded && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        {/* Time Information */}
        {hasStarted && (
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>Started: {format(new Date(activity.start_time), 'MMM d, h:mm a')}</span>
            </div>
            {hasEnded && (
              <>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>Ended: {format(new Date(activity.end_time), 'MMM d, h:mm a')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 font-medium">
                  <Square className="w-3 h-3" />
                  <span>Duration: {(() => {
                    const start = new Date(activity.start_time);
                    const end = new Date(activity.end_time);
                    const minutes = Math.round((end - start) / 60000);
                    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
                  })()}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Location Information */}
        {activity.start_location && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Check-In Location</span>
            </div>
            <p className="text-xs text-gray-700 mb-1">{activity.start_location.address}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {activity.start_location.latitude.toFixed(6)}, {activity.start_location.longitude.toFixed(6)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${activity.start_location.latitude},${activity.start_location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                View Map →
              </a>
            </div>
          </div>
        )}

        {activity.end_location && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Check-Out Location</span>
            </div>
            <p className="text-xs text-gray-700 mb-1">{activity.end_location.address}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {activity.end_location.latitude.toFixed(6)}, {activity.end_location.longitude.toFixed(6)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${activity.end_location.latitude},${activity.end_location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                View Map →
              </a>
            </div>
          </div>
        )}

        {/* Distance Traveled */}
        {activity.start_location && activity.end_location && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Distance traveled:</span> ~{(() => {
              const R = 6371;
              const lat1 = activity.start_location.latitude * Math.PI / 180;
              const lat2 = activity.end_location.latitude * Math.PI / 180;
              const deltaLat = (activity.end_location.latitude - activity.start_location.latitude) * Math.PI / 180;
              const deltaLon = (activity.end_location.longitude - activity.start_location.longitude) * Math.PI / 180;

              const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                       Math.cos(lat1) * Math.cos(lat2) *
                       Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const distance = R * c;

              return distance < 1 
                ? `${Math.round(distance * 1000)}m`
                : `${distance.toFixed(2)}km`;
            })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {timelineItems.map((item, index) => {
        if (item.itemType === 'activity' || item.itemType === 'communication') {
          const Icon = ACTIVITY_ICONS[item.activity_type || item.communication_type] || FileText;
          const colorClass = ACTIVITY_COLORS[item.activity_type || item.communication_type] || "bg-gray-100 text-gray-700";

          return (
            <Card key={`${item.itemType}-${item.id}`} className="border-none shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl ${colorClass} h-fit`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{item.subject}</h4>
                        <p className="text-xs text-gray-500">
                          {format(new Date(item.date), 'MMM d, yyyy h:mm a')}
                          {item.direction && ` • ${item.direction}`}
                          {item.created_by && ` • by ${item.created_by}`}
                        </p>
                      </div>
                      <Badge className={colorClass}>
                        {item.activity_type || item.communication_type}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                    )}
                    {item.content && (
                      <p className="text-sm text-gray-600 mt-2">{item.content}</p>
                    )}
                    {item.outcome && (
                      <Badge variant="outline" className="mt-2">
                        {item.outcome}
                      </Badge>
                    )}
                    {item.is_opened && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                        <Eye className="w-3 h-3" />
                        Opened {item.opened_date && format(new Date(item.opened_date), 'MMM d, h:mm a')}
                      </div>
                    )}

                    {/* Visit-specific details */}
                    {renderVisitDetails(item)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }

        if (item.itemType === 'document') {
          return (
            <Card key={`doc-${item.id}`} className="border-none shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700 h-fit">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{item.document_name}</h4>
                        <p className="text-xs text-gray-500">
                          {format(new Date(item.date), 'MMM d, yyyy h:mm a')}
                          {item.created_by && ` • by ${item.created_by}`}
                        </p>
                      </div>
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                        {item.document_type}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {item.status && (
                        <Badge variant="outline">{item.status}</Badge>
                      )}
                      {item.is_signed && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Signed
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(item.file_url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }

        if (item.itemType === 'task') {
          return (
            <Card key={`task-${item.id}`} className="border-none shadow-md hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl h-fit ${
                    item.status === 'Completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-xs text-gray-500">
                          Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                          {item.assigned_to && ` • Assigned to ${item.assigned_to}`}
                        </p>
                      </div>
                      <Badge className={
                        item.status === 'Completed' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }>
                        {item.status}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                    )}
                    {item.priority && (
                      <Badge variant="outline" className="mt-2">
                        {item.priority} Priority
                      </Badge>
                    )}
                    {item.completed_location && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Completed At</span>
                        </div>
                        <p className="text-xs text-gray-700">{item.completed_location.address}</p>
                        <a
                          href={`https://www.google.com/maps?q=${item.completed_location.latitude},${item.completed_location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block"
                        >
                          View on Map →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }

        return null;
      })}
    </div>
  );
}

// Memoized ActivityItem component
const ActivityItem = memo(({ item, index }) => {
  const IconComponent = ACTIVITY_ICONS[item.type] || FileText;
  const colorClass = ACTIVITY_COLORS[item.type] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="flex gap-4 group hover:bg-gray-50 p-3 rounded-lg transition-colors">
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-full border ${colorClass}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        {index < timelineItems.length - 1 && (
          <div className="w-px h-12 bg-gray-200 mt-2" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{item.subject || item.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          </div>
          <div className="text-xs text-gray-500 ml-4">
            {format(new Date(item.date), 'MMM dd, HH:mm')}
          </div>
        </div>
        {item.itemType === 'task' && (
          <Badge variant={item.status === 'Completed' ? 'success' : 'secondary'} className="mt-2">
            {item.status}
          </Badge>
        )}
      </div>
    </div>
  );
});

// Memoized TimelineSection component
const TimelineSection = memo(({ title, items, icon: Icon }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Icon className="w-4 h-4" />
      {title} ({items.length})
    </div>
    <div className="space-y-1">
      {items.map((item, index) => (
        <ActivityItem key={`${item.itemType}-${item.id}`} item={item} index={index} />
      ))}
    </div>
  </div>
));