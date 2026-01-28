'use client';
import type { Provider } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { approveProvider, rejectProvider } from '@/app/admin/actions';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2, MoreHorizontal, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ManageFeatureDialog } from './manage-feature-dialog';

function ActionButton({ action, children, variant = 'ghost' }: { action: any; children: React.ReactNode, variant?: "ghost" | "link" | "default" | "destructive" | "outline" | "secondary" | null | undefined }) {
    const { pending } = useFormStatus();
    return <Button variant={variant} size="icon" type="submit" disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : children}</Button>;
}

function ProviderActions({ provider }: { provider: Provider }) {
    const { toast } = useToast();
    
    const [approveState, approveAction] = useActionState(approveProvider, { success: false, error: undefined, message: undefined });
    const [rejectState, rejectAction] = useActionState(rejectProvider, { success: false, error: undefined, message: undefined });

    useEffect(() => {
        if (approveState.error) toast({ title: 'Error', description: approveState.error, variant: 'destructive' });
        if (approveState.message) toast({ title: 'Success', description: approveState.message });
        if (rejectState.error) toast({ title: 'Error', description: rejectState.error, variant: 'destructive' });
        if (rejectState.message) toast({ title: 'Success', description: rejectState.message });
    }, [approveState, rejectState, toast]);

    if (provider.status === 'pending') {
        return (
            <div className="flex gap-1">
                <form action={approveAction}>
                    <input type="hidden" name="providerId" value={provider.id} />
                    <Button type="submit" size="sm" variant="outline" className="h-8 border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700">
                        <Check className="mr-2 h-4 w-4" /> Approve
                    </Button>
                </form>
                <form action={rejectAction}>
                    <input type="hidden" name="providerId" value={provider.id} />
                    <Button type="submit" size="sm" variant="outline" className="h-8 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700">
                        <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                </form>
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <ManageFeatureDialog provider={provider}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Star className="mr-2 h-4 w-4" /> Manage Feature
                    </DropdownMenuItem>
                </ManageFeatureDialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Suspend</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function ProvidersTable({ providers }: { providers: Provider[] }) {
    if (providers.length === 0) {
        return <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">No providers found for this status.</div>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {providers.map(provider => (
                        <TableRow key={provider.id}>
                            <TableCell className="font-medium">
                                <div className='flex items-center gap-2'>
                                    {provider.isFeatured && <Star className="h-4 w-4 text-accent" fill="currentColor" />}
                                    <div className='flex flex-col'>
                                        <span>{provider.name}</span>
                                        <span className="text-xs text-muted-foreground">{provider.phone}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{provider.category}</TableCell>
                            <TableCell>{provider.location.zone}, {provider.location.city}</TableCell>
                            <TableCell>{format(new Date(provider.createdAt), "dd MMM yyyy")}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    provider.status === 'approved' ? 'default' :
                                    provider.status === 'pending' ? 'secondary' :
                                    provider.status === 'rejected' ? 'destructive' : 'outline'
                                }
                                className={cn(provider.status === 'approved' && 'bg-green-600 hover:bg-green-700')}
                                >
                                    {provider.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <ProviderActions provider={provider} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
