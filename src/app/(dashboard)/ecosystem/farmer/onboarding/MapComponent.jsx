"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { MapPin, Trash2, Navigation, Layers } from 'lucide-react';

// Fix leaflet marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically fit map view to the polygon coordinates or position
function AutoFitBounds({ polygon, position }) {
    const map = useMap();
    useEffect(() => {
        if (!map) return;
        if (polygon && Array.isArray(polygon) && polygon.length > 0) {
            try {
                const validPoints = polygon.filter(
                    p => Array.isArray(p) && p.length >= 2 && !isNaN(Number(p[0])) && !isNaN(Number(p[1]))
                );
                if (validPoints.length >= 2) {
                    const bounds = L.latLngBounds(validPoints);
                    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 16 });
                } else if (validPoints.length === 1) {
                    map.setView(validPoints[0], 15);
                }
            } catch (err) {
                console.warn("fitBounds failed:", err);
            }
        } else if (position && position.lat && position.lng) {
            map.setView([position.lat, position.lng], 14);
        }
    }, [polygon, position, map]);
    return null;
}

function LocationPicker({ position, setPosition, readOnly }) {
    useMapEvents({
        click(e) {
            if (readOnly) return;
            setPosition(e.latlng);
        },
    });
    return position === null ? null : <Marker position={position} />;
}

function BoundaryDrawer({ polygon, setPolygon, setArea, readOnly }) {
    useMapEvents({
        click(e) {
            if (readOnly) return;
            const newPoint = [e.latlng.lat, e.latlng.lng];
            const updated = [...polygon, newPoint];
            setPolygon(updated);

            if (updated.length > 2) {
                try {
                    // Turf expects [lng, lat]
                    const turfPoints = updated.map(p => [Number(p[1]), Number(p[0])]);
                    const turfPoly = turf.polygon([[...turfPoints, turfPoints[0]]]);
                    const areaSqm = turf.area(turfPoly);
                    const areaHa = areaSqm / 10000;
                    setArea(areaHa.toFixed(2));
                } catch (err) {
                    console.warn("Turf area calculation error:", err);
                }
            }
        },
    });

    if (!polygon || polygon.length === 0) return null;

    return (
        <>
            {polygon.length >= 3 ? (
                <Polygon
                    positions={polygon}
                    pathOptions={{ color: '#10b981', weight: 3, fillColor: '#10b981', fillOpacity: 0.3 }}
                />
            ) : polygon.length === 2 ? (
                <Polyline
                    positions={polygon}
                    pathOptions={{ color: '#f59e0b', weight: 3.5, dashArray: '6, 6' }}
                />
            ) : null}

            {/* Vertex markers for precise GIS points */}
            {polygon.map((p, idx) => (
                <CircleMarker
                    key={idx}
                    center={p}
                    radius={idx === 0 ? 5 : 4}
                    pathOptions={{
                        color: idx === 0 ? '#059669' : '#047857',
                        fillColor: idx === 0 ? '#10b981' : '#ffffff',
                        fillOpacity: 1,
                        weight: 2
                    }}
                />
            ))}
        </>
    );
}

export default function MapComponent({ mode = 'location', initialPosition, initialPolygon, onChange, readOnly = false }) {
    const [layerType, setLayerType] = useState('satellite'); // Default to satellite imagery for farm inspection

    const [position, setPosition] = useState(
        initialPosition?.lat && initialPosition?.lng ? { lat: Number(initialPosition.lat), lng: Number(initialPosition.lng) } : null
    );
    
    const [polygon, setPolygon] = useState(() => {
        if (!initialPolygon) return [];
        try {
            const parsed = typeof initialPolygon === 'string' ? JSON.parse(initialPolygon) : initialPolygon;
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const [area, setArea] = useState(() => {
        if (!initialPolygon) return 0;
        try {
            const parsed = typeof initialPolygon === 'string' ? JSON.parse(initialPolygon) : initialPolygon;
            if (Array.isArray(parsed) && parsed.length > 2) {
                const turfPoints = parsed.map(p => [Number(p[1]), Number(p[0])]);
                const turfPoly = turf.polygon([[...turfPoints, turfPoints[0]]]);
                return (turf.area(turfPoly) / 10000).toFixed(2);
            }
        } catch {}
        return 0;
    });

    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        if (initialPosition?.lat && initialPosition?.lng) {
            setPosition({ lat: Number(initialPosition.lat), lng: Number(initialPosition.lng) });
        }
    }, [initialPosition]);

    useEffect(() => {
        if (initialPolygon) {
            try {
                const parsed = typeof initialPolygon === 'string' ? JSON.parse(initialPolygon) : initialPolygon;
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setPolygon(parsed);
                    if (parsed.length > 2) {
                        const turfPoints = parsed.map(p => [Number(p[1]), Number(p[0])]);
                        const turfPoly = turf.polygon([[...turfPoints, turfPoints[0]]]);
                        const areaSqm = turf.area(turfPoly);
                        setArea((areaSqm / 10000).toFixed(2));
                    }
                }
            } catch (e) {}
        }
    }, [initialPolygon]);

    const defaultCenter = position 
        ? [position.lat, position.lng] 
        : polygon.length > 0 
            ? [polygon[0][0], polygon[0][1]] 
            : [9.0820, 8.6753]; // Center of Nigeria

    const handleLocationChange = (latlng) => {
        setPosition(latlng);
        onChange?.({ lat: latlng.lat, lng: latlng.lng });
    };

    const handlePolygonChange = (poly) => {
        setPolygon(poly);
    };

    const handleAreaUpdate = (a) => {
        setArea(a);
        onChange?.({ polygon, area_hectares: a });
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setIsLocating(false);
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                handleLocationChange(coords);
            },
            (err) => {
                setIsLocating(false);
                alert("Could not access your location: " + err.message);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Calculate detailed metrics for boundary
    const metrics = (() => {
        if (!polygon || polygon.length < 3) {
            return { areaHa: area || 0, acres: ((Number(area) || 0) * 2.47105).toFixed(2), perimeterKm: 0 };
        }
        try {
            const turfPoints = polygon.map(p => [Number(p[1]), Number(p[0])]);
            const turfPoly = turf.polygon([[...turfPoints, turfPoints[0]]]);
            const sqm = turf.area(turfPoly);
            const ha = (sqm / 10000).toFixed(2);
            const ac = ((sqm / 10000) * 2.47105).toFixed(2);
            const perim = turf.length(turfPoly, { units: 'kilometers' }).toFixed(2);
            return { areaHa: ha, acres: ac, perimeterKm: perim };
        } catch {
            return { areaHa: area || 0, acres: 0, perimeterKm: 0 };
        }
    })();

    return (
        <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm z-0">
                <MapContainer center={defaultCenter} zoom={position ? 14 : 7} style={{ height: '390px', width: '100%' }}>
                    {layerType === 'satellite' ? (
                        <TileLayer
                            key="satellite-layer"
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution="Tiles &copy; Esri &mdash; Maxar, Earthstar Geographics"
                            maxZoom={19}
                        />
                    ) : (
                        <TileLayer
                            key="street-layer"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            maxZoom={19}
                        />
                    )}

                    <AutoFitBounds polygon={polygon} position={position} />

                    {mode === 'location' && (
                        <LocationPicker position={position} setPosition={handleLocationChange} readOnly={readOnly} />
                    )}
                    {mode === 'boundary' && (
                        <BoundaryDrawer polygon={polygon} setPolygon={handlePolygonChange} setArea={handleAreaUpdate} readOnly={readOnly} />
                    )}
                </MapContainer>

                {/* Satellite / Street Map Toggle Switcher */}
                <div className="absolute top-3 right-3 z-[1000] flex items-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200 dark:border-gray-700 text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => setLayerType('satellite')}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                            layerType === 'satellite'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="View satellite imagery"
                    >
                        <span>🛰️</span>
                        <span className="hidden sm:inline">Satellite</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setLayerType('street')}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                            layerType === 'street'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="View street map"
                    >
                        <span>🗺️</span>
                        <span className="hidden sm:inline">Street</span>
                    </button>
                </div>

                {/* GPS Current Location button for drawing */}
                {mode === 'location' && !readOnly && (
                    <button
                        type="button"
                        onClick={detectLocation}
                        disabled={isLocating}
                        className="absolute bottom-3 right-3 z-[1000] flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-100 shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                        <Navigation size={14} className={isLocating ? "animate-spin text-emerald-500" : "text-emerald-500"} />
                        <span>{isLocating ? "Locating..." : "Use Current GPS"}</span>
                    </button>
                )}
            </div>

            {mode === 'boundary' && (
                <div className="pt-0.5">
                    {polygon.length >= 3 ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <span>Calculated Area: <strong>{metrics.areaHa || area} Ha</strong> (~{metrics.acres} Acres)</span>
                                <span className="text-slate-300 dark:text-gray-600 hidden sm:inline">·</span>
                                <span>Perimeter: <strong>~{metrics.perimeterKm} km</strong></span>
                                <span className="text-slate-300 dark:text-gray-600 hidden sm:inline">·</span>
                                <span className="text-slate-600 dark:text-gray-400 font-normal">({polygon.length} GPS Coordinates)</span>
                            </div>

                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => { setPolygon([]); setArea(0); onChange?.({ polygon: [], area_hectares: 0 }); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition cursor-pointer shrink-0"
                                >
                                    <Trash2 size={13} />
                                    <span>Clear Boundary</span>
                                </button>
                            )}
                        </div>
                    ) : polygon.length === 2 ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                <span>⚠️ Incomplete Boundary Line: Only 2 coordinates recorded. A closed boundary requires at least 3 points.</span>
                            </div>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => { setPolygon([]); setArea(0); onChange?.({ polygon: [], area_hectares: 0 }); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-xs font-bold text-red-600 cursor-pointer shrink-0"
                                >
                                    <Trash2 size={13} />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500 dark:text-gray-400 p-2 text-center">
                            {readOnly ? "No boundary polygon coordinates recorded." : "Click on the map to place boundary points (at least 3 to close the polygon)."}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
