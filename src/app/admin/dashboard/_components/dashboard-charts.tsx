'use client';

import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

type ChartData = {
  name: string;
  total: number;
}[];

type DashboardChartsProps = {
  serviceData: ChartData;
  locationData: ChartData;
}

const serviceChartConfig = {
  requests: {
    label: 'Requests',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function DashboardCharts({ serviceData, locationData }: DashboardChartsProps) {
  const locationChartConfig: ChartConfig = Object.fromEntries(
    locationData.map((item, index) => [
      item.name.toLowerCase().replace(/\s/g, ''), { label: item.name, color: COLORS[index % COLORS.length] }
    ])
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Requests by Service</CardTitle>
          <CardDescription>A breakdown of user requests per service category.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={serviceChartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={serviceData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="total" fill="var(--color-requests)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Requests by Location</CardTitle>
          <CardDescription>A breakdown of user requests per zone in Berekum.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={locationChartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={locationData} dataKey="total" nameKey="name" innerRadius={60}>
                 {locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
               <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
