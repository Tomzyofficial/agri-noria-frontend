"use client";

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf';

// Fix leaflet marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return position === null ? null : <Marker position={position} />;
}

function BoundaryDrawer({ polygon, setPolygon, setArea }) {
    useMapEvents({
        click(e) {
            const newPoint = [e.latlng.lat, e.latlng.lng];
            const updated = [...polygon, newPoint];
            setPolygon(updated);

            if (updated.length > 2) {
                // Calculate area using turf
                // Turf expects [lng, lat]
                const turfPoints = updated.map(p => [p[1], p[0]]);
                // Close the polygon for Turf
                const turfPoly = turf.polygon([[...turfPoints, turfPoints[0]]]);
                const areaSqm = turf.area(turfPoly);
                const areaHa = areaSqm / 10000;
                setArea(areaHa.toFixed(2));
            }
        },
    });

    return polygon.length > 0 ? <Polygon positions={polygon} /> : null;
}

export default function MapComponent({ mode = 'location', onChange }) {
    const defaultCenter = [9.0820, 8.6753]; // Center of Nigeria
    const [position, setPosition] = useState(null);
    const [polygon, setPolygon] = useState([]);
    const [area, setArea] = useState(0);

    const handleLocationChange = (latlng) => {
        setPosition(latlng);
        onChange({ lat: latlng.lat, lng: latlng.lng });
    };

    const handlePolygonChange = (poly) => {
        setPolygon(poly);
    };

    const handleAreaUpdate = (a) => {
        setArea(a);
        onChange({ polygon, area_hectares: a });
    };

    return (
        <div>
            <MapContainer center={defaultCenter} zoom={6} style={{ height: '400px', width: '100%', borderRadius: '8px' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mode === 'location' && (
                    <LocationPicker position={position} setPosition={handleLocationChange} />
                )}
                {mode === 'boundary' && (
                    <BoundaryDrawer polygon={polygon} setPolygon={handlePolygonChange} setArea={handleAreaUpdate} />
                )}
            </MapContainer>
            {mode === 'boundary' && area > 0 && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#f0fdf4', borderRadius: '4px', color: '#10b981', fontWeight: 'bold' }}>
                    Calculated Area: {area} Hectares
                </div>
            )}
            {mode === 'boundary' && (
                <button
                    onClick={() => { setPolygon([]); setArea(0); }}
                    style={{ marginTop: '10px', padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Clear Boundary
                </button>
            )}
        </div>
    );
}
