import React, { useState, useEffect, useRef } from "react";
import "../../styles/Stage.css";

// ─── Architecture constants ──────────────────────────────────────────────────
const SZ = 8;   // 8×8 spatial resolution of the final feature map (stride-64 of a 512px image)
const PX = 7;   // pixels per cell in canvas

// Each conv stage halves spatial resolution, doubling receptive field
const CONV_STAGES = [
  { label: "Conv1 (stride 4)",  desc: "Low-level: edges & colours",    receptiveFieldFrac: 1 / SZ },
  { label: "Conv2 (stride 8)",  desc: "Mid-level: corners & textures", receptiveFieldFrac: 2 / SZ },
  { label: "Conv3 (stride 16)", desc: "High-level: parts & shapes",    receptiveFieldFrac: 4 / SZ },
  { label: "Feature Map",       desc: "Semantic: objects & context",   receptiveFieldFrac: 0.45 },
];

// Approximate bounding-boxes of objects in the street.jpg scene (normalised 0-1)
const OBJECTS = [
  { label: "Car (foreground)", x: 0.38, y: 0.48, w: 0.42, h: 0.44, strength: 1.0 },
  { label: "Car (background)", x: 0.03, y: 0.29, w: 0.26, h: 0.36, strength: 0.82 },
  { label: "Road surface",     x: 0.00, y: 0.72, w: 1.00, h: 0.28, strength: 0.30 },
];

// 16 channels with meaningful names grouped by what they detect
const CHANNEL_META = [
  { name: "Horizontal edges",    group: "Edges"    },
  { name: "Vertical edges",      group: "Edges"    },
  { name: "Diagonal edges (45°)",group: "Edges"    },
  { name: "Diagonal edges (−45°)",group: "Edges"   },
  { name: "Dark blobs",          group: "Texture"  },
  { name: "Light blobs",         group: "Texture"  },
  { name: "Fine texture",        group: "Texture"  },
  { name: "Colour gradient",     group: "Colour"   },
  { name: "Warm hues",           group: "Colour"   },
  { name: "Cool hues",           group: "Colour"   },
  { name: "Wheel-like circles",  group: "Shape"    },
  { name: "Rectangular shapes",  group: "Shape"    },
  { name: "Glass/reflection",    group: "Material" },
  { name: "Metal surface",       group: "Material" },
  { name: "Car detector",        group: "Semantic" },
  { name: "Road detector",       group: "Semantic" },
];

const GROUP_COLORS = {
  Edges:    [59,  130, 246],
  Texture:  [139, 92,  246],
  Colour:   [236, 72,  153],
  Shape:    [34,  197, 94 ],
  Material: [251, 146, 60 ],
  Semantic: [239, 68,  68 ],
};

// ─── Deterministic PRNG ───────────────────────────────────────────────────────
function prng(seed) {
  let s = (seed >>> 0) + 1;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function gauss(dx, dy, sigma = 1) {
  return Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
}

// ─── Build activation map ─────────────────────────────────────────────────────
// chIdx        → which of 16 channels
// hoverCell    → {col, row} or null
// stageIdx     → 0-3 (how far through the conv pipeline we are)
function buildActivationMap(chIdx, hoverCell, stageIdx = 3) {
  const meta = CHANNEL_META[chIdx];
  const isSemanticCar  = meta.group === "Semantic" && chIdx === 14;
  const isSemanticRoad = meta.group === "Semantic" && chIdx === 15;
  const isMid          = meta.group === "Shape" || meta.group === "Material";
  const isLow          = meta.group === "Edges" || meta.group === "Texture" || meta.group === "Colour";

  const r = prng(chIdx * 73856093 + stageIdx * 9999);
  const bgLevel  = 0.03 + r() * 0.06;
  const noiseMag = 0.03 + r() * 0.05;
  const carSens  = isSemanticCar ? 1.10
    : isSemanticRoad ? 0.10
    : isMid ? 0.80 + r() * 0.20
    : isLow  ? 0.60 + r() * 0.25
    :          0.65 + r() * 0.20;
  const roadSens = isSemanticRoad ? 0.80 : 0.05 + r() * 0.10;

  // Stage boosts activations — early layers still visible, later = stronger semantic signal
  const stageFactor = 0.65 + stageIdx * 0.12;

  const map = [];
  for (let row = 0; row < SZ; row++) {
    for (let col = 0; col < SZ; col++) {
      const nx = (col + 0.5) / SZ;
      const ny = (row + 0.5) / SZ;
      const nr = prng(chIdx * 1000 + row * 100 + col + stageIdx * 50000);
      let val = bgLevel + nr() * noiseMag;

      // Car Gaussian hotspots
      OBJECTS.filter(o => o.label.startsWith("Car")).forEach(obj => {
        const cx = obj.x + obj.w / 2;
        const cy = obj.y + obj.h / 2;
        const dx = (nx - cx) / (obj.w * 0.5);
        const dy = (ny - cy) / (obj.h * 0.5);
        val += gauss(dx, dy, 1.0) * obj.strength * carSens;
      });

      // Road activation (bottom strip)
      const road = OBJECTS[2];
      if (ny >= road.y) {
        val += (1 - (ny - road.y) / road.h) * roadSens * road.strength;
      }

      val *= stageFactor;

      // Hover receptive field boost
      if (hoverCell && hoverCell.col >= 0) {
        const rfFrac = CONV_STAGES[stageIdx].receptiveFieldFrac;
        const hx = (hoverCell.col + 0.5) / SZ;
        const hy = (hoverCell.row + 0.5) / SZ;
        const dist = Math.sqrt((nx - hx) ** 2 + (ny - hy) ** 2);
        const isCarHover = OBJECTS.some(o =>
          hx >= o.x && hx <= o.x + o.w && hy >= o.y && hy <= o.y + o.h
        );
        if (dist < rfFrac * 1.5) {
          val += Math.max(0, 1 - dist / (rfFrac * 1.5)) * (isCarHover ? 0.45 : 0.12);
        }
      }

      map.push(Math.min(1, Math.max(0, val)));
    }
  }
  return map;
}

// ─── Canvas renderer ──────────────────────────────────────────────────────────
function drawChannel(canvas, chIdx, hoverCell, stageIdx) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const map = buildActivationMap(chIdx, hoverCell, stageIdx);
  const group = CHANNEL_META[chIdx].group;
  const [r, g, b] = GROUP_COLORS[group];

  for (let row = 0; row < SZ; row++) {
    for (let col = 0; col < SZ; col++) {
      const v = map[row * SZ + col];
      ctx.fillStyle = `rgba(${r},${g},${b},${v.toFixed(3)})`;
      ctx.fillRect(col * PX, row * PX, PX, PX);
    }
  }
}

// ─── Single channel canvas component ─────────────────────────────────────────
function ChannelCanvas({ chIdx, hoverCol, hoverRow, stageIdx }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const hoverCell =
      hoverCol !== null && hoverRow !== null && hoverCol >= 0
        ? { col: hoverCol, row: hoverRow }
        : null;
    drawChannel(canvasRef.current, chIdx, hoverCell, stageIdx);
  }, [chIdx, hoverCol, hoverRow, stageIdx]);

  const group = CHANNEL_META[chIdx].group;
  const [r, g, b] = GROUP_COLORS[group];
  return (
    <div
      className="feature-map-cell"
      title={`Ch.${chIdx + 1} · ${CHANNEL_META[chIdx].name}`}
      style={{ position: "relative" }}
    >
      <canvas
        ref={canvasRef}
        width={SZ * PX}
        height={SZ * PX}
        style={{
          borderRadius: "3px",
          display: "block",
          outline: `1.5px solid rgba(${r},${g},${b},0.35)`,
        }}
      />
      <div
        className="feature-cell-label"
        style={{ fontSize: "9px", lineHeight: 1.2, marginTop: "2px", opacity: 0.7 }}
      >
        {CHANNEL_META[chIdx].name}
      </div>
    </div>
  );
}

// ─── Stage indicator ──────────────────────────────────────────────────────────
function StageIndicator({ activeStage, onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        flexWrap: "wrap",
        marginBottom: "10px",
        justifyContent: "center",
      }}
    >
      {CONV_STAGES.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          style={{
            padding: "4px 10px",
            fontSize: "11px",
            borderRadius: "20px",
            border: "1px solid",
            cursor: "pointer",
            fontWeight: i === activeStage ? 700 : 400,
            background: i === activeStage ? "#3B82F6" : "transparent",
            borderColor: i === activeStage ? "#3B82F6" : "#555",
            color: i === activeStage ? "#fff" : "#aaa",
            transition: "all 0.15s ease",
          }}
          title={s.desc}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ─── Group legend ─────────────────────────────────────────────────────────────
function GroupLegend() {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: "8px",
        fontSize: "10px",
      }}
    >
      {Object.entries(GROUP_COLORS).map(([group, [r, g, b]]) => (
        <span key={group} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "2px",
              background: `rgb(${r},${g},${b})`,
              display: "inline-block",
            }}
          />
          <span style={{ color: "#aaa" }}>{group}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Receptive field ruler ────────────────────────────────────────────────────
// Shows how the hover window in the input image expands per conv stage
function ReceptiveFieldHint({ stageIdx, hoverCol, hoverRow }) {
  const stage = CONV_STAGES[stageIdx];
  const rfPx = Math.round(stage.receptiveFieldFrac * 512);
  const isVisible = hoverCol >= 0;
  return (
    <div
      style={{
        fontSize: "10px",
        color: "#60A5FA",
        textAlign: "center",
        marginTop: "4px",
        minHeight: "18px",
        visibility: isVisible ? "visible" : "hidden",
      }}
    >
      {isVisible && `Receptive field at this stage ≈ ${rfPx}×${rfPx} px of the original 512×512 image`}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function BackboneStage() {
  const [hoverCol, setHoverCol] = useState(-1);
  const [hoverRow, setHoverRow] = useState(-1);
  const [isHovering, setIsHovering] = useState(false);
  const [scanPos, setScanPos] = useState({ x: 50, y: 50 });
  const [activeStage, setActiveStage] = useState(0); // default: Conv1 — small receptive field

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    setScanPos({ x: nx * 100, y: ny * 100 });
    setHoverCol(Math.floor(nx * SZ));
    setHoverRow(Math.floor(ny * SZ));
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoverCol(-1);
    setHoverRow(-1);
  };

  // Receptive field box size grows with conv stage
  const rfPercent = CONV_STAGES[activeStage].receptiveFieldFrac * 100;

  return (
    <div className="stage-visualization backbone-viz">
      {/* ── Input image ── */}
      <div
        className="viz-card primary-input"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="viz-label">
          Input Image
          <span
            style={{ fontSize: "10px", color: "#888", marginLeft: "6px" }}
          >
            (hover to inspect receptive field)
          </span>
        </div>
        <div className="viz-placeholder feature-map" style={{ position: "relative", overflow: "hidden" }}>
          <img
            src="/images/street.jpg"
            alt="Street scene"
            className="stage-input-image"
          />
          {/* Object annotations */}
          {OBJECTS.filter(o => !o.label.startsWith("Road")).map((obj, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${obj.x * 100}%`,
                top: `${obj.y * 100}%`,
                width: `${obj.w * 100}%`,
                height: `${obj.h * 100}%`,
                border: "1.5px dashed rgba(251,146,60,0.65)",
                boxSizing: "border-box",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  background: "rgba(0,0,0,0.55)",
                  color: "#FCD34D",
                  padding: "0 3px",
                  borderRadius: "2px",
                  whiteSpace: "nowrap",
                }}
              >
                {obj.label}
              </span>
            </div>
          ))}
          {/* Receptive field cursor */}
          {isHovering && (
            <div
              style={{
                position: "absolute",
                left: `${scanPos.x}%`,
                top: `${scanPos.y}%`,
                width: `${rfPercent}%`,
                height: `${rfPercent}%`,
                border: "2px solid #3B82F6",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 14px rgba(59,130,246,0.5)",
                pointerEvents: "none",
                boxSizing: "border-box",
                background: "rgba(59,130,246,0.08)",
              }}
            />
          )}
        </div>
        <div className="viz-meta">512×512 · RGB</div>
      </div>

      <div className="viz-arrow">→</div>

      {/* ── Feature maps ── */}
      <div className="viz-card output" style={{ flex: 1 }}>
        <div className="viz-label">
          Backbone Feature Extraction
          <span style={{ fontSize: "10px", color: "#888", marginLeft: "6px" }}>
            ({CONV_STAGES[activeStage].desc})
          </span>
        </div>

        <StageIndicator activeStage={activeStage} onSelect={setActiveStage} />

        <div className="viz-placeholder feature-grid-enhanced">
          {Array.from({ length: 16 }).map((_, i) => (
            <ChannelCanvas
              key={i}
              chIdx={i}
              hoverCol={hoverCol}
              hoverRow={hoverRow}
              stageIdx={activeStage}
            />
          ))}
        </div>

        <GroupLegend />
        <ReceptiveFieldHint
          stageIdx={activeStage}
          hoverCol={hoverCol}
          hoverRow={hoverRow}
        />

        <div className="viz-meta" style={{ marginTop: "6px" }}>
          {activeStage < 3
            ? `${CONV_STAGES[activeStage].label}: early features, small receptive field`
            : "Final feature map (8×8): each cell encodes a 64×64 px region of the input"}
        </div>
      </div>
    </div>
  );
}

export default BackboneStage;