import { useState } from "react";
import Pipeline from "./components/Pipeline.jsx";
import DetailModal from "./components/DetailModal.jsx";
import NarrativePanel from "./components/NarrativePanel.jsx";
import { stages } from "./constants/stageData.js";
import { InputStage } from "./components/stages/InputStage.jsx";
import { BackboneStage } from "./components/stages/BackboneStage.jsx";
import { RPNStage } from "./components/stages/RPNStage.jsx";
import { RoIStage } from "./components/stages/RoIStage.jsx";
import { HeadStage } from "./components/stages/HeadStage.jsx";
import "./styles/App.css";

const WALKTHROUGH_EXAMPLE = {
  label: "Street Scene Example",
  noun: "car",
  description: "A step-by-step object detection walkthrough using one street-scene example.",
};

function App() {
  const [activeStage, setActiveStage] = useState(0);
  const [showNarrative, setShowNarrative] = useState(false);
  const [selectedStageIndex, setSelectedStageIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stageContent = [
    <InputStage key="input" />,
    <BackboneStage key="backbone" />,
    <RPNStage key="rpn" />,
    <RoIStage key="roi" />,
    <HeadStage key="head" />,
  ];

  const handleStageClick = (index) => {
    setSelectedStageIndex(index);
    setIsModalOpen(true);
    setActiveStage(index);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Faster R-CNN Visual Guide</h1>
          <p className="app-subtitle">{WALKTHROUGH_EXAMPLE.description}</p>
        </div>
        <div className="header-right">
          <button 
            className="narrative-toggle-btn"
            onClick={() => setShowNarrative(!showNarrative)}
          >
            {showNarrative ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`app-main ${showNarrative ? "with-narrative" : ""}`}>
        <div className="pipeline-wrapper">
          <Pipeline
            activeStage={activeStage}
            onStageClick={setActiveStage}
            onStageOpen={handleStageClick}
          >
            {stageContent}
          </Pipeline>
        </div>

        {/* Narrative Panel - Hidden by default */}
        {showNarrative && (
          <NarrativePanel
            currentStage={activeStage}
            onNext={() => setActiveStage(Math.min(activeStage + 1, stages.length - 1))}
            onPrev={() => setActiveStage(Math.max(activeStage - 1, 0))}
            totalStages={stages.length}
          />
        )}
      </main>

      {/* Detail Modal */}
      {selectedStageIndex !== null && (
        <DetailModal
          stage={stages[selectedStageIndex]}
          index={selectedStageIndex}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        >
          {stageContent[selectedStageIndex]}
        </DetailModal>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-description">
            Faster R-CNN is a state-of-the-art object detection framework that balances accuracy and speed.
          </p>
          <div className="footer-bottom">
            <div className="footer-copyright">
              <span>© 2026 </span>
              <a 
                href="https://github.com/bluekap" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                bluekap™
              </a>
              <span className="footer-separator">•</span>
              <span>All Rights Reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
