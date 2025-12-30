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
import { parseISO, format } from 'date-fns';

type ChartData = { date: string; progress: number }[];

type StreakChartProps = {
  data: ChartData;
  title: string;
  dateFormat: 'eee' | 'dd';
};

const chartConfig = {
  progress: {
    label: 'Progress (hrs)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function StreakChart({ data, title, dateFormat }: StreakChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Your learning activity over the last week.</CardDescription>
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
                const date = parseISO(value);
                return format(date, dateFormat);
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: -5 }}
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
