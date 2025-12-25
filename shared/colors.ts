/**
 * Tailwind color class to Hex value mapping
 */
const TAILWIND_TO_HEX: Record<string, string> = {
  // Blues
  "bg-blue-500": "#3b82f6",
  "bg-blue-400": "#60a5fa",
  "bg-blue-600": "#2563eb",

  // Greens
  "bg-green-500": "#10b981",
  "bg-green-400": "#4ade80",
  "bg-green-600": "#059669",

  // Oranges
  "bg-orange-500": "#f97316",
  "bg-orange-400": "#fb923c",
  "bg-orange-600": "#ea580c",

  // Purples
  "bg-purple-500": "#a855f7",
  "bg-purple-400": "#c084fc",
  "bg-purple-600": "#9333ea",

  // Pinks
  "bg-pink-500": "#ec4899",
  "bg-pink-400": "#f472b6",
  "bg-pink-600": "#db2777",

  // Yellows
  "bg-yellow-500": "#eab308",
  "bg-yellow-400": "#facc15",
  "bg-yellow-600": "#ca8a04",

  // Reds
  "bg-red-500": "#ef4444",
  "bg-red-400": "#f87171",
  "bg-red-600": "#dc2626",

  // Cyan
  "bg-cyan-500": "#06b6d4",
  "bg-cyan-400": "#22d3ee",
  "bg-cyan-600": "#0891b2",

  // Indigo
  "bg-indigo-500": "#6366f1",
  "bg-indigo-400": "#818cf8",
  "bg-indigo-600": "#4f46e5",

  // Gray
  "bg-gray-500": "#6b7280",
  "bg-gray-400": "#9ca3af",
  "bg-gray-600": "#4b5563",

  // Pastel colors
  "#FF6B6B": "#FF6B6B",
  "#4ECDC4": "#4ECDC4",
  "#FFE66D": "#FFE66D",
  "#FF8B94": "#FF8B94",
  "#A8E6CF": "#A8E6CF",
  "#FFD3B6": "#FFD3B6",
  "#FFAAA5": "#FFAAA5",
  "#AA96DA": "#AA96DA",
  "#FCBAD3": "#FCBAD3",
  "#A1DE93": "#A1DE93",
  "#F38181": "#F38181",
  "#00C853": "#00C853",
};

/**
 * Convert a color (Tailwind class or hex) to hex value
 * If input is already hex, return as-is
 * If input is Tailwind class, convert to hex
 * Otherwise return a safe default
 */
export function colorToHex(color: string): string {
  if (!color) return "#8b5cf6"; // Default purple

  // If already hex format, return as-is
  if (color.startsWith("#")) {
    return color;
  }

  // Look up in Tailwind mapping
  const hex = TAILWIND_TO_HEX[color];
  if (hex) {
    return hex;
  }

  // Fallback to default
  return "#8b5cf6";
}
