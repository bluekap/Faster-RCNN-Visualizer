import { useMemo } from "react";
import { stages } from "../constants/stageData.js";
import { colors, getStageColor } from "../constants/colors.js";
import Stage from "./Stage.jsx";
import FlowConnector from "./FlowConnector.jsx";
import "../styles/Pipeline.css";

export function Pipeline({ activeStage, onStageClick, onStageOpen, children }) {
  return (
    <div className="pipeline-root">
      <div className="pipeline-container">
        {stages.map((stage, index) => (
          <div key={stage.id} className="pipeline-stage-wrapper">
            <Stage
              stage={stage}
              index={index}
              isActive={activeStage === index}
              onFocus={() => onStageClick?.(index)}
              onClick={() => onStageOpen?.(index)}
            >
              {children?.[index]}
            </Stage>

            {/* Flow connector between stages */}
            {index < stages.length - 1 && (
              <div className="flow-connector-wrapper" style={{ height: 'auto' }}>
                <FlowConnector
                  active={activeStage >= index}
                  color={getStageColor(index).primary}
                  label={stage.transition}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pipeline;
