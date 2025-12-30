'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

type StreakChartProps = {
  data: { date: string; progress: number }[];
};

const chartConfig = {
  progress: {
    label: 'Progress (min)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function StreakChart({ data }: StreakChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>30-Day Progress</CardTitle>
        <CardDescription>Your learning activity over the last month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(`${value} ${new Date().getFullYear()}`);
                if (date.getDate() === 1) {
                  return date.toLocaleDateString('en-US', { month: 'short' });
                }
                return date.toLocaleDateString('en-US', { day: 'numeric' });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft', offset: -5 }}
            />
             <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
