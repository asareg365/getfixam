'use client';
    
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type StandbyPrediction } from "@/lib/types";
import { Flame, List, Pin, UserCheck } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export function StandbyCard({ standby }: { standby: StandbyPrediction | null }) {

    if (!standby) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary"/>
                        Tomorrow’s Standby Pool
                    </CardTitle>
                    <CardDescription>AI-generated standby team for predicted demand.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
                        <p>No standby team generated for tomorrow.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary"/>
                    Tomorrow’s Standby Pool
                </CardTitle>
                <CardDescription>Generated {formatDistanceToNow(new Date(standby.generatedAt), { addSuffix: true })}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-md">
                            <Flame className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Predicted Service</p>
                            <p className="font-bold text-lg capitalize">{standby.serviceType}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-accent/20 p-2 rounded-md">
                            <Pin className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Predicted Hotspot</p>
                            <p className="font-bold text-lg capitalize">{standby.area}</p>
                        </div>
                    </div>
                </div>
                    <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><List className="h-4 w-4"/> Standby Artisans</h4>
                    <ul className="space-y-2">
                        {standby.artisans.map(artisan => (
                            <li key={artisan.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                <span>{artisan.name}</span>
                                <span className="text-xs text-muted-foreground">{artisan.phone}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
