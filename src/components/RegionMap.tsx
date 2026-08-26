import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

type RegionKey = 'northwest' | 'central' | 'metro';

const REGIONS: Record<RegionKey, {
  name: string;
  short: string;
  color: string;
  fill: string;
  center: [number, number];
  zoom: number;
  stats: { label: string; value: string }[];
  bounds: [[number, number], [number, number]];
}> = {
  northwest: {
    name: 'Northwest Minnesota',
    short: 'Brainerd Lakes / NW',
    color: '#22d3ee',
    fill: 'rgba(34, 211, 238, 0.25)',
    center: [-94.2, 46.35],
    zoom: 7.2,
    stats: [
      { label: 'Median hourly wage', value: '~$22.98' },
      { label: 'Family COL (2+1)', value: '~$62k' },
      { label: 'Computer & Math share', value: '~1.1%' },
      { label: 'Housing cost', value: 'Advantage' },
    ],
    bounds: [[-97.2, 45.0], [-93.0, 49.4]],
  },
  central: {
    name: 'Central Minnesota',
    short: 'Central MN',
    color: '#67e8f9',
    fill: 'rgba(103, 232, 249, 0.2)',
    center: [-94.15, 45.55],
    zoom: 7.5,
    stats: [
      { label: 'Median hourly wage', value: '~$23.85' },
      { label: 'Family COL (2+1)', value: '~$72k' },
      { label: 'Computer & Math share', value: '~1.4–1.6%' },
      { label: 'Housing cost', value: 'Advantage' },
    ],
    bounds: [[-96.0, 44.5], [-92.8, 46.5]],
  },
  metro: {
    name: 'Twin Cities Metro',
    short: 'Metro',
    color: '#fbbf24',
    fill: 'rgba(251, 191, 36, 0.22)',
    center: [-93.25, 44.95],
    zoom: 8.5,
    stats: [
      { label: 'Median hourly wage', value: '~$28.48' },
      { label: 'Family COL (2+1)', value: '~$82k' },
      { label: 'Computer & Math share', value: '~3.5%+' },
      { label: 'Housing cost', value: 'Highest' },
    ],
    bounds: [[-93.8, 44.6], [-92.7, 45.3]],
  },
};

const REGION_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'northwest', name: 'Northwest Minnesota' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-97.2, 45.0], [-96.5, 45.0], [-95.5, 45.2], [-94.0, 45.3],
          [-93.2, 45.8], [-93.0, 46.5], [-93.0, 48.0], [-93.5, 49.0],
          [-95.0, 49.3], [-97.2, 49.0], [-97.2, 45.0]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'central', name: 'Central Minnesota' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-96.0, 44.5], [-94.5, 44.5], [-93.0, 44.8], [-92.8, 45.5],
          [-93.0, 46.2], [-94.0, 46.5], [-95.5, 46.2], [-96.0, 45.5],
          [-96.0, 44.5]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'metro', name: 'Twin Cities Metro' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-93.75, 44.65], [-92.85, 44.65], [-92.75, 45.05],
          [-92.9, 45.25], [-93.5, 45.25], [-93.75, 44.95],
          [-93.75, 44.65]
        ]]
      }
    }
  ]
};

export default function RegionMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [active, setActive] = useState<RegionKey>('northwest');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let map: any = null;

    async function init() {
      if (!containerRef.current || mapRef.current) return;
      const maplibregl = (await import('maplibre-gl')).default;

      map = new maplibregl.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [-94.0, 45.8],
        zoom: 5.8,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

      map.on('load', () => {
        if (cancelled) return;

        map.addSource('regions', {
          type: 'geojson',
          data: REGION_GEOJSON,
        });

        map.addLayer({
          id: 'regions-fill',
          type: 'fill',
          source: 'regions',
          paint: {
            'fill-color': [
              'match', ['get', 'id'],
              'northwest', '#22d3ee',
              'central', '#67e8f9',
              'metro', '#fbbf24',
              '#94a3b8'
            ],
            'fill-opacity': 0.28,
          }
        });

        map.addLayer({
          id: 'regions-outline',
          type: 'line',
          source: 'regions',
          paint: {
            'line-color': [
              'match', ['get', 'id'],
              'northwest', '#22d3ee',
              'central', '#67e8f9',
              'metro', '#fbbf24',
              '#94a3b8'
            ],
            'line-width': 2.5,
            'line-opacity': 0.9,
          }
        });

        map.on('click', 'regions-fill', (e: any) => {
          const id = e.features?.[0]?.properties?.id as RegionKey | undefined;
          if (id && REGIONS[id]) setActive(id);
        });
        map.on('mouseenter', 'regions-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'regions-fill', () => {
          map.getCanvas().style.cursor = '';
        });

        mapRef.current = map;
        setReady(true);
      });
    }

    init();

    return () => {
      cancelled = true;
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const r = REGIONS[active];
    map.flyTo({
      center: r.center,
      zoom: r.zoom,
      duration: 1200,
      essential: true,
    });
  }, [active, ready]);

  const region = REGIONS[active];

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 aspect-[4/3] min-h-[320px]">
        <div ref={containerRef} className="absolute inset-0 w-full h-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            Loading map…
          </div>
        )}
      </div>

      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(REGIONS) as RegionKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                active === key
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500/50'
              }`}
              style={active === key ? { backgroundColor: REGIONS[key].color, borderColor: REGIONS[key].color, color: '#0a0f1a' } : undefined}
            >
              {REGIONS[key].short}
            </button>
          ))}
        </div>

        <div className="card flex-1 !p-5">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: region.color }}
            />
            <h3 className="text-lg font-semibold">{region.name}</h3>
          </div>
          <ul className="space-y-3 text-sm">
            {region.stats.map((s) => (
              <li key={s.label} className="flex justify-between gap-4">
                <span className="text-slate-400">{s.label}</span>
                <span className="font-medium text-right">{s.value}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-5">
            Click a region on the map or use the buttons above. Approximate DEED-aligned figures for storytelling.
          </p>
        </div>
      </div>
    </div>
  );
}
