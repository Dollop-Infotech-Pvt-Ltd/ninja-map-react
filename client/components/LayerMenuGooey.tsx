import React, { useState } from 'react';
import { Layers, X, Map as MapIcon, Satellite } from 'lucide-react';

export default function LayerMenuGooey({ layers, current, onSelect }: { layers: { id: string; name: string; icon?: any; preview?: any }[]; current: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  const items = layers;

  // sizing and padding
  const toggleSize = 48; // px
  const itemSize = 48; // px (w-12 -> 48)
  const padding = 8; // inner padding so circle doesn't touch container edge
  const defaultRadius = 70; // desired radius
  const minGap = 15; // min gap between item edges

  // compute required radius to avoid overlap along a quarter-circle arc (90deg)
  const itemCount = items.length;
  const span = Math.PI / 2; // 90 degrees
  const deltaTheta = itemCount > 1 ? span / (itemCount - 1) : span;
  // required radius so that arc length between centers >= itemSize + minGap
  const requiredRadiusArc = (itemSize + minGap) / deltaTheta;
  // required radius so first item doesn't overlap toggle
  const requiredRadiusToggle = toggleSize / 2 + itemSize / 2 + minGap;
  const radius = Math.max(defaultRadius, requiredRadiusArc, requiredRadiusToggle);

  // container size must allow expanding to the right and up from the toggle
  const containerWidth = padding + toggleSize + radius + padding;
  const containerHeight = padding + radius + toggleSize + padding;

  // center of the circle sits at the toggle center (bottom-left inside container)
  const centerX = padding + toggleSize / 2;
  const centerY = containerHeight - padding - toggleSize / 2;

  const renderSVG = (id: string) => {
    switch (id) {
      case 'satellite':
        return (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#0f172a" />
            <circle cx="8" cy="8" r="2" fill="#9CA3AF" />
            <rect x="13" y="5" width="6" height="8" rx="1" fill="#6B7280" />
          </svg>
        );
      case 'dark':
        return (
          <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#0b1220" />
            <path d="M3 15h18M3 11h18M3 7h18" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );
      case 'elevated':
        return (
          <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#eef2ff" />
            <path d="M4 16l4-6 4 4 8-10" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#e6eef8" />
            <path d="M3 12h18M3 8h12M3 16h12" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    // allow overflow so radial items won't be clipped; outer wrapper doesn't capture pointer events
    <div className="absolute bottom-4 left-4 z-50 overflow-visible pointer-events-none">
      {/* SVG filters for gooey effect */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {(() => {
        const bgRadius = radius + itemSize / 2 + padding;
        const diameter = bgRadius * 2;
        const left = centerX - bgRadius;
        const top = centerY - bgRadius;
        return (
          <div
            aria-hidden
            className={`absolute rounded-full pointer-events-none transition-all duration-300 ease-out shadow-2xl border ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
            style={{
              left,
              top,
              width: diameter,
              height: diameter,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          />
        );
      })()}

      <div style={{ width: containerWidth, height: containerHeight, filter: 'url(#goo)', position: 'relative', pointerEvents: 'auto' }}>
        {/* quarter-circle: items spread from up (-90deg) to right (0deg) anchored at toggle (bottom-left) */}
        {items.map((item, i) => {
          const itemCount = items.length;
          const startAngle = -Math.PI / 2; // -90deg (up)
          const endAngle = 0; // 0deg (right)
          const angle = itemCount > 1 ? startAngle + (i * (endAngle - startAngle) / (itemCount - 1)) : (startAngle + endAngle) / 2;
          const x = centerX + Math.cos(angle) * (open ? radius : 0) - (itemSize / 2);
          const y = centerY + Math.sin(angle) * (open ? radius : 0) - (itemSize / 2);
          const isSelected = current === item.id;

          return (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); setOpen(false); }}
              title={item.name}
              className={`absolute w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-sm text-foreground transition-all duration-300 ease-out ${isSelected ? 'ring-2 ring-primary/60 shadow-lg' : 'bg-card/80 border border-black/80'}`}
              style={{ left: x, top: y, transform: `scale(${open ? 1 : 0.01})`, transformOrigin: 'center' }}
            >
              {/* thumbnail preview */}
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                {item.preview ? (
                  typeof item.preview === 'string' ? (
                    <img src={item.preview} alt={`${item.name} preview`} className="w-full h-full object-cover" onError={(e)=>{(e.target as HTMLImageElement).src='/placeholder.svg'}} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.preview}
                    </div>
                  )
                ) : (
                  renderSVG(item.id)
                )}
              </div>
            </button>
          );
        })}

        {/* Central toggle positioned at the bottom-left inside container */}
        <button
          onClick={() => setOpen((s) => !s)}
          className="absolute w-12 h-12 rounded-full flex items-center justify-center bg-popover/95 border shadow-md backdrop-blur-sm transition-transform"
          style={{ left: padding, top: containerHeight - padding - toggleSize }}
          title="Layers"
        >
          {open ? <X className="h-7 w-7 p-[5px]" /> : <Layers className="h-7 w-7 p-[5px]" />}
        </button>
      </div>
    </div>
  );
}
