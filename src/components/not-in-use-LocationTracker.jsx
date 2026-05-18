"use client";
import { useGeoLocation } from "@/hooks/useGeolocations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, RefreshCw, Wifi, WifiOff } from "lucide-react";

export function LocationTracker({ showControls = false }) {
   const { location, loading, lastCheck, refreshLocation, checkLocationChange } = useGeoLocation();

   const formatLastCheck = (timestamp) => {
      if (!timestamp) return "Never";
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
   };

   const isOnline = typeof window !== 'undefined' && navigator.onLine;

   return (
      <Card className="w-full max-w-md">
         <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
               <MapPin className="h-5 w-5" />
               Location Status
               <Badge variant={isOnline ? "default" : "destructive"} className="ml-auto">
                  {isOnline ? (
                     <><Wifi className="h-3 w-3 mr-1" /> Online</>
                  ) : (
                     <><WifiOff className="h-3 w-3 mr-1" /> Offline</>
                  )}
               </Badge>
            </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
            {loading ? (
               <div className="flex items-center justify-center py-4">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Detecting location...
               </div>
            ) : location ? (
               <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                     <div>
                        <span className="font-medium">IP:</span>
                        <p className="text-muted-foreground">{location.ip}</p>
                     </div>
                     <div>
                        <span className="font-medium">Country:</span>
                        <p className="text-muted-foreground">{location.country}</p>
                     </div>
                     <div>
                        <span className="font-medium">Region:</span>
                        <p className="text-muted-foreground">{location.region || "N/A"}</p>
                     </div>
                     <div>
                        <span className="font-medium">City:</span>
                        <p className="text-muted-foreground">{location.city || "N/A"}</p>
                     </div>
                  </div>
                  
                  {location.loc && (
                     <div className="text-sm">
                        <span className="font-medium">Coordinates:</span>
                        <p className="text-muted-foreground">{location.loc}</p>
                     </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground border-t pt-2">
                     <p>Last checked: {formatLastCheck(lastCheck)}</p>
                     {location.lastUpdated && (
                        <p>Last updated: {new Date(location.lastUpdated).toLocaleString()}</p>
                     )}
                  </div>
               </div>
            ) : (
               <div className="text-center py-4 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Location unavailable</p>
               </div>
            )}

            {showControls && (
               <div className="flex gap-2 pt-2 border-t">
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={refreshLocation}
                     disabled={loading}
                     className="flex-1"
                  >
                     <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                     Refresh
                  </Button>
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={checkLocationChange}
                     disabled={loading}
                     className="flex-1"
                  >
                     <MapPin className="h-4 w-4 mr-2" />
                     Check Change
                  </Button>
               </div>
            )}
         </CardContent>
      </Card>
   );
}
