"use client";

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'your_mapbox_token_here';

export default function MapboxFarmCapture({ onCapture, initialPolygon }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const [areaHectares, setAreaHectares] = useState(0);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    // Get user's current GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          initializeMap(longitude, latitude);
        },
        (error) => {
          console.error("Error getting location", error);
          // Fallback location (e.g. Abuja)
          initializeMap(7.49508, 9.05785);
        }
      );
    } else {
      initializeMap(7.49508, 9.05785);
    }
  }, []);

  const initializeMap = (lng, lat) => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9', // satellite view for farms
      center: [lng, lat],
      zoom: 16
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon'
    });

    map.current.addControl(draw.current);
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('draw.create', updateArea);
    map.current.on('draw.delete', updateArea);
    map.current.on('draw.update', updateArea);
    
    if (initialPolygon) {
      draw.current.add(initialPolygon);
      updateArea(null, true);
    }
  };

  const updateArea = (e, isInitialization = false) => {
    const data = draw.current.getAll();
    if (data.features.length > 0) {
      const area = turf.area(data);
      // Convert square meters to hectares
      const hectares = area / 10000;
      setAreaHectares(Math.round(hectares * 100) / 100);
      
      if (onCapture && !isInitialization) {
         onCapture({
            polygon: data,
            hectares: Math.round(hectares * 100) / 100,
            location
         });
      }
    } else {
      setAreaHectares(0);
      if (onCapture) {
         onCapture(null);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
         <div>
            <h3 className="font-semibold text-lg">Farm Boundary Capture</h3>
            <p className="text-sm text-gray-500">Draw a polygon around the farm boundary</p>
         </div>
         <div className="text-right">
            <span className="block text-xs uppercase text-gray-500 font-bold">Calculated Area</span>
            <span className="text-2xl font-black text-(--greenish-color)">{areaHectares} Ha</span>
         </div>
      </div>
      <div ref={mapContainer} className="w-full h-[500px] rounded-md overflow-hidden border border-gray-300 shadow-sm" />
    </div>
  );
}
