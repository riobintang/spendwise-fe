import { TransactionType } from "@shared/api";

// Pastel color palette - visually distinct and pleasant
const PASTEL_COLORS = [
  "#FF6B6B", // Pastel Red
  "#4ECDC4", // Pastel Teal
  "#FFE66D", // Pastel Yellow
  "#FF8B94", // Pastel Pink
  "#A8E6CF", // Pastel Green
  "#FFD3B6", // Pastel Orange
  "#FFAAA5", // Pastel Salmon
  "#AA96DA", // Pastel Purple
  "#FCBAD3", // Pastel Light Pink
  "#A1DE93", // Pastel Light Green
  "#FCBAD3", // Pastel Coral
  "#F38181", // Pastel Rose
];

/**
 * Get default color based on category type
 * For income: returns green
 * For expense: returns a random pastel color not already used
 */
export function getDefaultCategoryColor(
  type: TransactionType,
  existingCategories?: Array<{ color: string }>
): string {
  if (type === TransactionType.INCOME) {
    return "#00C853"; // Green for income
  }

  // For expenses, find an unused pastel color
  if (existingCategories && existingCategories.length > 0) {
    const usedColors = new Set(existingCategories.map((c) => c.color.toUpperCase()));
    const availableColors = PASTEL_COLORS.filter(
      (color) => !usedColors.has(color.toUpperCase())
    );

    if (availableColors.length > 0) {
      return availableColors[Math.floor(Math.random() * availableColors.length)];
    }
  }

  // Fallback: return a random pastel color
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
}
