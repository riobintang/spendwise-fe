import { Transaction, Category, Insight, TransactionType } from "@shared/api";

export interface InsightData {
  type: "pattern" | "alert" | "suggestion";
  message: string;
  metric?: number;
  severity?: "low" | "medium" | "high";
}

/**
 * Generate insights based on transaction history
 */
export function generateInsights(
  transactions: Transaction[],
  categories: Category[],
  budgetLimits?: Record<string, number>
): InsightData[] {
  const insights: InsightData[] = [];

  if (transactions.length < 2) {
    return [
      {
        type: "suggestion",
        message: "Add more transactions to get personalized insights",
      },
    ];
  }

  // Analyze spending patterns
  const patterns = analyzeSpendingPatterns(transactions, categories);
  insights.push(...patterns);

  // Check budget alerts
  const alerts = checkBudgetAlerts(transactions, categories, budgetLimits);
  insights.push(...alerts);

  // Generate suggestions
  const suggestions = generateSuggestions(transactions, categories);
  insights.push(...suggestions);

  return insights;
}

/**
 * Analyze spending patterns (current month vs previous month)
 */
function analyzeSpendingPatterns(
  transactions: Transaction[],
  categories: Category[]
): InsightData[] {
  const insights: InsightData[] = [];
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  const previousMonthKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;

  // Group by month and category
  const spendingByMonthCategory: Record<
    string,
    Record<string, number>
  > = {};

  transactions.forEach((t) => {
    if (t.type === TransactionType.EXPENSE) {
      const [year, month] = t.date.substring(0, 7).split("-");
      const monthKey = `${year}-${month}`;

      if (!spendingByMonthCategory[monthKey]) {
        spendingByMonthCategory[monthKey] = {};
      }

      if (!spendingByMonthCategory[monthKey][t.categoryId]) {
        spendingByMonthCategory[monthKey][t.categoryId] = 0;
      }

      spendingByMonthCategory[monthKey][t.categoryId] += t.amount;
    }
  });

  const currentMonthSpending = spendingByMonthCategory[currentMonth] || {};
  const previousMonthSpending = spendingByMonthCategory[previousMonthKey] || {};

  // Compare each category
  const allCategories = new Set([
    ...Object.keys(currentMonthSpending),
    ...Object.keys(previousMonthSpending),
  ]);

  allCategories.forEach((categoryId) => {
    const current = currentMonthSpending[categoryId] || 0;
    const previous = previousMonthSpending[categoryId] || 0;

    if (previous > 0 && current > 0) {
      const percentChange = ((current - previous) / previous) * 100;

      if (percentChange > 30) {
        const category = categories.find((c) => c.id === categoryId);
        insights.push({
          type: "alert",
          severity: "high",
          message: `You spent ${percentChange.toFixed(0)}% more on ${category?.name || "this category"} this month`,
          metric: percentChange,
        });
      } else if (percentChange < -20) {
        const category = categories.find((c) => c.id === categoryId);
        insights.push({
          type: "suggestion",
          severity: "low",
          message: `You spent ${Math.abs(percentChange).toFixed(0)}% less on ${category?.name || "this category"} compared to last month`,
          metric: percentChange,
        });
      }
    }
  });

  return insights;
}

/**
 * Check budget alerts
 */
function checkBudgetAlerts(
  transactions: Transaction[],
  categories: Category[],
  budgetLimits?: Record<string, number>
): InsightData[] {
  const alerts: InsightData[] = [];

  if (!budgetLimits) {
    return alerts;
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const currentMonthSpending: Record<string, number> = {};

  transactions.forEach((t) => {
    if (
      t.type === TransactionType.EXPENSE &&
      t.date.substring(0, 7) === currentMonth
    ) {
      currentMonthSpending[t.categoryId] =
        (currentMonthSpending[t.categoryId] || 0) + t.amount;
    }
  });

  Object.entries(budgetLimits).forEach(([categoryId, limit]) => {
    const spent = currentMonthSpending[categoryId] || 0;
    const percentage = (spent / limit) * 100;

    if (percentage >= 90) {
      const category = categories.find((c) => c.id === categoryId);
      alerts.push({
        type: "alert",
        severity: "high",
        message: `You've reached ${percentage.toFixed(0)}% of your ${category?.name || "category"} budget`,
        metric: percentage,
      });
    } else if (percentage >= 75) {
      const category = categories.find((c) => c.id === categoryId);
      alerts.push({
        type: "alert",
        severity: "medium",
        message: `You've used ${percentage.toFixed(0)}% of your ${category?.name || "category"} budget`,
        metric: percentage,
      });
    }
  });

  return alerts;
}

/**
 * Generate actionable suggestions
 */
function generateSuggestions(
  transactions: Transaction[],
  categories: Category[]
): InsightData[] {
  const suggestions: InsightData[] = [];

  // Calculate total income and expenses
  const totalIncome = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  // Find largest spending category
  const categorySpending: Record<string, number> = {};
  transactions.forEach((t) => {
    if (t.type === TransactionType.EXPENSE) {
      categorySpending[t.categoryId] =
        (categorySpending[t.categoryId] || 0) + t.amount;
    }
  });

  const topCategory = Object.entries(categorySpending).sort(
    ([, a], [, b]) => b - a
  )[0];

  if (topCategory) {
    const category = categories.find((c) => c.id === topCategory[0]);
    const percentage = (topCategory[1] / totalExpense) * 100;

    if (percentage > 40) {
      suggestions.push({
        type: "suggestion",
        message: `${category?.name || "Your top category"} accounts for ${percentage.toFixed(0)}% of your spending. Consider setting a budget limit.`,
        metric: percentage,
      });
    }
  }

  // Savings rate suggestion
  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;

    if (savingsRate < 20) {
      suggestions.push({
        type: "suggestion",
        message: `Your savings rate is ${Math.abs(savingsRate).toFixed(0)}%. Try to save at least 20% of your income.`,
        metric: savingsRate,
      });
    } else if (savingsRate > 30) {
      suggestions.push({
        type: "suggestion",
        message: `Great! Your savings rate is ${savingsRate.toFixed(0)}%. Keep it up!`,
        metric: savingsRate,
      });
    }
  }

  return suggestions;
}

/**
 * Get insight icon based on type
 */
export function getInsightIcon(
  type: "pattern" | "alert" | "suggestion"
): string {
  switch (type) {
    case "alert":
      return "AlertCircle";
    case "pattern":
      return "TrendingDown";
    case "suggestion":
      return "Lightbulb";
    default:
      return "Info";
  }
}

/**
 * Get insight color based on severity
 */
export function getInsightColor(
  severity?: "low" | "medium" | "high"
): string {
  switch (severity) {
    case "high":
      return "bg-destructive/10 border-destructive";
    case "medium":
      return "bg-warning/10 border-warning";
    case "low":
      return "bg-blue-50 border-blue-200";
    default:
      return "bg-muted";
  }
}
