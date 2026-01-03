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
import { useMemo } from 'react';

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
  const yAxisDomain = useMemo(() => {
    const maxProgress = Math.max(...data.map(item => item.progress), 0);
    const topValue = Math.max(1, Math.ceil(maxProgress * 1.2)); // Ensure domain is at least 1, with a 20% buffer
    return [0, topValue];
  }, [data]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Your learning activity.</CardDescription>
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
              domain={yAxisDomain}
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
