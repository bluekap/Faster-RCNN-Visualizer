import React, { useState } from 'react';
import "../../styles/Stage.css";

export function BackboneStage() {
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoverPos({ x, y });
  };

  const generateFeaturePattern = (channelIdx) => {
    const patterns = [
      { name: 'Edges', color: 'rgba(59, 130, 246, 0.7)' },
      { name: 'Textures', color: 'rgba(139, 92, 246, 0.7)' },
      { name: 'Shapes', color: 'rgba(236, 72, 153, 0.7)' },
      { name: 'Colors', color: 'rgba(34, 197, 94, 0.7)' },
    ];
    return patterns[channelIdx % patterns.length];
  };

  return (
    <div className="stage-visualization backbone-viz">
      <div className="viz-card primary-input" 
           onMouseMove={handleMouseMove}
           onMouseEnter={() => setIsHovering(true)}
           onMouseLeave={() => setIsHovering(false)}>
        <div className="viz-label">Input Image (Scan to see activations)</div>
        <div className="viz-placeholder feature-map relative overflow-hidden">
          <img src="/images/street.jpg" alt="Street scene" className="stage-input-image" />
          {isHovering && (
            <div 
              className="scan-window"
              style={{
                left: `${hoverPos.x}%`,
                top: `${hoverPos.y}%`,
                width: '40px',
                height: '40px',
                border: '2px solid #3B82F6',
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
                pointerEvents: 'none'
              }}
            />
          )}
        </div>
        <div className="viz-meta">512×512 Input</div>
      </div>

      <div className="viz-arrow">→</div>

      <div className="viz-card output">
        <div className="viz-label">Feature Map Activations</div>
        <div className="viz-placeholder feature-grid-enhanced">
          {Array.from({ length: 16 }).map((_, i) => {
            const pattern = generateFeaturePattern(i);
            const intensity = isHovering 
              ? 0.3 + Math.sin((hoverPos.x * (i+1) + hoverPos.y * (16-i)) * 0.1) * 0.4 + 0.3
              : 0.7;
            
            return (
              <div key={i} className="feature-map-cell" title={`Channel ${i + 1}`}>
                <div 
                  className="feature-cell-visual transition-all duration-200"
                  style={{
                    background: pattern.color.replace('0.7', intensity.toFixed(2)),
                    boxShadow: `inset 0 0 8px ${pattern.color.replace('0.7', '0.4')}`,
                    transform: isHovering ? `scale(${0.9 + intensity * 0.2})` : 'scale(1)'
                  }}
                />
                <div className="feature-cell-label">Ch. {i + 1}</div>
              </div>
            );
          })}
        </div>
        <div className="viz-meta">Features react to scan position</div>
      </div>
    </div>
  );
}

export default BackboneStage;
