import { useEffect, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import { analyticsAPI } from '../../services/api';
import { CATEGORIES } from '../../utils/constants';

const DELHI_CENTER = { lat: 28.6139, lng: 77.2090 };

export default function AdminHeatmap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const heatmapRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    analyticsAPI.heatmap().then(r => {
      setPoints(r.data);
      const byDist = {};
      r.data.forEach(p => {
        // Count points
      });
      setStats({ total: r.data.length });
    });
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey.includes('your_') || mapInstance.current) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization&callback=initDelhiMap`;
    script.async = true;
    script.defer = true;

    window.initDelhiMap = () => {
      if (!mapRef.current) return;
      const map = new window.google.maps.Map(mapRef.current, {
        center: DELHI_CENTER, zoom: 11,
        mapTypeId: 'roadmap',
        styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
      });
      mapInstance.current = map;
      setMapLoaded(true);
    };

    document.head.appendChild(script);
    return () => { delete window.initDelhiMap; };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !window.google || !points.length) return;

    const filtered = categoryFilter ? points.filter(p => p.category === categoryFilter) : points;

    if (heatmapRef.current) heatmapRef.current.setMap(null);
    const heatmapData = filtered.map(p => ({
      location: new window.google.maps.LatLng(p.lat, p.lng),
      weight: p.weight
    }));

    heatmapRef.current = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: mapInstance.current,
      radius: 30,
      opacity: 0.8,
      gradient: [
        'rgba(0,255,255,0)', 'rgba(0,255,255,1)', 'rgba(0,191,255,1)',
        'rgba(0,127,255,1)', 'rgba(0,63,255,1)', 'rgba(0,0,255,1)',
        'rgba(0,0,223,1)', 'rgba(0,0,191,1)', 'rgba(0,0,159,1)',
        'rgba(0,0,127,1)', 'rgba(63,0,91,1)', 'rgba(127,0,63,1)',
        'rgba(191,0,31,1)', 'rgba(255,0,0,1)'
      ]
    });
  }, [mapLoaded, points, categoryFilter]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasKey = apiKey && !apiKey.includes('your_');

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
        <div className="card overflow-hidden">
          {!hasKey ? (
            // Mock Heatmap when no API key
            <div className="relative bg-slate-800 h-[500px] flex items-center justify-center">
              <div className="text-center text-white max-w-md px-4">
                <div className="text-5xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold mb-2">Interactive Heatmap</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Configure <code className="bg-slate-700 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to enable the live Google Maps heatmap showing {points.length} complaint locations across Delhi.
                </p>
                <div className="bg-slate-700 rounded-lg p-4 text-left text-xs text-slate-300">
                  <p className="font-mono">VITE_GOOGLE_MAPS_API_KEY=your_key_here</p>
                  <p className="mt-1 text-slate-400">in client/.env</p>
                </div>
                {/* Mock heatmap dots */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {points.slice(0, 50).map((p, i) => (
                    <div key={i} className="absolute rounded-full opacity-60 blur-sm"
                      style={{
                        left: `${((p.lng - 76.8) / 0.7) * 100}%`,
                        top: `${((28.9 - p.lat) / 0.5) * 100}%`,
                        width: `${8 + p.weight * 4}px`,
                        height: `${8 + p.weight * 4}px`,
                        background: { 4: '#ef4444', 3: '#f97316', 2: '#eab308', 1: '#22c55e' }[p.weight] || '#3b82f6'
                      }} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="h-[500px] w-full" />
          )}
        </div>

        {/* Legend */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {[
              { label: 'Critical', color: 'bg-red-500' },
              { label: 'High', color: 'bg-orange-500' },
              { label: 'Medium', color: 'bg-yellow-500' },
              { label: 'Low', color: 'bg-green-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-slate-600">{item.label} Priority</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
