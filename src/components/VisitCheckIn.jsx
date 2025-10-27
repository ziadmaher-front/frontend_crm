import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Clock, 
  Play, 
  Square,
  Navigation,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function VisitCheckIn({ visit, onUpdate }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const queryClient = useQueryClient();

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Activity.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      if (onUpdate) onUpdate();
    },
  });

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            
            resolve({
              latitude,
              longitude,
              accuracy,
              address: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            resolve({
              latitude,
              longitude,
              accuracy,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              timestamp: new Date().toISOString()
            });
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          setIsGettingLocation(false);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleCheckIn = async () => {
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      await updateActivityMutation.mutateAsync({
        id: visit.id,
        data: {
          ...visit,
          start_time: new Date().toISOString(),
          start_location: location,
          checked_in: true,
          status: 'In Progress'
        }
      });
      
      toast.success("Checked in successfully");
    } catch (error) {
      toast.error("Failed to check in: " + error.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      const location = await getCurrentLocation();
      
      await updateActivityMutation.mutateAsync({
        id: visit.id,
        data: {
          ...visit,
          end_time: new Date().toISOString(),
          end_location: location,
          checked_out: true,
          status: 'Completed'
        }
      });
      
      toast.success("Checked out successfully");
    } catch (error) {
      toast.error("Failed to check out: " + error.message);
    }
  };

  const canCheckIn = !visit.checked_in;
  const canCheckOut = visit.checked_in && !visit.checked_out;

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-indigo-500" />
          Visit Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Status</span>
          </div>
          {!visit.checked_in && (
            <p className="text-sm text-gray-600">Not started yet</p>
          )}
          {visit.checked_in && !visit.checked_out && (
            <div>
              <p className="text-sm font-semibold text-blue-600">Visit in progress</p>
              <p className="text-xs text-gray-500 mt-1">
                Started: {format(new Date(visit.start_time), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          )}
          {visit.checked_out && (
            <div>
              <p className="text-sm font-semibold text-green-600">Visit completed</p>
              <p className="text-xs text-gray-500 mt-1">
                Duration: {(() => {
                  const start = new Date(visit.start_time);
                  const end = new Date(visit.end_time);
                  const minutes = Math.round((end - start) / 60000);
                  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
                })()}
              </p>
            </div>
          )}
        </div>

        {/* Check In/Out Buttons */}
        <div className="flex gap-2">
          {canCheckIn && (
            <Button
              onClick={handleCheckIn}
              disabled={isGettingLocation}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <Play className="w-4 h-4 mr-2" />
              {isGettingLocation ? 'Getting Location...' : 'Check In'}
            </Button>
          )}
          {canCheckOut && (
            <Button
              onClick={handleCheckOut}
              disabled={isGettingLocation}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <Square className="w-4 h-4 mr-2" />
              {isGettingLocation ? 'Getting Location...' : 'Check Out'}
            </Button>
          )}
        </div>

        {/* Location Information */}
        {visit.start_location && (
          <div className="space-y-3">
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Check-In Location</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">{visit.start_location.address}</p>
              <p className="text-xs text-gray-400">
                {visit.start_location.latitude.toFixed(6)}, {visit.start_location.longitude.toFixed(6)}
              </p>
              {visit.start_location.accuracy && (
                <p className="text-xs text-gray-400">
                  Accuracy: ±{Math.round(visit.start_location.accuracy)}m
                </p>
              )}
              <a
                href={`https://www.google.com/maps?q=${visit.start_location.latitude},${visit.start_location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block"
              >
                View on Google Maps →
              </a>
            </div>
          </div>
        )}

        {visit.end_location && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Check-Out Location</span>
            </div>
            <p className="text-xs text-gray-600 mb-1">{visit.end_location.address}</p>
            <p className="text-xs text-gray-400">
              {visit.end_location.latitude.toFixed(6)}, {visit.end_location.longitude.toFixed(6)}
            </p>
            {visit.end_location.accuracy && (
              <p className="text-xs text-gray-400">
                Accuracy: ±{Math.round(visit.end_location.accuracy)}m
              </p>
            )}
            <a
              href={`https://www.google.com/maps?q=${visit.end_location.latitude},${visit.end_location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 mt-1 inline-block"
            >
              View on Google Maps →
            </a>
          </div>
        )}

        {visit.start_location && visit.end_location && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-500">
              Distance traveled: ~{(() => {
                const R = 6371; // Earth's radius in km
                const lat1 = visit.start_location.latitude * Math.PI / 180;
                const lat2 = visit.end_location.latitude * Math.PI / 180;
                const deltaLat = (visit.end_location.latitude - visit.start_location.latitude) * Math.PI / 180;
                const deltaLon = (visit.end_location.longitude - visit.start_location.longitude) * Math.PI / 180;

                const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                         Math.cos(lat1) * Math.cos(lat2) *
                         Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const distance = R * c;

                return distance < 1 
                  ? `${Math.round(distance * 1000)}m`
                  : `${distance.toFixed(2)}km`;
              })()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}