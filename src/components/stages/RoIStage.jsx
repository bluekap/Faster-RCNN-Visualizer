import React, { useState, useEffect } from 'react';
import "../../styles/Stage.css";

export function RoIStage() {
  const [activeProposal, setActiveProposal] = useState(0);

  // Cycle through proposals for the animation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveProposal((prev) => (prev + 1) % 2);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const proposals = [
    { id: 1, x: 8, y: 37, w: 28, h: 33, color: '#3B82F6' },
    { id: 2, x: 50, y: 40, w: 32, h: 35, color: '#8B5CF6' }
  ];

  return (
    <div className="stage-visualization roi-viz">
      <div className="viz-card">
        <div className="viz-label">Regional Proposals (Filtered)</div>
        <div className="viz-placeholder roi-source">
          <img src="/images/street.jpg" alt="Proposals" className="stage-input-image small" />
          <svg className="roi-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            {proposals.map((p, idx) => (
              <g key={p.id} opacity={activeProposal === idx ? 1 : 0.4}>
                <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="none" stroke={p.color} strokeWidth={activeProposal === idx ? 2 : 1} />
                <rect x={p.x + 1} y={p.y - 4} width="10" height="4" fill={p.color} />
                <text x={p.x + 2} y={p.y - 1} fontSize="3" fill="white" fontWeight="bold">{p.id}</text>
              </g>
            ))}
          </svg>
        </div>
        <div className="viz-meta">Non-Max Suppression (NMS) applied</div>
      </div>

      <div className="viz-arrow">→</div>

      <div className="viz-card">
        <div className="viz-label">RoI Pooling: Fixed Output</div>
        <div className="viz-placeholder roi-pooling-demo">
          <div className="roi-pool-item flex flex-col items-center">
            <div className="flex items-center gap-4 mb-2">
               <div className="roi-pool-input border-2 border-dashed rounded overflow-hidden" 
                    style={{ borderColor: proposals[activeProposal].color }}>
                <div className="roi-pool-label-small bg-gray-800 text-white text-[8px] px-1">Proposal {proposals[activeProposal].id}</div>
                <div className="w-16 h-16 bg-gray-900 flex items-center justify-center overflow-hidden">
                   <img 
                    src="/images/street.jpg" 
                    alt="Proposal crop" 
                    className="max-w-none transition-all duration-500"
                    style={{
                      width: '400%',
                      transform: `translate(${-proposals[activeProposal].x * 1}% , ${-proposals[activeProposal].y * 1}%)`
                    }}
                   />
                </div>
              </div>
              <div className="roi-pool-arrow text-xl">→</div>
              <div className="roi-pool-grid grid grid-cols-7 border border-gray-700">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="roi-cell w-3 h-3 transition-colors duration-500"
                    style={{
                      background: proposals[activeProposal].color.replace(')', `, ${0.2 + Math.random() * 0.8})`).replace('rgb', 'rgba')
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="viz-meta">Any shape → Fixed 7×7 tensor</div>
          </div>
        </div>
        <div className="viz-meta">Bilinear interpolation for sub-pixel accuracy</div>
      </div>
    </div>
  );
}

export default RoIStage;
