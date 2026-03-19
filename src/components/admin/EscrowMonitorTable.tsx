'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type EscrowStatus = 'funded' | 'locked' | 'released' | 'disputed' | 'awaiting_release';

interface Engagement {
    id: string;
    provider: string;
    jobAmount: number;
    escrowStatus: EscrowStatus;
    providerName?: string;
    daysLocked?: number;
}

const getAuthToken = () => localStorage.getItem('authToken');

const statusColors: Record<EscrowStatus, string> = {
    funded: 'bg-blue-500',
    locked: 'bg-yellow-500',
    released: 'bg-green-500',
    disputed: 'bg-red-500',
    awaiting_release: 'bg-orange-500',
};

export function EscrowMonitorTable() {
    const [status, setStatus] = useState<EscrowStatus>('funded');
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [releasing, setReleasing] = useState<string | null>(null);

    const fetchEngagements = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getAuthToken();
            if (!token) throw new Error('Authentication token not found.');

            const response = await fetch(`/api/admin/engagements?status=${status}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(`Failed to fetch engagements: ${response.statusText}`);
            
            const data: Engagement[] = await response.json();
            setEngagements(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEngagements();
    }, [status]);

    const handleRelease = async (engagementId: string) => {
        setReleasing(engagementId);
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication token not found.');

            // This re-uses the existing payout release endpoint
            const response = await fetch('/api/payouts/release', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ engagementId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to release payment.');
            }

            alert('Funds released successfully!');
            fetchEngagements(); // Refresh the data
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setReleasing(null);
        }
    };

    const renderTableContent = () => {
        if (loading) {
            return <div className="space-y-2 mt-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
        }
        if (error) {
            return <p className="text-red-500 text-center py-4">Error: {error}</p>;
        }
        if (engagements.length === 0) {
            return <p className="text-center text-muted-foreground py-4">No engagements found with status: {status}</p>;
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Amount</TableHead>
                        {status === 'awaiting_release' && <TableHead>Days Locked</TableHead>}
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {engagements.map((engagement) => (
                        <TableRow key={engagement.id}>
                            <TableCell className="font-mono">{engagement.id.substring(0, 10)}...</TableCell>
                            <TableCell>{engagement.providerName || 'N/A'}</TableCell>
                            <TableCell>{`GHS ${engagement.jobAmount.toFixed(2)}`}</TableCell>
                            {status === 'awaiting_release' && <TableCell>{engagement.daysLocked ?? 'N/A'} days</TableCell>}
                            <TableCell>
                                <Badge className={`${statusColors[engagement.escrowStatus]}`}>{engagement.escrowStatus}</Badge>
                            </TableCell>
                            <TableCell>
                                {status === 'awaiting_release' ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" disabled={releasing === engagement.id}>
                                                {releasing === engagement.id ? 'Releasing...' : 'Release Funds'}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will release the funds from escrow to the provider. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleRelease(engagement.id)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                ) : (
                                    <Button variant="outline" size="sm">View</Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Escrow Monitor</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="funded" onValueChange={(value) => setStatus(value as EscrowStatus)}>
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="funded">Funded</TabsTrigger>
                        <TabsTrigger value="locked">Locked</TabsTrigger>
                        <TabsTrigger value="awaiting_release">Awaiting Release</TabsTrigger>
                        <TabsTrigger value="released">Released</TabsTrigger>
                        <TabsTrigger value="disputed">Disputed</TabsTrigger>
                    </TabsList>
                    <TabsContent value={status} className="mt-4">
                        {renderTableContent()}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
