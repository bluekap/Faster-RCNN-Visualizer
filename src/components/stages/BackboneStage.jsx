import React, { useState, useEffect, useRef } from "react";
import "../../styles/Stage.css";

// ─── Architecture constants ───────────────────────────────────────────────────
const SZ = 8;  // 8×8 spatial resolution of the final feature map
const PX = 7;  // pixels per cell when drawing on canvas

// Conv stages: each halves spatial resolution and doubles receptive field
const CONV_STAGES = [
  { label: "Conv1 (stride 4)",  desc: "Low-level: edges & colours",    receptiveFieldFrac: 1 / SZ },
  { label: "Conv2 (stride 8)",  desc: "Mid-level: corners & textures", receptiveFieldFrac: 2 / SZ },
  { label: "Conv3 (stride 16)", desc: "High-level: parts & shapes",    receptiveFieldFrac: 4 / SZ },
  { label: "Feature Map",       desc: "Semantic: objects & context",   receptiveFieldFrac: 0.45  },
];

// Objects in street.jpg (normalised 0–1 coords)
const OBJECTS = [
  // Cars — highest activation
  { label: "Car (foreground)", x: 0.46, y: 0.48, w: 0.38, h: 0.40, strength: 1.00 },
  { label: "Car (background)", x: 0.03, y: 0.29, w: 0.26, h: 0.36, strength: 0.82 },

  // Other vehicles
  { label: "Car (distant)",    x: 0.55, y: 0.30, w: 0.12, h: 0.10, strength: 0.55 },
  { label: "Car (distant)",    x: 0.68, y: 0.28, w: 0.10, h: 0.09, strength: 0.48 },
  { label: "Bicycle",          x: 0.27, y: 0.38, w: 0.07, h: 0.12, strength: 0.42 },

  // Pedestrians
  { label: "Person",           x: 0.24, y: 0.35, w: 0.04, h: 0.10, strength: 0.35 },
  { label: "Person",           x: 0.18, y: 0.37, w: 0.03, h: 0.09, strength: 0.28 },

  // Street infrastructure
  { label: "Traffic light",    x: 0.39, y: 0.08, w: 0.03, h: 0.12, strength: 0.30 },
  { label: "Street sign",      x: 0.12, y: 0.10, w: 0.05, h: 0.08, strength: 0.22 },
  { label: "Street lamp",      x: 0.82, y: 0.05, w: 0.03, h: 0.30, strength: 0.18 },
  { label: "Fire hydrant",     x: 0.44, y: 0.68, w: 0.02, h: 0.04, strength: 0.20 },

  // Background structures
  { label: "Building",         x: 0.00, y: 0.00, w: 0.30, h: 0.40, strength: 0.12 },
  { label: "Building",         x: 0.70, y: 0.00, w: 0.30, h: 0.35, strength: 0.10 },
  { label: "Tree",             x: 0.28, y: 0.10, w: 0.12, h: 0.35, strength: 0.14 },
  { label: "Tree",             x: 0.35, y: 0.08, w: 0.10, h: 0.30, strength: 0.12 },

  // Road — diffuse low activation
  { label: "Road surface",     x: 0.00, y: 0.72, w: 1.00, h: 0.28, strength: 0.30 },
];

// Only these objects get bounding-box overlays on the input image
const ANNOTATED_LABELS = ["Car (foreground)", "Car (background)"];

// 16 channels — each with a detection role and an anisotropic Gaussian sigma
const CHANNEL_META = [
  { name: "Horizontal edges",     group: "Edges",    sigmaX: 0.8,  sigmaY: 0.25 },
  { name: "Vertical edges",       group: "Edges",    sigmaX: 0.25, sigmaY: 0.8  },
  { name: "Diagonal edges (45°)", group: "Edges",    sigmaX: 0.6,  sigmaY: 0.6  },
  { name: "Diagonal edges (−45°)",group: "Edges",    sigmaX: 0.6,  sigmaY: 0.6  },
  { name: "Dark blobs",           group: "Texture",  sigmaX: 0.5,  sigmaY: 0.5  },
  { name: "Light blobs",          group: "Texture",  sigmaX: 0.5,  sigmaY: 0.5  },
  { name: "Fine texture",         group: "Texture",  sigmaX: 0.4,  sigmaY: 0.4  },
  { name: "Colour gradient",      group: "Colour",   sigmaX: 0.9,  sigmaY: 0.5  },
  { name: "Warm hues",            group: "Colour",   sigmaX: 0.7,  sigmaY: 0.7  },
  { name: "Cool hues",            group: "Colour",   sigmaX: 0.7,  sigmaY: 0.7  },
  { name: "Wheel-like circles",   group: "Shape",    sigmaX: 0.3,  sigmaY: 0.3  },
  { name: "Rectangular shapes",   group: "Shape",    sigmaX: 0.8,  sigmaY: 0.6  },
  { name: "Glass/reflection",     group: "Material", sigmaX: 0.5,  sigmaY: 0.3  },
  { name: "Metal surface",        group: "Material", sigmaX: 0.6,  sigmaY: 0.5  },
  { name: "Car detector",         group: "Semantic", sigmaX: 0.7,  sigmaY: 0.7  },
  { name: "Road detector",        group: "Semantic", sigmaX: 1.2,  sigmaY: 0.4  },
];

const GROUP_COLORS = {
  Edges:    [59,  130, 246],
  Texture:  [139, 92,  246],
  Colour:   [236, 72,  153],
  Shape:    [34,  197, 94 ],
  Material: [251, 146, 60 ],
  Semantic: [239, 68,  68 ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function prng(seed) {
  let s = (seed >>> 0) + 1;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function gauss(dx, dy) {
  return Math.exp(-(dx * dx + dy * dy) / 2);
}

// ─── Activation map builder ───────────────────────────────────────────────────
function buildActivationMap(chIdx, hoverCell, stageIdx) {
  const meta            = CHANNEL_META[chIdx];   // ← fix: was undeclared before
  const { sigmaX, sigmaY } = meta;

  const isSemanticCar  = meta.group === "Semantic" && chIdx === 14;
  const isSemanticRoad = meta.group === "Semantic" && chIdx === 15;
  const isSemantic     = meta.group === "Semantic";
  const isMid          = meta.group === "Shape" || meta.group === "Material";
  const isLow          = meta.group === "Edges" || meta.group === "Texture" || meta.group === "Colour";

  const r        = prng(chIdx * 73856093 + stageIdx * 9999);
  const bgLevel  = 0.03 + r() * 0.06;

  // Noisier for edge/texture channels, nearly clean for semantic
  const noiseMag = isSemanticCar ? 0.01
    : isSemantic               ? 0.02
    : isLow                    ? 0.12 + r() * 0.10
    :                            0.04 + r() * 0.05;

  // How strongly each channel type responds to car regions
  const carSens = isSemanticCar  ? 1.10
    : isSemanticRoad             ? 0.10
    : isMid                      ? 0.80 + r() * 0.20
    : isLow                      ? 0.60 + r() * 0.25
    :                              0.65 + r() * 0.20;

  const roadSens = isSemanticRoad ? 0.80 : 0.05 + r() * 0.10;

  // Deeper stages → stronger, more confident activations
  const stageFactor = 0.65 + stageIdx * 0.12;

  const nonRoadObjects = OBJECTS.filter(o => o.label !== "Road surface");
  const carObjects     = OBJECTS.filter(o => o.label.startsWith("Car") || o.label === "Bicycle");

  const map = [];
  for (let row = 0; row < SZ; row++) {
    for (let col = 0; col < SZ; col++) {
      const nx = (col + 0.5) / SZ;
      const ny = (row + 0.5) / SZ;

      // Seeded per-cell noise (stable across renders)
      const nr = prng(chIdx * 1000 + row * 100 + col + stageIdx * 50000);
      let val  = bgLevel + nr() * noiseMag;

      // Gaussian hotspot for every non-road object
      nonRoadObjects.forEach(obj => {
        const cx   = obj.x + obj.w / 2;
        const cy   = obj.y + obj.h / 2;
        const dx   = (nx - cx) / (obj.w * sigmaX);
        const dy   = (ny - cy) / (obj.h * sigmaY);
        const sens = obj.label.startsWith("Car") ? carSens : carSens * obj.strength;
        val += gauss(dx, dy) * obj.strength * sens * 0.6;
      });

      // Semantic channels: suppress background strongly so hotspots are crisp
      if (isSemantic) {
        const nearObject = nonRoadObjects.some(o => {
          const cx = o.x + o.w / 2;
          const cy = o.y + o.h / 2;
          const dx = Math.abs(nx - cx) / (o.w * 0.7);
          const dy = Math.abs(ny - cy) / (o.h * 0.7);
          return dx < 1 && dy < 1;
        });
        if (!nearObject) val *= 0.12;
      }

      // Road: diffuse activation across the bottom strip
      const road = OBJECTS.find(o => o.label === "Road surface");
      if (road && ny >= road.y) {
        val += (1 - (ny - road.y) / road.h) * roadSens * road.strength;
      }

      val *= stageFactor;

      // Hover: boost cells within the receptive field of the hovered position
      if (hoverCell && hoverCell.col >= 0) {
        const rfFrac = CONV_STAGES[stageIdx].receptiveFieldFrac;
        const hx     = (hoverCell.col + 0.5) / SZ;
        const hy     = (hoverCell.row + 0.5) / SZ;
        const dist   = Math.sqrt((nx - hx) ** 2 + (ny - hy) ** 2);
        const isCarHover = carObjects.some(o =>
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
  const map       = buildActivationMap(chIdx, hoverCell, stageIdx);
  const group     = CHANNEL_META[chIdx].group;
  const [r, g, b] = GROUP_COLORS[group];
  for (let row = 0; row < SZ; row++) {
    for (let col = 0; col < SZ; col++) {
      const v = map[row * SZ + col];
      ctx.fillStyle = `rgba(${r},${g},${b},${v.toFixed(3)})`;
      ctx.fillRect(col * PX, row * PX, PX, PX);
    }
  }
}

// ─── Single channel tile ──────────────────────────────────────────────────────
function ChannelCanvas({ chIdx, hoverCol, hoverRow, stageIdx }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const hoverCell =
      hoverCol !== null && hoverRow !== null && hoverCol >= 0
        ? { col: hoverCol, row: hoverRow }
        : null;
    drawChannel(canvasRef.current, chIdx, hoverCell, stageIdx);
  }, [chIdx, hoverCol, hoverRow, stageIdx]);

  const group     = CHANNEL_META[chIdx].group;
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

// ─── Stage selector buttons ───────────────────────────────────────────────────
function StageIndicator({ activeStage, onSelect }) {
  return (
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "10px", justifyContent: "center" }}>
      {CONV_STAGES.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          title={s.desc}
          style={{
            padding: "4px 10px",
            fontSize: "11px",
            borderRadius: "20px",
            border: "1px solid",
            cursor: "pointer",
            fontWeight:  i === activeStage ? 700 : 400,
            background:  i === activeStage ? "#3B82F6" : "transparent",
            borderColor: i === activeStage ? "#3B82F6" : "#555",
            color:       i === activeStage ? "#fff"    : "#aaa",
            transition: "all 0.15s ease",
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ─── Colour legend ────────────────────────────────────────────────────────────
function GroupLegend() {
  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginTop: "8px", fontSize: "10px" }}>
      {Object.entries(GROUP_COLORS).map(([group, [r, g, b]]) => (
        <span key={group} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: `rgb(${r},${g},${b})`, display: "inline-block" }} />
          <span style={{ color: "#aaa" }}>{group}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Receptive field readout ──────────────────────────────────────────────────
function ReceptiveFieldHint({ stageIdx, hoverCol }) {
  const rfPx = Math.round(CONV_STAGES[stageIdx].receptiveFieldFrac * 512);
  return (
    <div style={{
      fontSize: "10px",
      color: "#60A5FA",
      textAlign: "center",
      marginTop: "4px",
      minHeight: "18px",
      visibility: hoverCol >= 0 ? "visible" : "hidden",
    }}>
      Receptive field at this stage ≈ {rfPx}×{rfPx} px of the original 512×512 image
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BackboneStage() {
  const [hoverCol,    setHoverCol]    = useState(-1);
  const [hoverRow,    setHoverRow]    = useState(-1);
  const [isHovering,  setIsHovering]  = useState(false);
  const [scanPos,     setScanPos]     = useState({ x: 50, y: 50 });
  const [activeStage, setActiveStage] = useState(0); // start at Conv1

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top)  / rect.height;
    setScanPos({ x: nx * 100, y: ny * 100 });
    setHoverCol(Math.floor(nx * SZ));
    setHoverRow(Math.floor(ny * SZ));
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoverCol(-1);
    setHoverRow(-1);
  };

  const rfPercent = CONV_STAGES[activeStage].receptiveFieldFrac * 100;

  return (
    <div className="stage-visualization backbone-viz">

      {/* ── Input image panel ── */}
      <div
        className="viz-card primary-input"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="viz-label">
          Input Image
          <span style={{ fontSize: "10px", color: "#888", marginLeft: "6px" }}>
            (hover to inspect receptive field)
          </span>
        </div>

        <div className="viz-placeholder feature-map" style={{ position: "relative", overflow: "hidden" }}>
          <img src="/images/street.jpg" alt="Street scene" className="stage-input-image" />

          {/* Bounding-box overlays for primary cars only */}
          {OBJECTS.filter(o => ANNOTATED_LABELS.includes(o.label)).map((obj, i) => (
            <div
              key={i}
              style={{
                position:  "absolute",
                left:      `${obj.x * 100}%`,
                top:       `${obj.y * 100}%`,
                width:     `${obj.w * 100}%`,
                height:    `${obj.h * 100}%`,
                border:    "1.5px dashed rgba(251,146,60,0.75)",
                boxSizing: "border-box",
                pointerEvents: "none",
              }}
            >
              <span style={{
                fontSize:   "9px",
                background: "rgba(0,0,0,0.6)",
                color:      "#FCD34D",
                padding:    "0 3px",
                borderRadius: "2px",
                whiteSpace: "nowrap",
              }}>
                {obj.label}
              </span>
            </div>
          ))}

          {/* Receptive field cursor — grows as activeStage increases */}
          {isHovering && (
            <div style={{
              position:   "absolute",
              left:       `${scanPos.x}%`,
              top:        `${scanPos.y}%`,
              width:      `${rfPercent}%`,
              height:     `${rfPercent}%`,
              border:     "2px solid #3B82F6",
              transform:  "translate(-50%, -50%)",
              boxShadow:  "0 0 14px rgba(59,130,246,0.5)",
              pointerEvents: "none",
              boxSizing:  "border-box",
              background: "rgba(59,130,246,0.08)",
            }} />
          )}
        </div>

        <div className="viz-meta">512×512 · RGB</div>
      </div>

      <div className="viz-arrow">→</div>

      {/* ── Feature map panel ── */}
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

        <ReceptiveFieldHint stageIdx={activeStage} hoverCol={hoverCol} />

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