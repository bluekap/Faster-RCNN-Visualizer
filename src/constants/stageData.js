// Faster R-CNN pipeline stages and descriptions
export const stages = [
  {
    id: "backbone",
    number: "01",
    title: "Shared Backbone",
    kicker: "Stage 1",
    subtitle: "Feature Extraction",
    description:
      "The backbone extracts feature maps that will later be used by the Region Proposal Network. It runs a single CNN pass to create a dense representation that all downstream stages reuse, dramatically improving speed.",
    shortDescription: "One CNN pass → reusable features",
    mental_model: "At this stage, the network is not detecting objects yet — it is only learning what patterns exist in the image.",
    key_insight:
      "By computing features once and reusing them, Faster R-CNN avoids redundant computation and enables efficient object detection.",
    // Extended detailed content
    howItWorks:
      "A convolutional backbone (typically VGG16 or ResNet-50) slides learned filters across the entire input image, producing a dense feature map. Each layer builds on the previous: early layers detect low-level patterns like edges and colour gradients, while deeper layers combine these into high-level semantic concepts like car bodies and windows. Faster R-CNN runs this step once and shares the result with all downstream stages.",
    keyInsightExtended:
      "In earlier detectors like R-CNN, features were extracted separately for each region proposal — up to 2,000 times per image. Faster R-CNN's shared backbone computes features just once, making it ~250× faster.",
    purpose:
      "Convert raw pixel values into a rich spatial feature map that encodes what is in each part of the image and where. This representation is then reused by both the Region Proposal Network (Stage 2) and the detection head (Stage 3).",
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
    number: "02",
    title: "Region Proposal Network",
    kicker: "Stage 2",
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
    number: "03",
    title: "RoI Pooling",
    kicker: "Stage 3",
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
    number: "04",
    title: "Detection Head",
    kicker: "Stage 4",
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
