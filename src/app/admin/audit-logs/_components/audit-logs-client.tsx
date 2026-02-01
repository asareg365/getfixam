'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// This interface must match the one in page.tsx
interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface AuditLogsClientProps {
  logs: AuditLog[];
  uniqueActions: string[];
  uniqueTargetTypes: string[];
}

const LOGS_PER_PAGE = 15;

export default function AuditLogsClient({ logs: initialLogs, uniqueActions, uniqueTargetTypes }: AuditLogsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && to) return { from: new Date(from), to: new Date(to) };
    return undefined;
  });

  // Use a controlled component for the search input
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const handleFilterChange = (filterName: 'action' | 'targetType', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(filterName);
    } else {
      params.set(filterName, value);
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
        params.set('search', searchQuery);
    } else {
        params.delete('search');
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/admin/audit-logs?${params.toString()}`);
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (date?.from) {
        params.set('from', format(date.from, 'yyyy-MM-dd'));
    } else {
        params.delete('from');
    }
    if (date?.to) {
        params.set('to', format(date.to, 'yyyy-MM-dd'));
    } else {
        params.delete('to');
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/admin/audit-logs?${params.toString()}`, { scroll: false });
  }, [date, router, searchParams]);


  const ActionBadge = ({ action }: { action: string }) => {
     let variant: "default" | "destructive" | "success" | "secondary" | "outline" | null | undefined = "secondary";
     if (action.includes('APPROVE') || action.includes('UNLOCKED')) variant = 'success';
     if (action.includes('REJECT') || action.includes('SUSPEND') || action.includes('DELETE') || action.includes('FAILED') || action.includes('LOCKED')) variant = 'destructive';
     if (action.includes('ADD') || action.includes('CREATE') || action.includes('SUCCESS')) variant = 'default';
     return <Badge variant={variant}>{action.replace(/_/g, ' ')}</Badge>
  }

  // Pagination logic now works on the logs passed via props
  const totalPages = Math.ceil(initialLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = initialLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  );

  return (
    <div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1">
                <Input
                    placeholder="Search by email or target ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </form>
            <div className="flex flex-wrap items-center gap-2">
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                <Select value={searchParams.get('targetType') || 'all'} onValueChange={(value) => handleFilterChange('targetType', value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by Target Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Target Types</SelectItem>
                        {uniqueTargetTypes.map(opt => <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={searchParams.get('action') || 'all'} onValueChange={(value) => handleFilterChange('action', value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by Action" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="all">All Actions</SelectItem>
                        {uniqueActions.map(opt => <SelectItem key={opt} value={opt} className="capitalize">{opt.replace(/_/g, ' ')}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead className="w-[250px]">User Agent</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.adminEmail}</TableCell>
                  <TableCell>
                    <ActionBadge action={log.action} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <div className="capitalize">{log.targetType}</div>
                    <div className="text-muted-foreground">{log.targetId}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate">{log.userAgent}</TableCell>
                  <TableCell>{log.createdAt}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No logs found for the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Next
            </Button>
        </div>
      )}
    </div>
  );
}
