import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

type RegionKey =
  | 'northwest'
  | 'northeast'
  | 'central'
  | 'southwest'
  | 'southeast'
  | 'metro';

type Region = {
  name: string;
  short: string;
  color: string;
  center: [number, number];
  zoom: number;
  stats: { label: string; value: string }[];
  blurb: string;
};

const REGIONS: Record<RegionKey, Region> = {
  northwest: {
    name: 'Northwest Minnesota',
    short: 'Northwest',
    color: '#22d3ee',
    center: [-95.0, 47.2],
    zoom: 6.6,
    stats: [
      { label: 'Median hourly wage', value: '~$22.98' },
      { label: 'Family COL (2+1)', value: '~$62k' },
      { label: 'Computer & Math share', value: '~1.1%' },
      { label: 'Housing cost', value: 'Lower' },
      { label: 'Includes', value: 'Brainerd Lakes, Bemidji' },
    ],
    blurb:
      'Strong healthcare, tourism, and trades. Thin software-product sector — the gap Spatialytics is built to help close.',
  },
  northeast: {
    name: 'Northeast Minnesota',
    short: 'Northeast',
    color: '#2dd4bf',
    center: [-92.5, 47.3],
    zoom: 6.8,
    stats: [
      { label: 'Median hourly wage', value: '~$23–24' },
      { label: 'Family COL (2+1)', value: '~$64–70k' },
      { label: 'Computer & Math share', value: '~1.0–1.3%' },
      { label: 'Housing cost', value: 'Lower–moderate' },
      { label: 'Includes', value: 'Duluth, Iron Range' },
    ],
    blurb:
      'Mining, healthcare, education, and tourism. Duluth has some tech and design capacity; product companies remain limited outside a few hubs.',
  },
  central: {
    name: 'Central Minnesota',
    short: 'Central',
    color: '#67e8f9',
    center: [-94.2, 45.55],
    zoom: 7.2,
    stats: [
      { label: 'Median hourly wage', value: '~$23.85' },
      { label: 'Family COL (2+1)', value: '~$72k' },
      { label: 'Computer & Math share', value: '~1.4–1.6%' },
      { label: 'Housing cost', value: 'Moderate' },
      { label: 'Includes', value: 'St. Cloud area' },
    ],
    blurb:
      'More diversified than far north regions. St. Cloud adds some professional and tech roles, still well below metro concentration.',
  },
  southwest: {
    name: 'Southwest Minnesota',
    short: 'Southwest',
    color: '#a78bfa',
    center: [-95.5, 44.0],
    zoom: 7.0,
    stats: [
      { label: 'Median hourly wage', value: '~$22–23' },
      { label: 'Family COL (2+1)', value: '~$60–68k' },
      { label: 'Computer & Math share', value: '~1.0%' },
      { label: 'Housing cost', value: 'Lower' },
      { label: 'Includes', value: 'Mankato, rural SW' },
    ],
    blurb:
      'Agriculture, manufacturing, and healthcare dominate. Very limited independent software and GIS product companies.',
  },
  southeast: {
    name: 'Southeast Minnesota',
    short: 'Southeast',
    color: '#f472b6',
    center: [-92.5, 43.95],
    zoom: 7.0,
    stats: [
      { label: 'Median hourly wage', value: '~$24–25' },
      { label: 'Family COL (2+1)', value: '~$68–74k' },
      { label: 'Computer & Math share', value: '~1.5–2.0%' },
      { label: 'Housing cost', value: 'Moderate' },
      { label: 'Includes', value: 'Rochester, Winona' },
    ],
    blurb:
      'Rochester (Mayo) pulls wages and professional roles upward. Still far fewer pure software product firms than the Twin Cities.',
  },
  metro: {
    name: 'Twin Cities Metro',
    short: 'Metro',
    color: '#fbbf24',
    center: [-93.25, 44.95],
    zoom: 8.3,
    stats: [
      { label: 'Median hourly wage', value: '~$28.48' },
      { label: 'Family COL (2+1)', value: '~$82k' },
      { label: 'Computer & Math share', value: '~3.5%+' },
      { label: 'Housing cost', value: 'Highest' },
      { label: 'Includes', value: '7-county metro' },
    ],
    blurb:
      'Concentrates the large majority of Minnesota’s software, GIS product, and high-wage professional roles — and the highest housing costs.',
  },
};

const REGION_GEOJSON: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'northwest' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-97.2, 45.5], [-95.5, 45.4], [-94.0, 45.6], [-93.2, 46.2],
          [-93.0, 47.0], [-93.0, 48.5], [-94.5, 49.3], [-97.2, 49.0],
          [-97.2, 45.5],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'northeast' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-93.2, 46.2], [-92.0, 46.0], [-90.0, 46.5], [-89.5, 47.5],
          [-90.5, 48.5], [-92.0, 49.0], [-93.0, 48.5], [-93.0, 47.0],
          [-93.2, 46.2],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'central' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-96.0, 44.8], [-94.5, 44.7], [-93.3, 44.9], [-92.9, 45.5],
          [-93.2, 46.2], [-94.5, 46.3], [-95.8, 46.0], [-96.0, 45.3],
          [-96.0, 44.8],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'southwest' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-96.8, 43.5], [-94.5, 43.5], [-94.0, 44.2], [-94.5, 44.7],
          [-96.0, 44.8], [-96.5, 44.3], [-96.8, 43.5],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'southeast' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-94.0, 43.5], [-91.2, 43.5], [-91.2, 44.5], [-92.5, 44.9],
          [-93.3, 44.9], [-94.0, 44.2], [-94.0, 43.5],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: { id: 'metro' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-93.7, 44.7], [-92.85, 44.7], [-92.75, 45.05],
          [-92.95, 45.25], [-93.55, 45.25], [-93.7, 44.95],
          [-93.7, 44.7],
        ]],
      },
    },
  ],
};

const ORDER: RegionKey[] = [
  'northwest',
  'northeast',
  'central',
  'southwest',
  'southeast',
  'metro',
];

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
              attribution: '© OpenStreetMap',
            },
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [-94.2, 46.0],
        zoom: 5.5,
        attributionControl: false,
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right'
      );
      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        'bottom-right'
      );

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
              'match',
              ['get', 'id'],
              'northwest', '#22d3ee',
              'northeast', '#2dd4bf',
              'central', '#67e8f9',
              'southwest', '#a78bfa',
              'southeast', '#f472b6',
              'metro', '#fbbf24',
              '#94a3b8',
            ],
            'fill-opacity': 0.28,
          },
        });

        map.addLayer({
          id: 'regions-outline',
          type: 'line',
          source: 'regions',
          paint: {
            'line-color': [
              'match',
              ['get', 'id'],
              'northwest', '#22d3ee',
              'northeast', '#2dd4bf',
              'central', '#67e8f9',
              'southwest', '#a78bfa',
              'southeast', '#f472b6',
              'metro', '#fbbf24',
              '#94a3b8',
            ],
            'line-width': 2,
            'line-opacity': 0.95,
          },
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
      duration: 1100,
      essential: true,
    });
    if (map.getLayer('regions-fill')) {
      map.setPaintProperty('regions-fill', 'fill-opacity', [
        'case',
        ['==', ['get', 'id'], active],
        0.42,
        0.2,
      ]);
    }
  }, [active, ready]);

  const region = REGIONS[active];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 aspect-[4/3] min-h-[340px]">
          <div ref={containerRef} className="absolute inset-0 w-full h-full" />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              Loading map…
            </div>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="card flex-1 !p-5">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: region.color }}
              />
              <h3 className="text-lg font-semibold">{region.name}</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              {region.blurb}
            </p>
            <ul className="space-y-2.5 text-sm">
              {region.stats.map((s) => (
                <li key={s.label} className="flex justify-between gap-3">
                  <span className="text-slate-400">{s.label}</span>
                  <span className="font-medium text-right">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
              active === key
                ? 'text-slate-950 border-transparent'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500/40'
            }`}
            style={
              active === key
                ? {
                    backgroundColor: REGIONS[key].color,
                    borderColor: REGIONS[key].color,
                  }
                : undefined
            }
          >
            {REGIONS[key].short}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ORDER.map((key) => {
          const r = REGIONS[key];
          const wage = r.stats.find((s) => s.label.includes('wage'))?.value ?? '—';
          const col = r.stats.find((s) => s.label.includes('COL'))?.value ?? '—';
          const tech = r.stats.find((s) => s.label.includes('Computer'))?.value ?? '—';
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`text-left rounded-xl border p-3 transition ${
                active === key
                  ? 'border-cyan-500/50 bg-slate-900'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: r.color }}
                />
                <span className="text-xs font-semibold">{r.short}</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between gap-1">
                  <span>Wage</span>
                  <span className="text-slate-200">{wage}</span>
                </div>
                <div className="flex justify-between gap-1">
                  <span>COL</span>
                  <span className="text-slate-200">{col}</span>
                </div>
                <div className="flex justify-between gap-1">
                  <span>Tech %</span>
                  <span className="text-slate-200">{tech}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        Approximate regional figures aligned with Minnesota DEED OEWS and cost-of-living data for storytelling. Boundaries are simplified for the map — not official legal borders.
      </p>
    </div>
  );
}
