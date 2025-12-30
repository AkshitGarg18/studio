'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { ProgressEntry } from '@/lib/types';

type SubjectPerformanceChartProps = {
  progressHistory: ProgressEntry[];
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function SubjectPerformanceChart({ progressHistory }: SubjectPerformanceChartProps) {
  const subjectData = React.useMemo(() => {
    const dataMap = new Map<string, number>();
    progressHistory.forEach(entry => {
      dataMap.set(entry.subject, (dataMap.get(entry.subject) || 0) + entry.progress);
    });
    return Array.from(dataMap.entries()).map(([subject, hours]) => ({
      name: subject,
      value: hours,
    }));
  }, [progressHistory]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    subjectData.forEach((data, index) => {
        config[data.name] = {
            label: data.name,
            color: COLORS[index % COLORS.length],
        }
    });
    return config;
  }, [subjectData])

  if (subjectData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Your study time distribution.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
                <p>No subject data yet. Log your progress to see your performance!</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Performance</CardTitle>
        <CardDescription>Your study time distribution across subjects.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <PieChart>
            <Tooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={subjectData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
