export function formatFileSize(bytes) {
  if (!bytes) return "Unknown";
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

export const FILE_TYPE_META = {
  video: {
    label: "Video",
    color: "#1A4B8C",
    bg: "#EDF4FF",
    icon: "video",
  },
  pdf: {
    label: "PDF",
    color: "#B84A2E",
    bg: "#FFF3E8",
    icon: "document",
  },
  image: {
    label: "Image",
    color: "#2D6B50",
    bg: "#F0FAF4",
    icon: "image",
  },
};

export const LEVEL_META = {
  Beginner: { color: "#2D6B50", bg: "#F0FAF4" },
  Intermediate: { color: "#885A0B", bg: "#FEF6E4" },
  Advanced: { color: "#8B2020", bg: "#FEF0F0" },
};
