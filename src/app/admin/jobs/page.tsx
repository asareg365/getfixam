'use server';

import { requireAdmin } from '@/lib/admin-guard';
import { adminDb } from '@/lib/firebase-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Job } from '@/lib/types';

async function getJobs(): Promise<Job[]> {
    const jobsSnap = await adminDb.collection('jobs').orderBy('createdAt', 'desc').get();
    if (jobsSnap.empty) {
        return [];
    }
    return jobsSnap.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            serviceType: data.serviceType ?? 'N/A',
            area: data.area ?? 'N/A',
            status: data.status ?? 'unknown',
            assignedTo: data.assignedTo ?? '',
            attemptedArtisans: data.attemptedArtisans ?? [],
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date(0).toISOString(),
            expiresAt: data.expiresAt ? data.expiresAt.toDate().toISOString() : new Date(0).toISOString(),
            price: data.price ?? undefined,
            surgeMultiplier: data.surgeMultiplier ?? undefined,
        }
    })
}

export default async function JobsPage() {
    await requireAdmin();
    const jobs = await getJobs();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Live Job Monitoring</h1>
                    <p className="text-muted-foreground">Track service requests and reassignments in real-time.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Job Status</CardTitle>
                    <CardDescription>A live view of jobs as they are assigned, accepted, or rejected.</CardDescription>
                </CardHeader>
                <CardContent>
                    {jobs.length > 0 ? (
                        <ul className="space-y-2">
                        {jobs.map(job => (
                            <li key={job.id} className="p-3 border rounded-md text-sm">
                                <div className="flex justify-between">
                                    <span className="font-semibold">{job.serviceType} in {job.area}</span>
                                    <span className="font-mono text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="text-muted-foreground">Status: <span className="text-foreground font-medium">{job.status}</span></div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <div className="border-2 border-dashed rounded-lg p-12 text-center">
                            <h2 className="text-xl font-semibold">Live Job Engine Coming Soon</h2>
                            <p className="mt-2 text-muted-foreground">
                                This is where you'll see a list of all active jobs and be able to monitor the reassignment engine.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
