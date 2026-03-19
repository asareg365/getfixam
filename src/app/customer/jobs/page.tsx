'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Engagement {
    id: string;
    jobTitle: string;
    jobAmount: number;
    jobStatus: string;
    escrowStatus: string;
    providerName: string;
    createdAt: string;
}

const getAuthToken = () => localStorage.getItem('authToken');

export default function CustomerJobsPage() {
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirming, setConfirming] = useState<string | null>(null);

    const fetchEngagements = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            if (!token) throw new Error('You must be logged in.');

            const response = await fetch('/api/customer/engagements', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.statusText}`);

            const data = await response.json();
            setEngagements(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEngagements();
    }, []);

    const handleConfirmCompletion = async (engagementId: string) => {
        setConfirming(engagementId);
        try {
            const token = getAuthToken();
            if (!token) throw new Error('Authentication failed.');

            const response = await fetch(`/api/engagements/${engagementId}/confirm-completion`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to confirm job completion.');
            }

            alert('Job completion confirmed! The funds have been released to the provider.');
            fetchEngagements(); // Refresh the list
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setConfirming(null);
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>;
        }

        if (error) {
            return <p className="text-red-500 text-center py-4">{error}</p>;
        }

        if (engagements.length === 0) {
            return <p className="text-center text-muted-foreground py-8">You have no active jobs.</p>;
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {engagements.map((job) => (
                        <TableRow key={job.id}>
                            <TableCell>
                                <div className="font-medium">{job.jobTitle}</div>
                                <div className="text-sm text-muted-foreground">{new Date(job.createdAt).toLocaleDateString()}</div>
                            </TableCell>
                            <TableCell>{job.providerName}</TableCell>
                            <TableCell><Badge variant={job.jobStatus === 'awaiting_confirmation' ? 'destructive' : 'default'}>{job.jobStatus.replace('_', ' ')}</Badge></TableCell>
                            <TableCell>GHS {job.jobAmount.toFixed(2)}</TableCell>
                            <TableCell>
                                {job.jobStatus === 'awaiting_confirmation' && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" disabled={confirming === job.id}>
                                                {confirming === job.id ? 'Confirming...' : 'Confirm Completion'}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Confirming completion will release the payment to the provider. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleConfirmCompletion(job.id)}>Confirm</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Jobs</CardTitle>
                <CardDescription>An overview of all your engagements with service providers.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
