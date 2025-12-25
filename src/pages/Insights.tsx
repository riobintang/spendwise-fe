import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Transaction,
  TransactionsResponse,
  Category,
} from "@shared/api";
import {
  generateInsights,
  getInsightIcon,
  getInsightColor,
  type InsightData,
} from "@/utils/insights";
import {
  AlertCircle,
  TrendingDown,
  Lightbulb,
  Info,
  Zap,
} from "lucide-react";

const iconMap = {
  AlertCircle,
  TrendingDown,
  Lightbulb,
  Info,
  Zap,
};

export default function Insights() {
  // Fetch transactions
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery<
    TransactionsResponse
  >({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/transactions");
      return res.json();
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/categories");
      return res.json();
    },
  });

  const transactions = transactionsData?.transactions || [];
  const categories = categoriesData || [];

  // Generate insights
  const insights = generateInsights(transactions, categories);

  if (isLoadingTransactions) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-muted-foreground">Loading insights...</div>
        </div>
      </Layout>
    );
  }

  const severityOrder = { high: 0, medium: 1, low: 2 };
  const sortedInsights = [...insights].sort((a, b) => {
    const severityA = a.severity ? severityOrder[a.severity] : 3;
    const severityB = b.severity ? severityOrder[b.severity] : 3;
    return severityA - severityB;
  });

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Smart Insights</h1>
          <p className="text-muted-foreground mt-1">
            Personalized spending analysis and recommendations
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{insights.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Alerts and suggestions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Transactions Analyzed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Categories Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Insights</h2>

          {sortedInsights.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-muted-foreground">
                  No insights available. Add more transactions to get started!
                </div>
              </CardContent>
            </Card>
          ) : (
            sortedInsights.map((insight, index) => {
              const IconComponent =
                iconMap[
                  getInsightIcon(insight.type) as keyof typeof iconMap
                ];
              const colorClass = getInsightColor(insight.severity);

              return (
                <Card key={index} className={`border-l-4 ${colorClass}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {IconComponent && (
                          <IconComponent className="w-5 h-5 text-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {insight.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-block px-2 py-1 bg-muted text-xs rounded">
                            {insight.type.charAt(0).toUpperCase() +
                              insight.type.slice(1)}
                          </span>
                          {insight.severity && (
                            <span className="inline-block px-2 py-1 bg-muted text-xs rounded capitalize">
                              {insight.severity}
                            </span>
                          )}
                          {insight.metric !== undefined && (
                            <span className="inline-block px-2 py-1 bg-muted text-xs rounded">
                              {insight.metric.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
