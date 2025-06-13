import React, { useEffect, useState } from 'react';
import { listenToImpactLogs, ImpactLog, ImpactAction } from '@/utils/firestoreService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { exportToCSV } from '@/utils/exportCSV';

const ACTION_OPTIONS: { value: 'all' | ImpactAction; label: string }[] = [
  { value: 'all', label: 'All Actions' },
  { value: 'tree', label: 'Plant a Tree' },
  { value: 'water', label: 'Gift Water' },
  { value: 'quran', label: 'Gift Quran' },
  { value: 'wheelchair', label: 'Donate Wheelchair' },
  { value: 'badal', label: 'Umrah Badal' },
  { value: 'qurbani', label: 'Qurbani' },
];

const ImpactLogsList: React.FC = () => {
  const [logs, setLogs] = useState<(ImpactLog & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | ImpactAction>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const unsubscribe = listenToImpactLogs((data) => {
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatDate = (ts: any) => {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
  };

  const filtered = logs.filter(log => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSearch = searchQuery ? (log.email || '').toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesAction && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const exportCsv = () => {
    const headers = ['Date', 'Action', 'Amount', 'Email', 'User ID'];
    const csvData = filtered.map(l => [formatDate(l.timestamp), l.action, l.amount.toString(), l.email || '', l.userId]);
    exportToCSV(csvData, 'impact_logs', headers);
  };

  return (
    <div>
      <div className="px-4 py-3 flex flex-col sm:flex-row justify-between gap-3">
        <input
          type="text"
          placeholder="Search by email..."
          className="w-full sm:w-64 px-4 py-2 text-sm border border-cp-neutral-200 rounded-md"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
        />
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v as any); setCurrentPage(1); }}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" disabled={loading || filtered.length === 0} onClick={exportCsv}>Export CSV</Button>
      </div>
      <div className="border-t">
        {loading ? (
          <div className="p-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="flex gap-4 py-3"><Skeleton className="w-24 h-4" /><Skeleton className="w-20 h-4" /></div>)}
          </div>
        ) : paginated.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>User ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell className="capitalize">{log.action}</TableCell>
                    <TableCell>{log.amount.toLocaleString()} IC</TableCell>
                    <TableCell className="truncate max-w-xs">{log.email}</TableCell>
                    <TableCell className="text-xs text-cp-neutral-500">{log.userId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-cp-neutral-500">No records found</div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-4">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
          <span className="text-sm font-medium px-2">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default ImpactLogsList;
