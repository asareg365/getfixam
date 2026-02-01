'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
}

const LOGS_PER_PAGE = 15;

export default function AuditLogsClient({ logs: initialLogs }: AuditLogsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    targetType: 'all',
    action: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  
  const actionOptions = useMemo(() => ['all', ...Array.from(new Set(initialLogs.map(log => log.action).filter(Boolean)))], [initialLogs]);
  const targetTypeOptions = useMemo(() => ['all', ...Array.from(new Set(initialLogs.map(log => log.targetType).filter(Boolean)))], [initialLogs]);

  const filteredLogs = useMemo(() => {
    return initialLogs.filter(log => {
      const searchMatch = !searchQuery ||
        log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.targetId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const targetTypeMatch = filters.targetType === 'all' || log.targetType === filters.targetType;
      const actionMatch = filters.action === 'all' || log.action === filters.action;

      return searchMatch && targetTypeMatch && actionMatch;
    });
  }, [initialLogs, searchQuery, filters]);
  
  const totalPages = Math.ceil(filteredLogs.length / LOGS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  );
  
  const handleFilterChange = (filterName: 'targetType' | 'action', value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };
  
   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const ActionBadge = ({ action }: { action: string }) => {
     let variant: "default" | "destructive" | "success" | "secondary" | "outline" | null | undefined = "secondary";
     if (action.includes('approve')) variant = 'success';
     if (action.includes('reject') || action.includes('suspend') || action.includes('delete')) variant = 'destructive';
     if (action.includes('add') || action.includes('create')) variant = 'default';
     return <Badge variant={variant}>{action}</Badge>
  }

  return (
    <div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
                placeholder="Search by email or target ID..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="max-w-sm"
            />
            <div className="flex gap-4">
                <Select value={filters.targetType} onValueChange={(value) => handleFilterChange('targetType', value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Target Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {targetTypeOptions.map(opt => <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Action" />
                    </SelectTrigger>
                    <SelectContent>
                        {actionOptions.map(opt => <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>)}
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
