import { useState } from "react";
import Pipeline from "./components/Pipeline.jsx";
import DetailModal from "./components/DetailModal.jsx";
import NarrativePanel from "./components/NarrativePanel.jsx";
import { stages } from "./constants/stageData.js";
import { BackboneStage } from "./components/stages/BackboneStage.jsx";
import { RPNStage } from "./components/stages/RPNStage.jsx";
import { RoIStage } from "./components/stages/RoIStage.jsx";
import { HeadStage } from "./components/stages/HeadStage.jsx";
import "./styles/App.css";

// Street scenario - finding a car in an urban scene
const STREET_SCENARIO = {
  label: "Street Scene",
  noun: "car",
  description: "Finding cars in busy urban streets",
};

function App() {
  const [activeStage, setActiveStage] = useState(0);
  const [showNarrative, setShowNarrative] = useState(false);
  const [selectedStageIndex, setSelectedStageIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stageContent = [
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
          <h1 className="app-title">Faster R-CNN: Finding Cars in Streets</h1>
          <p className="app-subtitle">{STREET_SCENARIO.description}</p>
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
        <p>Faster R-CNN is a state-of-the-art object detection framework that balances accuracy and speed.</p>
      </footer>
    </div>
  );
}

export default App;
