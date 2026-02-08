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
        return "bg-primary/80 border-primary text-white";
    }
    if (percentage > 0.5) {
        return "bg-secondary/80 border-secondary text-white";
    }
    if (percentage > 0.25) {
        return "bg-muted border-border text-foreground";
    }
    return "bg-muted/50 border-border text-muted-foreground";
}

export function HeatmapList({ data }: HeatmapListProps) {
    const sortedData = [...data].sort((a, b) => b.total - a.total);
    const maxCount = sortedData.length > 0 ? sortedData[0].total : 0;

    return (
        <Card className="border-none shadow-sm rounded-3xl">
            <CardHeader>
                <CardTitle className="font-headline">Demand Heatmap</CardTitle>
                <CardDescription>Top requested zones based on platform interactions.</CardDescription>
            </CardHeader>
            <CardContent>
                {sortedData.length === 0 ? (
                     <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-[20px]">
                        <p>No location data available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sortedData.map(({ name, total }) => (
                            <div key={name} className={`flex justify-between items-center p-4 rounded-xl border transition-all ${getHeatClasses(total, maxCount)}`}>
                                <span className="font-bold text-base">{name}</span>
                                <span className="font-black text-xl">{total}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}