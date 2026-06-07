import "../../styles/Stage.css";

const IMAGE_NOTES = [
  { label: "Scene", value: "Urban street" },
  { label: "Target", value: "Cars" },
  { label: "Tensor", value: "512x512 RGB" },
];

const NETWORK_STEPS = [
  { id: "image", label: "Image", detail: "512x512 RGB" },
  { id: "backbone", label: "Backbone", detail: "Shared feature map" },
  { id: "rpn", label: "RPN", detail: "Object proposals" },
  { id: "roi", label: "RoI Pooling", detail: "Fixed-size features" },
  { id: "head", label: "Head", detail: "Classes + boxes" },
  { id: "detections", label: "Detections", detail: "Final car boxes" },
];

const CALLOUTS = [
  {
    label: "Foreground car",
    x: 46,
    y: 48,
    w: 38,
    h: 40,
  },
  {
    label: "Background car",
    x: 3,
    y: 29,
    w: 26,
    h: 36,
  },
];

export function InputStage() {
  return (
    <div className="stage-visualization input-viz">
      <div className="viz-card input-image-card">
        <div className="viz-label">Original Image</div>
        <div className="input-image-frame">
          <img
            src={import.meta.env.BASE_URL + "images/street.jpg"}
            alt="Urban street scene before Faster R-CNN processing"
            className="stage-input-image"
            draggable={false}
          />

          {CALLOUTS.map((box) => (
            <div
              key={box.label}
              className="input-callout-box"
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.w}%`,
                height: `${box.h}%`,
              }}
            >
              <span>{box.label}</span>
            </div>
          ))}
        </div>
        <div className="viz-meta">The full image is the detector's starting point</div>
      </div>

      <div className="viz-arrow">→</div>

      <div className="viz-card network-overview-card">
        <div className="viz-label">Complete Network Overview</div>
        <div className="input-prep-list">
          {IMAGE_NOTES.map((item) => (
            <div key={item.label} className="input-prep-item">
              <span className="input-prep-label">{item.label}</span>
              <span className="input-prep-value">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="network-diagram" aria-label="Faster R-CNN network overview">
          {NETWORK_STEPS.map((step, index) => (
            <div key={step.id} className={`network-step network-step-${step.id}`}>
              <div className="network-node">
                <span className="network-node-label">{step.label}</span>
                <span className="network-node-detail">{step.detail}</span>
              </div>
              {index < NETWORK_STEPS.length - 1 && <div className="network-link" />}
            </div>
          ))}
          <div className="network-shared-note">Backbone features are reused by both proposal generation and final classification.</div>
        </div>

        <div className="viz-meta">Use this map, then walk through each block below</div>
      </div>
    </div>
  );
}

export default InputStage;
