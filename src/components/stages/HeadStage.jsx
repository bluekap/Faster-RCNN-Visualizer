import React, { useState, useEffect } from 'react';
import "../../styles/Stage.css";

export function HeadStage() {
  const [step, setStep] = useState(1);
  const confidenceThreshold = 0.5;

  // Automated loop: advance every 2.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => s >= 4 ? 1 : s + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const proposals = [
    { id: 1, raw: { x: 5, y: 35, w: 32, h: 36 }, refined: { x: 8, y: 37, w: 28, h: 33 }, label: 'Car', score: 0.88, color: '#10B981' },
    { id: 2, raw: { x: 44, y: 28, w: 42, h: 52 }, refined: { x: 50, y: 40, w: 32, h: 35 }, label: 'Car', score: 0.92, color: '#10B981' },
    { id: 3, raw: { x: 74, y: 15, w: 20, h: 20 }, refined: { x: 76, y: 16, w: 18, h: 18 }, label: 'Bg', score: 0.15, color: '#EF4444' },
  ];

  // Diagram node geometry (SVG viewBox 0 0 680 210)
  const pooled = { x: 20, y: 80, w: 110, h: 50 };
  const fc = { x: 195, y: 80, w: 100, h: 50 };
  const cls = { x: 390, y: 20, w: 150, h: 46 };
  const reg = { x: 390, y: 144, w: 150, h: 46 };

  const fcRight = fc.x + fc.w;
  const midY = fc.y + fc.h / 2;
  const branchX = fcRight + 28;
  const clsMidY = cls.y + cls.h / 2;
  const regMidY = reg.y + reg.h / 2;

  const fcLit = step >= 2;
  const clsLit = step >= 2;
  const regLit = step >= 3;
  const thLit = step >= 4;

  const lineColor = (lit) => lit ? '#6366f1' : '#334155';

  return (
    <div className="stage-visualization head-viz">

      {/* ── LEFT: Architecture diagram ── */}
      <div className="viz-card" style={{ flex: 1.3, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div className="viz-label">Architecture: Two-Head Split</div>
        <div style={{
          flex: 1, background: '#0f172a', borderRadius: 10, border: '1px solid #1e293b',
          padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 300,
        }}>

          {/* SVG Network Diagram */}
          <svg viewBox="0 0 680 210" style={{ width: '100%', flex: 1 }}>
            <defs>
              <filter id="glow-cls"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="glow-reg"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            {/* ── Connector lines ── */}
            {/* Pooled → FC */}
            <line x1={pooled.x + pooled.w} y1={midY} x2={fc.x} y2={midY} stroke="#475569" strokeWidth="2" />
            {/* FC → branch */}
            <line x1={fcRight} y1={midY} x2={branchX} y2={midY} stroke={lineColor(fcLit)} strokeWidth="2" style={{ transition: 'stroke 0.4s' }} />
            {/* branch vertical spine */}
            <line x1={branchX} y1={clsMidY} x2={branchX} y2={regMidY} stroke={lineColor(fcLit)} strokeWidth="2" style={{ transition: 'stroke 0.4s' }} />
            {/* branch → cls */}
            <line x1={branchX} y1={clsMidY} x2={cls.x} y2={clsMidY} stroke={clsLit ? '#34d399' : '#334155'} strokeWidth="2" style={{ transition: 'stroke 0.4s' }} />
            {/* branch → reg */}
            <line x1={branchX} y1={regMidY} x2={reg.x} y2={regMidY} stroke={regLit ? '#fbbf24' : '#334155'} strokeWidth="2" style={{ transition: 'stroke 0.4s' }} />

            {/* ── Pooled Features ── */}
            <rect x={pooled.x} y={pooled.y} width={pooled.w} height={pooled.h} rx="7" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
            <text x={pooled.x + pooled.w / 2} y={pooled.y + 19} textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">Pooled</text>
            <text x={pooled.x + pooled.w / 2} y={pooled.y + 34} textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">Features</text>

            {/* ── FC Layers ── */}
            <rect x={fc.x} y={fc.y} width={fc.w} height={fc.h} rx="7"
              fill={fcLit ? '#1e1b4b' : '#1e293b'} stroke={fcLit ? '#818cf8' : '#334155'} strokeWidth="1.5"
              style={{ transition: 'fill 0.4s, stroke 0.4s' }} />
            <text x={fc.x + fc.w / 2} y={fc.y + 19} textAnchor="middle" fill={fcLit ? '#a5b4fc' : '#64748b'} fontSize="11" fontWeight="700" style={{ transition: 'fill 0.4s' }}>FC</text>
            <text x={fc.x + fc.w / 2} y={fc.y + 34} textAnchor="middle" fill={fcLit ? '#a5b4fc' : '#64748b'} fontSize="11" fontWeight="700" style={{ transition: 'fill 0.4s' }}>Layers</text>

            {/* ── Softmax Classifier ── */}
            <rect x={cls.x} y={cls.y} width={cls.w} height={cls.h} rx="7"
              fill={clsLit ? '#064e3b' : '#1e293b'} stroke={clsLit ? '#34d399' : '#334155'} strokeWidth="1.5"
              filter={clsLit ? 'url(#glow-cls)' : undefined}
              style={{ transition: 'fill 0.4s, stroke 0.4s' }} />
            <text x={cls.x + cls.w / 2} y={cls.y + 19} textAnchor="middle" fill={clsLit ? '#6ee7b7' : '#64748b'} fontSize="11" fontWeight="700" style={{ transition: 'fill 0.4s' }}>Softmax</text>
            <text x={cls.x + cls.w / 2} y={cls.y + 34} textAnchor="middle" fill={clsLit ? '#6ee7b7' : '#64748b'} fontSize="11" fontWeight="700" style={{ transition: 'fill 0.4s' }}>Classifier</text>
            {/* Output badge */}
            <g opacity={clsLit ? 1 : 0} style={{ transition: 'opacity 0.4s' }}>
              <rect x={cls.x + cls.w + 6} y={clsMidY - 11} width={80} height={22} rx="5" fill="#064e3b" stroke="#34d399" strokeWidth="1" />
              <text x={cls.x + cls.w + 46} y={clsMidY + 4} textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="800">"Car" 92%</text>
            </g>

            {/* ── BBox Regressor ── */}
            <rect x={reg.x} y={reg.y} width={reg.w} height={reg.h} rx="7"
              fill={regLit ? '#431407' : '#1e293b'} stroke={regLit ? '#fbbf24' : '#334155'} strokeWidth="1.5"
              filter={regLit ? 'url(#glow-reg)' : undefined}
              style={{ transition: 'fill 0.4s, stroke 0.4s' }} />
            <text x={reg.x + reg.w / 2} y={reg.y + 19} textAnchor="middle" fill={regLit ? '#fde68a' : '#64748b'} fontSize="11" fontWeight="700" style={{ transition: 'fill 0.4s' }}>BBox</text>
            <text x={reg.x + reg.w / 2} y={reg.y + 34} textAnchor="middle" fill={regLit ? '#fde68a' : '#64748b'} fontSize="11" fontWeight="700" style={{ transition: 'fill 0.4s' }}>Regressor</text>
            {/* Output badge */}
            <g opacity={regLit ? 1 : 0} style={{ transition: 'opacity 0.4s' }}>
              <rect x={reg.x + reg.w + 6} y={regMidY - 11} width={90} height={22} rx="5" fill="#431407" stroke="#fbbf24" strokeWidth="1" />
              <text x={reg.x + reg.w + 51} y={regMidY + 4} textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="800">(Δx,Δy,Δw,Δh)</text>
            </g>

            {/* step indicator dots */}
            {[1, 2, 3, 4].map(n => (
              <circle key={n} cx={20 + (n - 1) * 16} cy={200} r="5"
                fill={step >= n ? '#6366f1' : '#1e293b'} stroke={step >= n ? '#818cf8' : '#475569'} strokeWidth="1"
                style={{ transition: 'fill 0.4s' }} />
            ))}
          </svg>

          {/* Confidence threshold progress bar */}
          <div style={{ opacity: thLit ? 1 : 0.3, transition: 'opacity 0.5s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span>Confidence Threshold</span><span>50%</span>
            </div>
            <div style={{ height: 5, background: '#1e293b', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '50%', background: '#10b981', borderRadius: 99, boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
            </div>
          </div>

        </div>
      </div>

      <div className="viz-arrow" style={{ alignSelf: 'center' }}>→</div>

      {/* ── RIGHT: Inference result ── */}
      <div className="viz-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="viz-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>Inference Result</span>
          <span style={{ background: '#1e293b', color: '#cbd5e1', padding: '2px 8px', borderRadius: 5, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.08em', border: '1px solid #334155' }}>
            {step === 1 && 'STEP 1 · RAW PROPS'}
            {step === 2 && 'STEP 2 · SCORING'}
            {step === 3 && 'STEP 3 · REFINE'}
            {step === 4 && 'STEP 4 · FILTER'}
          </span>
        </div>

        <div className="viz-placeholder relative overflow-hidden">
          <img src="/images/street.jpg" alt="Detection" className="stage-input-image small w-full h-full object-cover" draggable={false} />
          <svg className="absolute" style={{ inset: '0.75rem', zIndex: 10, width: 'calc(100% - 1.5rem)', height: 'calc(100% - 1.5rem)' }} viewBox="0 0 100 100" preserveAspectRatio="none">
            {proposals.map(p => {
              const box = step >= 3 ? p.refined : p.raw;
              const isOut = step === 4 && p.score < confidenceThreshold;
              const color = step >= 2 ? p.color : '#9ca3af';
              const dash = step >= 3 ? '' : '1.5,1.5';
              const fOp = step >= 3 ? 0.15 : 0;
              return (
                <g key={p.id} style={{ opacity: isOut ? 0 : 1, transition: 'opacity 0.5s' }}>
                  <rect x={box.x} y={box.y} width={box.w} height={box.h}
                    fill={color} fillOpacity={fOp} stroke={color} strokeWidth="1.5"
                    strokeDasharray={dash} rx="0.5"
                    style={{ transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
                  <g style={{ opacity: step >= 2 ? 1 : 0, transition: 'opacity 0.4s' }}>
                    <rect x={box.x} y={box.y - 5} width={Math.max(box.w * 0.7, 18)} height="5"
                      fill={color} rx="0.5"
                      style={{ transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
                    <text x={box.x + 1} y={box.y - 1.5} fontSize="3.5" fill="white" fontWeight="bold"
                      style={{ transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}>
                      {p.label} {(p.score * 100).toFixed(0)}%
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ background: '#1e293b', borderRadius: 8, border: '1px solid #334155', padding: '10px 14px', marginTop: 10, minHeight: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#cbd5e1', textAlign: 'center', fontWeight: 500 }}>
          {step === 1 && 'Start with loose RPN proposals — boxes are rough and over-sized.'}
          {step === 2 && 'Softmax Classifier assigns a class label and confidence to each region.'}
          {step === 3 && 'BBox Regressor snaps boxes tight using learned (Δx, Δy, Δw, Δh) offsets.'}
          {step === 4 && 'Confidence threshold & NMS remove weak or duplicate predictions.'}
        </div>
      </div>

    </div>
  );
}

export default HeadStage;
