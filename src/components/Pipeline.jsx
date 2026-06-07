import { useEffect, useRef } from "react";
import { stages } from "../constants/stageData.js";
import { getStageColor } from "../constants/colors.js";
import Stage from "./Stage.jsx";
import FlowConnector from "./FlowConnector.jsx";
import "../styles/Pipeline.css";

export function Pipeline({ activeStage, onStageClick, onStageOpen, children }) {
  const stageRefs = useRef([]);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const activeStageNode = stageRefs.current[activeStage];
    if (!activeStageNode) return;

    requestAnimationFrame(() => {
      activeStageNode.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    });
  }, [activeStage]);

  return (
    <div className="pipeline-root">
      <div className="pipeline-container">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className="pipeline-stage-wrapper"
            ref={(node) => {
              stageRefs.current[index] = node;
            }}
          >
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
