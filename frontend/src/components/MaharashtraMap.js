/**
 * Stylised outline of Maharashtra with a marker per district we work in.
 *
 * Deliberately simplified rather than survey-accurate: it exists to give the
 * "Where We Work" section a sense of place at a glance, not to be read as a
 * reference map. Markers are positioned by hand against this outline, so a
 * district with no entry here still lists in the text column beside it.
 */

// Rough positions within the 0-400 x 0-300 viewBox.
const DISTRICT_POINTS = {
  dharashiv: { x: 196, y: 178 },
  osmanabad: { x: 196, y: 178 },
  solapur: { x: 214, y: 205 },
  latur: { x: 232, y: 172 },
  palghar: { x: 74, y: 108 },
  panchgani: { x: 128, y: 200 },
  satara: { x: 132, y: 205 },
  pune: { x: 140, y: 172 },
  mumbai: { x: 84, y: 132 },
  nagpur: { x: 300, y: 120 },
  nashik: { x: 118, y: 130 },
  aurangabad: { x: 176, y: 140 }
};

const normalise = (value = '') => value.toString().trim().toLowerCase();

const MaharashtraMap = ({ locations = [], className = '' }) => {
  const markers = locations
    .map((location) => {
      const key = normalise(location?.name);
      const point = DISTRICT_POINTS[key];
      return point ? { name: location.name, ...point } : null;
    })
    .filter(Boolean);

  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label={
        markers.length > 0
          ? `Map of Maharashtra marking ${markers.map((m) => m.name).join(', ')}`
          : 'Map of Maharashtra'
      }
      data-testid="maharashtra-map"
    >
      <path
        d="M62 96 L96 76 L138 70 L176 78 L210 68 L248 74 L286 66 L322 78 L352 96
           L364 124 L352 152 L330 168 L318 196 L292 214 L262 220 L232 236 L200 244
           L168 236 L142 220 L120 226 L98 210 L84 184 L70 158 L58 130 Z"
        fill="var(--accent-teal)"
        fillOpacity="0.16"
        stroke="var(--accent-teal)"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {markers.map((marker) => (
        <g key={marker.name} transform={`translate(${marker.x} ${marker.y})`}>
          {/* Teardrop pin, drawn from its tip so the point sits on the coordinate. */}
          <path
            d="M0 0 C-9 -11 -13 -17 -13 -23 A13 13 0 1 1 13 -23 C13 -17 9 -11 0 0 Z"
            fill="var(--accent-teal)"
          />
          <circle cx="0" cy="-23" r="4.5" fill="#FFFFFF" />
        </g>
      ))}
    </svg>
  );
};

export default MaharashtraMap;
