import React, { useState } from 'react';
import "../../styles/Stage.css";

export function HeadStage() {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.3);

  const detections = [
    { label: 'Car', score: 0.88, x: 8, y: 37, w: 28, h: 33, color: '#10B981' },
    { label: 'Car', score: 0.92, x: 50, y: 40, w: 32, h: 35, color: '#10B981' },
  ];

  const visibleDetections = detections.filter(d => d.score >= confidenceThreshold);

  return (
    <div className="stage-visualization head-viz">
      <div className="viz-card">
        <div className="viz-label">Inference Controls</div>
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
          <label className="text-xs text-gray-400 mb-2 block">Confidence Threshold: {(confidenceThreshold * 100).toFixed(0)}%</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={confidenceThreshold} 
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="mt-4 space-y-2">
            {detections.map((d, i) => (
              <div key={i} className={`flex justify-between items-center text-[10px] p-1 rounded ${d.score >= confidenceThreshold ? 'bg-emerald-900/30 text-emerald-400' : 'bg-gray-800 text-gray-500 opacity-50'}`}>
                <span>{d.label}</span>
                <span>{(d.score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="viz-arrow">→</div>

      <div className="viz-card">
        <div className="viz-label">Final Predictions</div>
        <div className="viz-placeholder detection-final relative">
          <img src="/images/street.jpg" alt="Detection result" className="stage-input-image small" />
          <svg className="detection-box-overlay absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            {visibleDetections.map((d, i) => (
              <g key={i}>
                <rect x={d.x} y={d.y} width={d.w} height={d.h} fill="none" stroke={d.color} strokeWidth="2" rx="1" />
                <rect x={d.x} y={d.y - 6} width={d.w * 0.6} height="6" fill={d.color} rx="1" />
                <text x={d.x + 2} y={d.y - 2} fontSize="4" fill="white" fontWeight="bold">{d.label} {(d.score * 100).toFixed(0)}%</text>
              </g>
            ))}
          </svg>
          {visibleDetections.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold">
              No detections above threshold
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeadStage;
