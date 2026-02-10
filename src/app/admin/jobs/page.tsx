'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Workflow, Clock, MapPin, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Job } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchJobs() {
            try {
                const jobsRef = collection(db, 'jobs');
                const q = query(jobsRef, orderBy('createdAt', 'desc'));
                
                const snap = await getDocs(q).catch(async (err) => {
                    if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
                        const permissionError = new FirestorePermissionError({
                            path: jobsRef.path,
                            operation: 'list',
                        } satisfies SecurityRuleContext);
                        errorEmitter.emit('permission-error', permissionError);
                        return null;
                    }
                    throw err;
                });

                if (!snap) {
                    setLoading(false);
                    return;
                }

                const jobsData = snap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt?.toDate()?.toLocaleString() || '—',
                    } as any;
                });
                setJobs(jobsData);
            } catch (err) {
                // Non-permission errors handled silently
            } finally {
                setLoading(false);
            }
        }
        fetchJobs();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black font-headline tracking-tight">Live Operations</h1>
                    <p className="text-muted-foreground text-lg mt-1">Real-time monitoring of all active service requests.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input className="w-full h-12 pl-10 pr-4 rounded-2xl border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Filter jobs..." />
                </div>
            </div>

            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                <CardHeader className="p-8 border-b bg-muted/10">
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Workflow className="h-5 w-5 text-primary" />
                        Active Job Stream
                    </CardTitle>
                    <CardDescription>A live feed of assignments and status changes.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {jobs.length > 0 ? (
                        <div className="divide-y">
                        {jobs.map(job => (
                            <div key={job.id} className="p-6 hover:bg-muted/5 transition-colors group">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{job.serviceType}</h3>
                                            <Badge variant="secondary" className="rounded-md uppercase text-[10px] font-black">{job.status}</Badge>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {job.area}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {job.createdAt}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold">ID: {job.id.slice(0, 8)}</div>
                                        <p className="text-xs text-muted-foreground">Assigned to: {job.assignedTo || 'Unassigned'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center space-y-4">
                            <div className="bg-muted/30 p-6 rounded-full inline-block">
                                <Workflow className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                            <h2 className="text-xl font-bold">No Active Jobs</h2>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Once customers start placing requests, they will appear here in real-time.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
