import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { getStageColor } from "../constants/colors.js";
import { useModalAnimations } from "../hooks/useModalAnimations.js";
import "../styles/DetailModal.css";

export function DetailModal({ stage, index, isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const visualizationRef = useModalAnimations(stage, isOpen, index);
  const stageColor = getStageColor(index);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose?.();
    }
  };

  if (!isOpen || !stage) return null;

  return (
    <div
      ref={modalRef}
      className="detail-modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        "--stage-color": stageColor.primary,
        "--stage-light": stageColor.light,
        "--stage-accent": stageColor.accent,
      }}
    >
      <div className="detail-modal-container">
        {/* Modal Header */}
        <div className="detail-modal-header">
          <div className="detail-modal-title-group">
            <div className="detail-modal-number">{stage.number}</div>
            <div className="detail-modal-titles">
              <h2 className="detail-modal-title">{stage.title}</h2>
              <p className="detail-modal-subtitle">{stage.subtitle}</p>
            </div>
          </div>
          <button className="detail-modal-close" onClick={onClose} title="Close (ESC)">
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="detail-modal-content">
          {/* Visualization */}
          <div ref={visualizationRef} className="detail-modal-visualization">
            {children}
          </div>

          {/* Details Panel */}
          <div className="detail-modal-details">
            <div className="details-section">
              <h3 className="details-section-title">How It Works</h3>
              <p className="details-section-text">
                {stage.howItWorks || stage.description}
              </p>
            </div>

            {stage.mental_model && (
              <div className="details-section mental-model-section">
                <h3 className="details-section-title">🧠 Mental Model</h3>
                <div className="mental-model-box">
                  <p className="details-section-text">{stage.mental_model}</p>
                </div>
              </div>
            )}

            <div className="details-section">
              <h3 className="details-section-title">💡 Key Insight</h3>
              <div className="key-insight-box">
                <p>{stage.keyInsightExtended || stage.key_insight}</p>
              </div>
            </div>

            {stage.purpose && (
              <div className="details-section">
                <h3 className="details-section-title">Purpose</h3>
                <p className="details-section-text">{stage.purpose}</p>
              </div>
            )}

            <div className="details-section">
              <h3 className="details-section-title">Input / Output</h3>
              {stage.inputOutput?.grid ? (
                <div className="io-detailed">
                  <div className="io-detailed-item">
                    <span className="io-detailed-label">Input</span>
                    <span className="io-detailed-value">{stage.inputOutput.input}</span>
                  </div>
                  <div className="io-detailed-item">
                    <span className="io-detailed-label">Grid</span>
                    <span className="io-detailed-value">{stage.inputOutput.grid}</span>
                  </div>
                  <div className="io-detailed-item">
                    <span className="io-detailed-label">Pooling</span>
                    <span className="io-detailed-value">{stage.inputOutput.pooling}</span>
                  </div>
                  <div className="io-detailed-item highlight">
                    <span className="io-detailed-label">Output</span>
                    <span className="io-detailed-value">{stage.inputOutput.output}</span>
                  </div>
                </div>
              ) : (
                <div className="io-flow">
                  <div className="io-box input">
                    <span className="io-label">Input</span>
                    <span className="io-value">
                      {stage.inputOutput?.input || "Image Data"}
                    </span>
                  </div>
                  <div className="io-arrow">→</div>
                  <div className="io-box output">
                    <span className="io-label">Output</span>
                    <span className="io-value">
                      {stage.inputOutput?.output || "Processed Data"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {stage.whyItMatters && (
              <div className="details-section">
                <h3 className="details-section-title">Why It Matters</h3>
                <p className="details-section-text">{stage.whyItMatters}</p>
              </div>
            )}

            {stage.receptiveFields && (
              <div className="details-section">
                <h3 className="details-section-title">Receptive Fields by Layer</h3>
                <div className="receptive-fields-list">
                  {stage.receptiveFields.map((field, idx) => (
                    <div key={idx} className="receptive-field-item">
                      <div className="rf-label">
                        <strong>{field.label}</strong> — {field.desc}
                      </div>
                      <div className="rf-value">Receptive field: {field.receptiveField}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailModal;
