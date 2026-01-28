'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Prediction } from "@/lib/types";
import { BrainCircuit, Flame, Pin } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';


export function PredictionCard({ prediction }: { prediction: Prediction | null }) {
    if (!prediction) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-primary"/>
                        Tomorrow’s Demand
                    </CardTitle>
                    <CardDescription>AI-powered prediction</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                        <p>Not enough data to generate prediction.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const [topService] = prediction.topService;
    const [topArea] = prediction.topArea;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary"/>
                    Tomorrow’s Demand
                </CardTitle>
                <CardDescription>AI prediction based on the last {prediction.basedOnDays} days.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-md">
                        <Flame className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Most Requested Service</p>
                        <p className="font-bold text-lg capitalize">{topService}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="bg-accent/20 p-2 rounded-md">
                        <Pin className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Hottest Area</p>
                        <p className="font-bold text-lg capitalize">{topArea}</p>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                    Last updated {formatDistanceToNow(new Date(prediction.generatedAt), { addSuffix: true })}.
                </p>
            </CardContent>
        </Card>
    )
}
