'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export function ProviderTabs({ currentStatus }: { currentStatus: string }) {
    return (
        <Tabs value={currentStatus} className="mb-4">
            <TabsList>
                <TabsTrigger value="pending" asChild>
                    <Link href="/admin/providers?status=pending">Pending</Link>
                </TabsTrigger>
                <TabsTrigger value="approved" asChild>
                    <Link href="/admin/providers?status=approved">Approved</Link>
                </TabsTrigger>
                <TabsTrigger value="rejected" asChild>
                    <Link href="/admin/providers?status=rejected">Rejected</Link>
                </TabsTrigger>
                <TabsTrigger value="suspended" asChild>
                    <Link href="/admin/providers?status=suspended">Suspended</Link>
                </TabsTrigger>
                <TabsTrigger value="all" asChild>
                    <Link href="/admin/providers?status=all">All</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
