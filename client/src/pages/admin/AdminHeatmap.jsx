import { useEffect, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import { analyticsAPI } from '../../services/api';
import { CATEGORIES } from '../../utils/constants';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

const DELHI_CENTER = [28.6139, 77.2090];

export default function AdminHeatmap() {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const heatLayerInstance = useRef(null);
  
  const [points, setPoints] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stats, setStats] = useState({});

  useEffect(() => {
    analyticsAPI.heatmap().then(r => {
      setPoints(r.data);
      setStats({ total: r.data.length });
    });
  }, []);

  // Initialize Map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstance.current) return;

    // Create map
    const map = L.map(mapContainerRef.current).setView(DELHI_CENTER, 11);
    
    // Add CARTO Positron (Light) tiles for a clean, clear look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update Heatmap Layer when points or filter change
  useEffect(() => {
    if (!mapInstance.current || !points.length) return;

    const filtered = categoryFilter ? points.filter(p => p.category === categoryFilter) : points;

    // Heatmap data format for leaflet.heat: [lat, lng, intensity]
    const heatData = filtered.map(p => [
      p.lat, 
      p.lng, 
      p.weight // intensity
    ]);

    // Remove existing layers if they exist
    if (heatLayerInstance.current) {
      mapInstance.current.removeLayer(heatLayerInstance.current);
    }
    // We also need to remove existing marker layer group if we added one
    if (mapInstance.current.markerGroup) {
      mapInstance.current.removeLayer(mapInstance.current.markerGroup);
    }

    // Create a new layer group for the interactive tooltips
    const markerGroup = L.layerGroup();

    filtered.forEach(p => {
      // Create an invisible circle marker just for the hover interaction
      L.circleMarker([p.lat, p.lng], {
        radius: 12,
        fillOpacity: 0,
        opacity: 0,
        interactive: true
      })
      .bindTooltip(`
        <div class="bg-white text-slate-800 rounded shadow-sm">
          <div class="font-bold text-sm mb-1">${p.category}</div>
          <div class="text-xs">Status: <span class="font-semibold">${p.status}</span></div>
          ${p.isHotspot ? `<div class="text-xs text-red-600 font-bold mt-1">🔥 Active Hotspot (${p.reporterCount} reports)</div>` : ''}
        </div>
      `, { direction: 'top', offset: [0, -10] })
      .addTo(markerGroup);
    });

    // Save the marker group to the map instance so we can remove it later
    mapInstance.current.markerGroup = markerGroup;
    markerGroup.addTo(mapInstance.current);

    // Add new heatmap layer
    heatLayerInstance.current = L.heatLayer(heatData, {
      radius: 22, // Slightly larger for visibility
      blur: 15,   // Crisper edges
      maxZoom: 14,
      max: 10,    // Adjusted so hotspots show up brighter
      gradient: {
        0.2: '#3b82f6', // Low (blue instead of green for better contrast on light map)
        0.4: '#eab308', // Medium (yellow)
        0.6: '#f97316', // High (orange)
        0.8: '#ef4444', // Critical (red)
        1.0: '#991b1b'  // Hotspot (deep dark red)
      }
    }).addTo(mapInstance.current);

  }, [points, categoryFilter]);

  return (
    <Layout title="Complaint Heatmap — Delhi NCT">
      <div className="space-y-4">
        {/* Controls */}
        <div className="card p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Filter by Category</label>
            <select className="input w-48" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="">All Categories ({points.length} points)</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c} ({points.filter(p => p.category === c).length})</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-slate-500">
            Showing <strong>{categoryFilter ? points.filter(p => p.category === categoryFilter).length : points.length}</strong> complaint locations
          </div>
        </div>

        {/* Map */}
        <div className="card overflow-hidden shadow-xl relative p-0">
          <div ref={mapContainerRef} className="h-[600px] w-full z-0" style={{ zIndex: 0 }} />
          
          {/* Custom Overlay for Map loading state */}
          {!points.length && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-slate-600 font-medium">Loading map data...</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Heatmap Intensity (Weight)</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            {[
              { label: 'Critical / Hotspot', color: 'bg-red-600' },
              { label: 'High Priority', color: 'bg-orange-500' },
              { label: 'Medium Priority', color: 'bg-yellow-500' },
              { label: 'Low Priority', color: 'bg-blue-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full shadow-md ${item.color}`} />
                <span className="text-slate-600 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
