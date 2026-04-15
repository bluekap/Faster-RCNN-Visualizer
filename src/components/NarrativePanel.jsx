import { stages } from "../constants/stageData.js";
import { colors, getStageColor } from "../constants/colors.js";
import "../styles/NarrativePanel.css";

export function NarrativePanel({ currentStage, onNext, onPrev, totalStages = 4 }) {
  const stage = stages[currentStage];
  const stageColor = getStageColor(currentStage);

  return (
    <div className="narrative-panel">
      <div
        className="narrative-header"
        style={{
          borderLeftColor: stageColor.primary,
        }}
      >
        <span className="narrative-step">
          {currentStage + 1} / {totalStages}
        </span>
        <h2 className="narrative-title">{stage.title}</h2>
        <p className="narrative-kicker">{stage.kicker}</p>
      </div>

      <div className="narrative-content">
        <p className="narrative-description">{stage.description}</p>

        {stage.mental_model && (
          <div className="narrative-mental-model">
            <p className="mental-model-text">
              <strong>🧠 Mental Model:</strong> {stage.mental_model}
            </p>
          </div>
        )}

        <div
          className="narrative-insight"
          style={{
            backgroundColor: stageColor.light,
            borderColor: stageColor.primary,
          }}
        >
          <span className="insight-icon">✨</span>
          <p>{stage.key_insight}</p>
        </div>
      </div>

      <div className="narrative-progress">
        <div className="progress-bar" style={{ width: `${((currentStage + 1) / totalStages) * 100}%`, backgroundColor: stageColor.primary }} />
      </div>

      <div className="narrative-controls">
        <button onClick={onPrev} disabled={currentStage === 0} className="nav-button prev">
          ← Previous
        </button>
        <button onClick={onNext} disabled={currentStage === totalStages - 1} className="nav-button next">
          Next →
        </button>
      </div>
    </div>
  );
}

export default NarrativePanel;
