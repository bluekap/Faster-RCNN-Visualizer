// Faster R-CNN pipeline stages and descriptions
export const stages = [
  {
    id: "input",
    number: "01",
    title: "Input Image",
    kicker: "Step 1",
    subtitle: "Start With Pixels",
    description:
      "The visual guide starts with the original street image. Faster R-CNN does not begin with boxes or classes — it begins with pixels, spatial layout, and objects at different scales.",
    shortDescription: "Raw pixels → model-ready image",
    mental_model:
      "Before the network can detect anything, it needs one shared scene to inspect. The image is the source of all later features, anchors, proposals, and detections.",
    key_insight:
      "Starting from the image makes every later step traceable: feature cells, anchors, proposals, and final boxes can all be connected back to real regions in the scene.",
    howItWorks:
      "The input image is resized into the shape expected by the model and normalized before the convolutional backbone sees it. In this visualizer, the street scene is treated as a 512×512 RGB image so each later stage can reference consistent coordinates.",
    keyInsightExtended:
      "The model never receives a hand-picked crop first. Faster R-CNN processes the full image once, then learns which regions are worth inspecting more closely.",
    purpose:
      "Establish the concrete scene that the rest of the detector will analyze step by step.",
    inputOutput: {
      input: "Street scene image",
      output: "512×512 RGB tensor prepared for the backbone",
    },
    transition: "Normalized Image",
  },
  {
    id: "backbone",
    number: "02",
    title: "Shared Backbone",
    kicker: "Step 2",
    subtitle: "Feature Extraction",
    description:
      "The backbone looks over the image once and turns pixels into reusable feature maps. Each map highlights a kind of visual pattern, such as edges, textures, shapes, or car-like parts.",
    shortDescription: "One CNN pass → reusable features",
    mental_model: "Think of this as making a smart sketch of the image. The model is not drawing boxes yet; it is marking where useful visual clues appear.",
    key_insight:
      "The rest of Faster R-CNN reuses this one feature map, so the image does not need to be analyzed from scratch for every possible object region.",
    // Extended detailed content
    howItWorks:
      "A convolutional backbone slides learned filters across the image. Early filters respond to simple clues like edges and color changes. Deeper filters combine those clues into more meaningful patterns, like wheels, windows, road regions, and car-like shapes. Faster R-CNN runs this once and shares the result with later stages.",
    keyInsightExtended:
      "In earlier detectors like R-CNN, features were extracted separately for each region proposal — up to 2,000 times per image. Faster R-CNN's shared backbone computes features just once, making it ~250× faster.",
    purpose:
      "Convert raw pixels into a spatial feature map that keeps the layout of the scene while describing what visual patterns appear in each area.",
    inputOutput: {
      input: "512×512 RGB image (3 channels)",
      output: "8×8×512 feature map — each of the 64 spatial cells encodes a 64×64 px receptive field from the original image",
    },
    receptiveFields: [
      {
        label: "Conv1",
        desc: "detects pixel-level edges and colour boundaries",
        receptiveField: "7 px",
      },
      {
        label: "Conv2",
        desc: "detects corners, blobs, and simple textures",
        receptiveField: "23 px",
      },
      {
        label: "Conv3",
        desc: "detects object parts (wheels, windows)",
        receptiveField: "87 px",
      },
      {
        label: "Feature Map",
        desc: "full semantic encoding with large context",
        receptiveField: "215 px",
      },
    ],
    transition: "Shared Feature Map",
  },
  {
    id: "rpn",
    number: "03",
    title: "Region Proposal Network",
    kicker: "Step 3",
    subtitle: "Generate Proposals",
    description:
      "The RPN slides across the feature map, testing multiple anchor templates at each location and predicting objectness scores and box offsets. This generates candidate regions likely to contain objects.",
    shortDescription: "Anchor templates → scored proposals",
    key_insight:
      "Instead of exhaustively searching the image, the RPN intelligently proposes promising regions, reducing the search space.",
    transition: "Region Proposals",
  },
  {
    id: "roi",
    number: "04",
    title: "RoI Pooling",
    kicker: "Step 4",
    subtitle: "Normalize Regions",
    description:
      "Each region proposal is warped to a fixed-size feature map using RoI Pooling, allowing the network to process objects of any size uniformly.",
    shortDescription: "Variable regions → fixed-size tensors",
    key_insight:
      "RoI Pooling decouples detection from classification — the same shared feature map is reused for every proposal, making inference fast and memory-efficient.",
    // Extended detailed content
    howItWorks:
      "Each region proposal is warped to a fixed-size feature map using RoI Pooling, allowing the network to process objects of any size uniformly.",
    keyInsightExtended:
      "RoI Pooling decouples detection from classification — the same shared feature map is reused for every proposal, making inference fast and memory-efficient.",
    inputOutput: {
      input: "A variable-sized region proposal (bounding box) on the feature map",
      grid: "The region is divided into a fixed 7×7 grid of bins",
      pooling: "Max pooling is applied within each bin",
      output: "A fixed 7×7 × C feature tensor, regardless of the original proposal size",
    },
    whyItMatters:
      "Before RoI Pooling (introduced in Fast R-CNN), each proposal had to be warped or cropped individually before being passed through a CNN — this was slow. RoI Pooling allows a single forward pass through the backbone for the entire image, with proposal-specific features extracted in one step.",
    transition: "Pooled Features",
  },
  {
    id: "head",
    number: "05",
    title: "Detection Head",
    kicker: "Step 5",
    subtitle: "Classify & Refine",
    description:
      "The final head classifies each region (predicting the object class and confidence) and refines the bounding box. Non-max suppression then removes duplicate detections.",
    shortDescription: "Classify + refine boxes → final detections",
    key_insight:
      "The detection head benefits from the rich, reused features and compact proposal set, enabling fast and accurate classification.",
  },
];

export const presets = [
  {
    id: "street",
    label: "Street Scene",
    noun: "car",
    description: "Finding cars in an urban street",
    scenario: "A busy street with cars, roads, buildings, and sky",
  },
  {
    id: "wildlife",
    label: "Wildlife",
    noun: "fox",
    description: "Finding foxes in forest scenes",
    scenario: "A forest edge with trees, grass, and wildlife",
  },
  {
    id: "sports",
    label: "Sports",
    noun: "player",
    description: "Finding players in a stadium",
    scenario: "A crowded sports arena with spectators and field",
  },
];

export const metrics = {
  backbone: {
    inputs: "512×512 image",
    outputs: "8×8 feature map",
    stride: "64 pixels (total)",
    description: "Extract rich spatial features from the input",
  },
  rpn: {
    anchors_per_location: "9",
    total_anchors: "2500",
    top_proposals: "1000",
    description: "Generate and score region proposals",
  },
  roi: {
    input_size: "Variable",
    output_size: "7×7",
    channels: "256",
    description: "Normalize proposal regions",
  },
  head: {
    input_size: "7×7×256",
    output_classes: "81",
    output_boxes: "4",
    description: "Classify and refine proposals",
  },
};
