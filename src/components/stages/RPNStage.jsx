import React, { useState } from 'react';
import "../../styles/Stage.css";

export function RPNStage() {
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoverPos({ x, y });
  };

  // Mock anchor boxes
  const anchors = [
    { w: 20, h: 20, color: '#3B82F6' }, // Small square
    { w: 40, h: 25, color: '#8B5CF6' }, // Medium landscape
    { w: 25, h: 45, color: '#EC4899' }, // Medium portrait
  ];

  return (
    <div className="stage-visualization rpn-viz">
      <div className="viz-card"
           onMouseMove={handleMouseMove}
           onMouseEnter={() => setIsHovering(true)}
           onMouseLeave={() => setIsHovering(false)}>
        <div className="viz-label">Anchor Generator (Hover to see templates)</div>
        <div className="viz-placeholder rpn-input relative overflow-hidden">
          <img src="/images/street.jpg" alt="Feature maps" className="stage-input-image small" />
          <div className="grid-overlay"></div>
          {isHovering && anchors.map((anchor, idx) => (
            <div 
              key={idx}
              className="anchor-box"
              style={{
                position: 'absolute',
                left: `${hoverPos.x}%`,
                top: `${hoverPos.y}%`,
                width: `${anchor.w}%`,
                height: `${anchor.h}%`,
                border: `1.5px dashed ${anchor.color}`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                opacity: 0.8
              }}
            />
          ))}
          {isHovering && (
            <div 
              style={{
                position: 'absolute',
                left: `${hoverPos.x}%`,
                top: `${hoverPos.y}%`,
                width: '6px',
                height: '6px',
                background: 'white',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 5px rgba(0,0,0,0.5)'
              }}
            />
          )}
        </div>
        <div className="viz-meta">9 anchors per sliding window position</div>
      </div>

      <div className="viz-arrow">→</div>

      <div className="viz-card">
        <div className="viz-label">Objectness Scores (Proposals)</div>
        <div className="viz-placeholder rpn-proposals">
          <img src="/images/street.jpg" alt="Proposals on image" className="stage-input-image small" />
          <svg className="proposal-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect x="8" y="37" width="28" height="33" fill="none" stroke="#3B82F6" strokeWidth="1.5" />
            <rect x="10" y="33" width="24" height="4" fill="#3B82F6" />
            <text x="12" y="36" fontSize="3" fill="white" fontWeight="bold">0.92</text>
            
            <rect x="50" y="40" width="32" height="35" fill="none" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.8" />
            <rect x="52" y="36" width="28" height="4" fill="#8B5CF6" opacity="0.8" />
            <text x="54" y="39" fontSize="3" fill="white" fontWeight="bold">0.76</text>
            
            <rect x="25" y="15" width="30" height="22" fill="none" stroke="#EC4899" strokeWidth="1.5" opacity="0.6" />
            <rect x="27" y="11" width="26" height="4" fill="#EC4899" opacity="0.6" />
            <text x="29" y="14" fontSize="3" fill="white" fontWeight="bold">0.48</text>
          </svg>
        </div>
        <div className="viz-meta">Binary Class: Is Object / Is Background</div>
      </div>
    </div>
  );
}

export default RPNStage;
