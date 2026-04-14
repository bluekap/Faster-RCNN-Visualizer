# Faster-CNN-Visualizer

This project provides an interactive visualization of the Faster R-CNN object detection pipeline, specifically demonstrating how it identifies cars in urban street scenes. It's designed to illustrate the complex stages of Faster R-CNN in a clear and engaging manner, making the underlying concepts more accessible.

## Features

-   **Interactive Pipeline:** Visualizes the entire Faster R-CNN process from input image to final detection across four key stages: Shared Backbone, Region Proposal Network (RPN), RoI Pooling, and Detection Head.
-   **Dynamic Stage Interactions:**
    -   **Shared Backbone:** Hover over the input image to see dynamic feature map activations, simulating how different channels respond to localized visual patterns.
    -   **Region Proposal Network (RPN):** Interactively displays anchor box templates as you scan the feature map, showing how candidate regions are generated.
    -   **RoI Pooling:** An animated demonstration of how variable-sized region proposals are normalized into fixed-size tensors for consistent processing.
    -   **Detection Head:** A confidence threshold slider allows real-time filtering of final object detections, showcasing how prediction confidence affects output.
-   **Narrative Panel:** Provides detailed explanations and key insights for each stage of the pipeline.

## Setup

To get started with the project, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/bluekap/Faster-CNN-Visualizer.git
    cd Faster-CNN-Visualizer
    ```

2.  **Install dependencies:**
    This project uses `npm` for package management.
    ```bash
    npm install
    ```

## Running the Application

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

This will typically start the application on `http://localhost:5173` (or another available port).

### Production Build

To build the application for production and then preview it:

1.  **Build the project:**
    ```bash
    npm run build
    ```

2.  **Preview the build:**
    ```bash
    npm run preview
    ```

This will serve the optimized production build, usually on `http://localhost:4173`.

## Tech Stack

React: Frontend library for building the user interface.
Vite: Fast development server and build tool.
D3.js: Used for visualizations and interactive graphics.
GSAP: Used for animations and smooth transitions.
Lucide React: Icon library.
CSS: For styling (includes some Tailwind-like utility classes for interactive elements).