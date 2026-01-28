'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HeatmapData = {
    name: string;
    total: number;
}[];

type HeatmapListProps = {
    data: HeatmapData;
};

function getHeatClasses(count: number, maxCount: number): string {
    const percentage = maxCount > 0 ? count / maxCount : 0;

    if (percentage > 0.75) {
        return "bg-[hsl(var(--chart-1))]/80 border-[hsl(var(--chart-1))] text-white";
    }
    if (percentage > 0.5) {
        return "bg-[hsl(var(--chart-5))]/80 border-[hsl(var(--chart-5))] text-white";
    }
    if (percentage > 0.25) {
        return "bg-[hsl(var(--chart-4))]/70 border-[hsl(var(--chart-4))] text-foreground";
    }
    if (percentage > 0) {
        return "bg-[hsl(var(--chart-2))]/70 border-[hsl(var(--chart-2))] text-white";
    }
    return "bg-muted border-border text-muted-foreground";
}

export function HeatmapList({ data }: HeatmapListProps) {
    const sortedData = [...data].sort((a, b) => b.total - a.total);
    const maxCount = sortedData.length > 0 ? sortedData[0].total : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Demand Heatmap</CardTitle>
                <CardDescription>Top requested zones in Berekum based on bot requests.</CardDescription>
            </CardHeader>
            <CardContent>
                {sortedData.length === 0 ? (
                     <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                        <p>No location data available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sortedData.map(({ name, total }) => (
                            <div key={name} className={`flex justify-between items-center p-3 rounded-lg border transition-all ${getHeatClasses(total, maxCount)}`}>
                                <span className="font-medium text-base">{name}</span>
                                <span className="font-bold text-xl">{total}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
