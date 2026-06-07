# Faster R-CNN Visualizer

Interactive visual guide for understanding how Faster R-CNN turns an input image into object detections.

This project is a Vite + React app that explains the Faster R-CNN pipeline through animated stages, clickable details, and a narrative walkthrough. The current scenario focuses on finding cars in an urban street scene, using simplified but faithful visualizations of the main model components.

## Project Goal

Faster R-CNN can be hard to understand from equations and architecture diagrams alone. This visualizer is meant to make the model feel inspectable:

- Show the full two-stage detector pipeline from image features to final boxes.
- Explain what each stage receives, computes, and passes forward.
- Make anchors, proposals, RoI pooling, classification, and box refinement visible.
- Give learners a guided path through the architecture without requiring a deep learning setup.

## Faster R-CNN Flow

1. **Shared Backbone**
   The image is passed through a convolutional feature extractor. Instead of processing every candidate crop separately, Faster R-CNN computes one shared feature map for the whole image.

2. **Region Proposal Network**
   The RPN scans the shared feature map with anchor boxes. It predicts which anchors are likely to contain objects and adjusts their coordinates into better region proposals.

3. **RoI Pooling**
   Each proposal can have a different shape and size. RoI Pooling converts every proposal into a fixed-size feature tensor so the detection head can process them consistently.

4. **Detection Head**
   The final head classifies each proposal, refines the bounding box, scores confidence, and removes duplicate boxes with non-max suppression.

## What Is Built

- Interactive pipeline stages for backbone features, RPN proposals, RoI pooling, and final detection.
- Stage detail modal with expanded educational content.
- Narrative panel for stepping through the architecture.
- Animated connectors and transitions for the pipeline flow.
- Street-scene image asset for a concrete car-detection example.

## Tech Stack

- React 19
- Vite 7
- D3 for data-driven visual elements
- GSAP for animation
- Lucide React for icons
- Vanilla CSS for layout and styling

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Vite will print the local URL, usually:

```text
http://localhost:5173/
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```text
src/
  App.jsx
  components/
    Pipeline.jsx
    Stage.jsx
    DetailModal.jsx
    NarrativePanel.jsx
    stages/
      BackboneStage.jsx
      RPNStage.jsx
      RoIStage.jsx
      HeadStage.jsx
  constants/
    stageData.js
    colors.js
  hooks/
  styles/
public/
  images/
    street.jpg
```

## Deployment

The Vite `base` path is set to `/Faster-RCNN-Visualizer/` for GitHub Pages. The repository also includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and deploys the `dist` output when changes are pushed to `main`.

For GitHub Pages, set **Settings > Pages > Build and deployment > Source** to **GitHub Actions**.

## Roadmap

- Add toggles for anchor scales, aspect ratios, and confidence thresholds.
- Add side-by-side comparison of R-CNN, Fast R-CNN, and Faster R-CNN.
- Add more object-detection scenarios beyond the street scene.
- Add lightweight tests for stage data and UI rendering.

## License

MIT. See [LICENSE](LICENSE).
