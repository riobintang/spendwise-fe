import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  name: string;
  value: number;
  fill?: string;
  color?: string;
  id?: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

const COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#6366f1",
];

export function IncomeExpenseChart({ data }: { data: MonthlyData[] }) {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; fill?: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.fill }}>
              <span className="font-medium">{entry.name}:</span> $
              {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Monthly Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name="Expenses"
              fill="#ef4444"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CategoryChart({
  data,
}: {
  data: ChartData[] & { id?: string; color?: string }[];
}) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; fill?: string; payload?: ChartData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartData & { id?: string };
      const percent = ((payload[0].value / totalValue) * 100).toFixed(1);
      return (
        <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">{percent}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill || entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend - Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {data.length > 0 ? (
              data.map((item, index) => {
                const percent = ((item.value / totalValue) * 100).toFixed(1);
                return (
                  <div
                    key={`legend-${index}`}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            item.fill || item.color || COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm font-medium truncate flex-1">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-end text-xs">
                      <span className="font-semibold">
                        ${item.value.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No category data available
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ExpenseBreakdownChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle>Monthly Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
