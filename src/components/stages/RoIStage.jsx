import React, { useState, useEffect } from 'react';
import "../../styles/Stage.css";

export function RoIStage() {
  const proposals = [
    { id: 1, x: 6, y: 37, w: 28, h: 33, color: '#3B82F6', rgba: '59, 130, 246' },
    { id: 2, x: 45, y: 40, w: 32, h: 35, color: '#8B5CF6', rgba: '139, 92, 246' }
  ];

  const [activeProposal, setActiveProposal] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const zoomTimer = setTimeout(() => setStep(1), 400);
    const gridTimer = setTimeout(() => setStep(2), 1600);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(gridTimer);
    };
  }, [activeProposal]);

  const p = proposals[activeProposal];

  const ZOOMED_SIZE = 260;

  // The cropped image is square now, matching RPNStage
  const IMG_ASPECT = 1;

  const scaleX = ZOOMED_SIZE / p.w;
  const cropWidthPx = 100 * scaleX;
  const cropHeightPx = cropWidthPx / IMG_ASPECT;
  const scaleYCorr = cropHeightPx / 100;

  const cropLeft = -(p.x * scaleX);
  const cropTop = -(p.y * scaleYCorr);

  return (
    <div className="stage-visualization roi-viz">
      <div className="viz-card">
        <div className="viz-label">1. Click a Proposal</div>
        <div className="viz-placeholder roi-source relative overflow-hidden">
          {/* LEFT PANEL - exactly matching RPNStage to prevent flex collapse */}
          <img
            src="/images/street.jpg"
            alt="Proposals"
            className="stage-input-image small w-full h-full object-cover"
            draggable={false}
          />
          {/* SVG Overlay set to precisely cover the padding box's content area */}
          <svg
            className="absolute"
            style={{ inset: '0.75rem', zIndex: 10, width: 'calc(100% - 1.5rem)', height: 'calc(100% - 1.5rem)' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {proposals.map((prop, idx) => (
              <g
                key={prop.id}
                opacity={activeProposal === idx ? 1 : 0.4}
                onClick={() => setActiveProposal(idx)}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                className="transition-opacity duration-300"
              >
                <rect
                  x={prop.x} y={prop.y}
                  width={prop.w} height={prop.h}
                  fill={activeProposal === idx ? `rgba(${prop.rgba},0.2)` : '#ffffff'}
                  fillOpacity={activeProposal === idx ? 1 : 0}
                  stroke={prop.color}
                  strokeWidth={activeProposal === idx ? 2 : 1}
                  rx="0.5"
                />
                <rect x={prop.x + 1} y={prop.y - 5} width="12" height="5" fill={prop.color} rx="0.5" />
                <text x={prop.x + 2.5} y={prop.y - 1.5} fontSize="3.5" fill="white" fontWeight="bold">P{prop.id}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="viz-arrow">→</div>

      <div className="viz-card" style={{ flex: 1.5 }}>
        <div className="viz-label">Magnifying Glass Overlay</div>
        <div className="viz-placeholder roi-pooling-demo p-4 flex flex-col items-center justify-center relative overflow-hidden" style={{ minHeight: '360px' }}>

          {/* Use scale transform on the whole container for smooth animation */}
          <div
            className="relative border-4 rounded-lg shadow-2xl bg-gray-900 overflow-hidden"
            style={{
              borderColor: p.color,
              width: `${ZOOMED_SIZE}px`,
              height: `${ZOOMED_SIZE}px`,
              transform: step >= 1
                ? 'translateY(-10px) scale(1)'
                : 'translateY(10px) scale(0.3)',
              transition: 'transform 1200ms cubic-bezier(0.34, 1.56, 0.64, 1), border-color 300ms ease',
              transformOrigin: 'center center',
            }}
          >
            {/* 
              CRITICAL FIX: Use absolute positioning with calculated pixel values
              instead of CSS transform percentages to ensure precise alignment
            */}
            <img
              src="/images/street.jpg"
              alt="Crop mapping"
              draggable={false}
              style={{
                position: 'absolute',
                width: `${cropWidthPx}px`,
                height: `${cropHeightPx}px`,
                left: `${cropLeft}px`,
                top: `${cropTop}px`,
                objectFit: 'fill', // Must match source image
              }}
            />

            {/* Grid overlay */}
            <div
              className={`absolute inset-0 w-full h-full grid grid-cols-7 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}
              style={{
                gridTemplateRows: 'repeat(7, 1fr)',
                transform: step >= 2 ? 'scale(1) translateY(0)' : 'scale(1.1) translateY(-30px)',
                backgroundColor: `rgba(${p.rgba}, 0.15)`,
                transition: 'all 800ms ease-out',
              }}
            >
              {Array.from({ length: 49 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    backgroundColor: `rgba(${p.rgba}, 0.08)`
                  }}
                />
              ))}
            </div>
          </div>

          <div
            className="viz-info-box mt-6 bg-gray-50/50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 transition-all duration-500 text-center w-[90%] shadow-sm"
            style={{
              borderLeftWidth: '4px',
              borderLeftColor: p.color,
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {step < 2
              ? <span>Click a proposal on the left to zoom in.</span>
              : <span><strong>Step 1:</strong> Divide the proposal into a fixed 7×7 grid.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoIStage;