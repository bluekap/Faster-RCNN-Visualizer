import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useModalAnimations(stage, isOpen, stageIndex) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !stage) {
      // Clean up timeline when modal closes
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      return;
    }

    // Kill previous timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline
    const tl = gsap.timeline();
    timelineRef.current = tl;

    // Get all animated elements in the container
    const vizContainer = containerRef.current;
    if (!vizContainer) return;

    const vizCards = vizContainer.querySelectorAll(".viz-card");
    const vizArrows = vizContainer.querySelectorAll(".viz-arrow");
    const gridCells = vizContainer.querySelectorAll(".grid-cell");
    const featureGrids = vizContainer.querySelectorAll(".roi-cell");
    const classRows = vizContainer.querySelectorAll(".class-row");
    const detectionBoxes = vizContainer.querySelectorAll("rect[fill='none']");

    // Common animation patterns
    // Stage-specific animations
    if (stage.id === "input") {
      // Input stage: source image, target callouts, then tensor prep.
      const inputImage = vizContainer.querySelector(".stage-input-image");
      const callouts = vizContainer.querySelectorAll(".input-callout-box");
      const prepItems = vizContainer.querySelectorAll(".input-prep-item");
      const networkNodes = vizContainer.querySelectorAll(".network-node");
      const networkLinks = vizContainer.querySelectorAll(".network-link");

      if (inputImage) {
        tl.fromTo(inputImage, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0);
      }

      if (callouts.length > 0) {
        gsap.set(callouts, { opacity: 0, scale: 0.96 });
        tl.to(callouts, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.12 }, 0.35);
      }

      if (vizArrows.length > 0) {
        tl.to(vizArrows[0], { opacity: 0.8, duration: 0.4 }, 0.55);
      }

      if (prepItems.length > 0) {
        gsap.set(prepItems, { opacity: 0, x: -10 });
        tl.to(prepItems, { opacity: 1, x: 0, duration: 0.35, stagger: 0.1 }, 0.75);
      }

      if (networkNodes.length > 0) {
        gsap.set(networkNodes, { opacity: 0, x: -8 });
        tl.to(networkNodes, { opacity: 1, x: 0, duration: 0.35, stagger: 0.08 }, 1);
      }

      if (networkLinks.length > 0) {
        gsap.set(networkLinks, { opacity: 0, scaleX: 0, transformOrigin: "left center" });
        tl.to(networkLinks, { opacity: 1, scaleX: 1, duration: 0.3, stagger: 0.08 }, 1.08);
      }
    } else if (stage.id === "backbone") {
      // Backbone stage: image fade in, then feature grid stagger
      const inputImage = vizContainer.querySelector(".stage-input-image");
      const featureGrid = vizContainer.querySelector(".feature-grid");

      if (inputImage) {
        tl.to(inputImage, { opacity: 1, duration: 0.6 }, 0);
      }

      if (vizArrows.length > 0) {
        tl.to(vizArrows[0], { opacity: 0.8, duration: 0.4 }, 0.5);
      }

      if (gridCells.length > 0) {
        gsap.set(gridCells, { opacity: 0, scale: 0.8 });
        tl.to(
          gridCells,
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            stagger: { amount: 0.8, grid: [4, 4], from: "center" },
            ease: "back.out(1.5)",
          },
          0.7
        );
      }
    } else if (stage.id === "rpn") {
      // RPN stage: feature map, anchor grid appear, proposals generate with stagger
      const rpnInput = vizContainer.querySelector(".stage-input-image");
      const proposalOverlay = vizContainer.querySelector(".proposal-overlay");

      if (rpnInput) {
        tl.to(rpnInput, { opacity: 1, duration: 0.6 }, 0);
      }

      if (vizArrows.length > 0) {
        tl.to(vizArrows[0], { opacity: 0.8, duration: 0.4 }, 0.5);
      }

      if (proposalOverlay) {
        const rects = proposalOverlay.querySelectorAll("rect");
        const texts = proposalOverlay.querySelectorAll("text");

        gsap.set([...rects, ...texts], { opacity: 0 });
        tl.to(
          rects,
          {
            opacity: 1,
            duration: 0.4,
            stagger: 0.15,
            ease: "power2.out",
          },
          0.8
        );
        tl.to(
          texts,
          {
            opacity: 1,
            duration: 0.3,
            stagger: 0.15,
            ease: "power2.out",
          },
          0.95
        );
      }
    } else if (stage.id === "roi") {
      // RoI Pooling: proposals → pooled tensors with transformation effect
      const roiSource = vizContainer.querySelector(".roi-source");
      const roiPool = vizContainer.querySelector(".roi-pool-item");
      const roiCells = vizContainer.querySelectorAll(".roi-cell");

      if (roiSource) {
        tl.to(roiSource, { opacity: 1, duration: 0.5 }, 0);
      }

      if (vizArrows.length > 0) {
        tl.to(vizArrows[0], { opacity: 0.8, duration: 0.4 }, 0.4);
      }

      if (roiCells.length > 0) {
        gsap.set(roiCells, { opacity: 0, scale: 0.6 });
        tl.to(
          roiCells,
          {
            opacity: 1,
            scale: 1,
            duration: 0.35,
            stagger: { amount: 0.6, grid: [7, 7], from: "center" },
            ease: "back.out(1.2)",
          },
          0.7
        );
      }
    } else if (stage.id === "head") {
      // Detection Head: classification scores appear, detection boxes stroke animate
      const classificationCards = vizContainer.querySelectorAll(".class-row");
      const detectionOverlay = vizContainer.querySelector(".detection-box-overlay");

      if (classificationCards.length > 0) {
        gsap.set(classificationCards, { opacity: 0, x: -10 });
        tl.to(
          classificationCards,
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.2,
            ease: "power2.out",
          },
          0
        );
      }

      if (vizArrows.length > 0) {
        tl.to(vizArrows[0], { opacity: 0.8, duration: 0.4 }, 0.3);
      }

      if (detectionOverlay) {
        const detectionRects = detectionOverlay.querySelectorAll("rect");
        const detectionTexts = detectionOverlay.querySelectorAll("text");

        gsap.set([...detectionRects, ...detectionTexts], { opacity: 0, strokeDasharray: 100 });
        tl.to(
          detectionRects,
          {
            opacity: 1,
            strokeDashoffset: 0,
            duration: 0.5,
            stagger: 0.15,
            ease: "power2.out",
          },
          0.6
        );
        tl.to(
          detectionTexts,
          {
            opacity: 1,
            duration: 0.3,
            stagger: 0.15,
            ease: "power2.out",
          },
          0.8
        );
      }
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [isOpen, stage, stageIndex]);

  return containerRef;
}

export default useModalAnimations;
