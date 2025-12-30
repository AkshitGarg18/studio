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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ChartData = { date: string; progress: number }[];

type StreakChartProps = {
  data7Days: ChartData;
  data30Days: ChartData;
};

const chartConfig = {
  progress: {
    label: 'Progress (min)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

function Chart({ data, period }: { data: ChartData, period: '7d' | '30d' }) {
  return (
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
             if (period === '7d') {
              return date.toLocaleDateString('en-US', { weekday: 'short' });
            }
            if (period === '30d') {
              if (date.getDate() === 1) {
                return date.toLocaleDateString('en-US', { month: 'short' });
              }
              return date.toLocaleDateString('en-US', { day: 'numeric' });
            }
            return value;
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
  );
}

export function StreakChart({ data7Days, data30Days }: StreakChartProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Progress Report</CardTitle>
          <CardDescription>Your learning activity over time.</CardDescription>
        </div>
        <Tabs defaultValue="30d" className="w-auto">
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="30d">
          <TabsContent value="30d" className="mt-0">
            <Chart data={data30Days} period="30d" />
          </TabsContent>
          <TabsContent value="7d" className="mt-0">
            <Chart data={data7Days} period="7d" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
