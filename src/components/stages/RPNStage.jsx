import React, { useState, useEffect } from 'react';
import "../../styles/Stage.css";

export function RPNStage() {
  const [hoverPos, setHoverPos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [snapPhase, setSnapPhase] = useState(0); // 0 = at cursor, 1 = stretched to car

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoverPos({ x, y });
  };

  // Mock objectness score function based on mouse position
  const getObjectnessScore = (x, y) => {
    // Approximate centers of cars in the image
    const d1 = Math.sqrt(Math.pow(x - 22, 2) + Math.pow(y - 53, 2));
    const d2 = Math.sqrt(Math.pow(x - 66, 2) + Math.pow(y - 57, 2));
    
    // Gaussian peaks for high objectness
    const score1 = Math.exp(-Math.pow(d1, 2) / 250);
    const score2 = Math.exp(-Math.pow(d2, 2) / 300);
    
    // Background noise for asphalt, etc.
    const noise = Math.abs(Math.sin(x * 0.5) * Math.cos(y * 0.5)) * 0.05;
    
    return Math.min(0.99, Math.max(0.01, score1 + score2 + 0.05 + noise));
  };

  const currentScore = getObjectnessScore(hoverPos.x, hoverPos.y);

  // Target car for ghost box regression
  const d1 = Math.sqrt(Math.pow(hoverPos.x - 22, 2) + Math.pow(hoverPos.y - 53, 2));
  const d2 = Math.sqrt(Math.pow(hoverPos.x - 66, 2) + Math.pow(hoverPos.y - 57, 2));
  const targetCar = d1 < d2 
    ? { x: 22, y: 53.5, w: 28, h: 33 } 
    : { x: 66, y: 57.5, w: 32, h: 35 };

  const dx = (targetCar.x - hoverPos.x).toFixed(1);
  const dy = (targetCar.y - hoverPos.y).toFixed(1);
  const dw = (targetCar.w - 40).toFixed(1); // relative to purple landscape anchor
  const dh = (targetCar.h - 25).toFixed(1);

  // Toggle snap animation if score is high
  useEffect(() => {
    if (currentScore > 0.6) {
      const interval = setInterval(() => {
        setSnapPhase((prev) => (prev === 0 ? 1 : 0));
      }, 1000); // Toggle every second
      return () => clearInterval(interval);
    } else {
      setSnapPhase(0);
    }
  }, [currentScore]);

  const getGlowColor = (score) => {
    if (score > 0.7) return `rgba(239, 68, 68, ${score})`; // Red for high objectness
    if (score > 0.4) return `rgba(245, 158, 11, ${score})`; // Orange/Yellow
    return `rgba(59, 130, 246, ${score * 0.4})`; // Dim Blue for asphalt/background
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
        <div className="viz-label">Anchor Generator (Slide cursor to test)</div>
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
          
          {/* Ghost Box Regression Animation */}
          {isHovering && currentScore > 0.6 && (
            <div
              style={{
                position: 'absolute',
                left: `${snapPhase === 0 ? hoverPos.x : targetCar.x}%`,
                top: `${snapPhase === 0 ? hoverPos.y : targetCar.y}%`,
                width: `${snapPhase === 0 ? 40 : targetCar.w}%`,
                height: `${snapPhase === 0 ? 25 : targetCar.h}%`,
                border: `2px ${snapPhase === 0 ? 'solid' : 'dashed'} ${snapPhase === 0 ? '#8B5CF6' : '#10B981'}`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: 20
              }}
            >
              {snapPhase === 1 && (
                <div style={{
                  position: 'absolute',
                  top: '-26px', left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#10B981', color: 'white',
                  fontSize: '10px', padding: '3px 6px', borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  pointerEvents: 'none',
                  zIndex: 25
                }}>
                  Adjusting: Δx:{dx} Δy:{dy} Δw:{dw} Δh:{dh}
                </div>
              )}
            </div>
          )}

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
                boxShadow: '0 0 5px rgba(0,0,0,0.5)',
                zIndex: 30
              }}
            />
          )}
        </div>
        <div className="viz-meta">9 anchors per sliding window position</div>
      </div>

      <div className="viz-arrow">→</div>

      <div className="viz-card">
        <div className="viz-label">Live Objectness Heatmap</div>
        <div className="viz-placeholder rpn-proposals" style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#111' }}>
          <img 
            src="/images/street.jpg" 
            alt="Proposals on image" 
            className="stage-input-image small" 
            style={{ opacity: 0.25, filter: 'grayscale(80%)' }} 
          />
          {isHovering && (
            <>
              {/* Heatmap Spotlight Glow */}
              <div 
                style={{
                  position: 'absolute',
                  left: `${hoverPos.x}%`,
                  top: `${hoverPos.y}%`,
                  width: '180px',
                  height: '180px',
                  background: `radial-gradient(circle, ${getGlowColor(currentScore)} 0%, transparent 60%)`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  mixBlendMode: 'screen',
                  transition: 'background 0.1s ease-out'
                }}
              />
              
              {/* Score Indicator Tooltip */}
              <div 
                style={{
                  position: 'absolute',
                  left: `${hoverPos.x}%`,
                  top: `calc(${hoverPos.y}% - 40px)`,
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.85)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                  border: `1px solid ${getGlowColor(currentScore).replace(/[^,]+(?=\))/, '1')}`, // Make border solid matching color
                  zIndex: 10
                }}
              >
                Objectness: {currentScore.toFixed(2)}
              </div>
            </>
          )}
        </div>
        <div className="viz-meta" style={{ marginTop: '0.4rem', fontWeight: '500' }}>
          <strong>The Lesson:</strong> RPN is a binary classifier running at every single pixel.
        </div>
      </div>
    </div>
  );
}

export default RPNStage;
