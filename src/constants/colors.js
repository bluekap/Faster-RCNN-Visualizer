// Semantic color palette for Faster R-CNN pipeline stages
export const colors = {
  // Stage colors
  input: {
    primary: "rgb(14, 165, 233)",     // sky-500
    secondary: "rgb(125, 211, 252)",  // sky-300
    light: "rgba(14, 165, 233, 0.1)",
    accent: "rgba(14, 165, 233, 0.3)",
  },
  backbone: {
    primary: "rgb(59, 130, 246)",     // blue-500
    secondary: "rgb(147, 197, 253)",  // blue-300
    light: "rgba(59, 130, 246, 0.1)", // 10% opacity
    accent: "rgba(59, 130, 246, 0.3)",
  },
  rpn: {
    primary: "rgb(168, 85, 247)",     // purple-500
    secondary: "rgb(216, 180, 254)",  // purple-300
    light: "rgba(168, 85, 247, 0.1)",
    accent: "rgba(168, 85, 247, 0.3)",
  },
  roi: {
    primary: "rgb(34, 197, 94)",      // green-500
    secondary: "rgb(134, 239, 172)",  // green-300
    light: "rgba(34, 197, 94, 0.1)",
    accent: "rgba(34, 197, 94, 0.3)",
  },
  head: {
    primary: "rgb(249, 115, 22)",     // orange-500
    secondary: "rgb(253, 186, 116)",  // orange-300
    light: "rgba(249, 115, 22, 0.1)",
    accent: "rgba(249, 115, 22, 0.3)",
  },

  // Neutral colors
  neutral: {
    dark: "rgb(23, 23, 23)",
    gray: "rgb(107, 114, 128)",
    light: "rgb(242, 242, 242)",
    border: "rgb(229, 231, 235)",
  },

  // Flow/path colors
  flow: {
    active: "rgba(168, 85, 247, 0.6)",
    inactive: "rgba(168, 85, 247, 0.15)",
    highlight: "rgba(168, 85, 247, 0.9)",
  },

  // Attention/focus
  focus: {
    dim: "rgba(255, 255, 255, 0.7)",
    highlight: "rgba(0, 0, 0, 0.95)",
  },
};

export const getStageColor = (index) => {
  const stageColors = [colors.input, colors.backbone, colors.rpn, colors.roi, colors.head];
  return stageColors[index] || colors.backbone;
};
