import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllUserActivityLogs } from '@/utils/firestoreService';
import { exportToCSV } from '@/utils/exportCSV';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ActivityType =
  | 'paypal'
  | 'reward'
  | 'redemption'
  | 'donation'
  | 'purchase'
  | 'transfer'
  | 'gift'
  | 'card_load'
  | 'ic_to_it'
  | 'withdrawal';

interface ICActivity {
  id: string;
  userId: string;
  email: string;
  type: ActivityType;
  amount: number;
  timestamp: string;
}

const CreditsList: React.FC = () => {
  const [activities, setActivities] = useState<ICActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityType, setActivityType] = useState<'all' | ActivityType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllUserActivityLogs();
      setActivities(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const filtered = activities.filter(log => {
    const matchesSearch = searchQuery
      ? log.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesType = activityType === 'all' || log.type === activityType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Date', 'Type', 'Amount', 'Email', 'User ID'];
    const csvData = filtered.map(log => [
      formatDate(log.timestamp),
      log.type,
      log.amount.toFixed(2),
      log.email,
      log.userId
    ]);
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ic-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div>
      {/* Filters */}
      <div className="px-4 py-3 flex flex-col sm:flex-row justify-between gap-3">
        <input
          type="text"
          placeholder="Search by email..."
          className="w-full sm:w-64 px-4 py-2 text-sm border border-cp-neutral-200 rounded-md"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Select value={activityType} onValueChange={(val) => {
          setActivityType(val as ActivityType | 'all');
          setCurrentPage(1);
        }}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="reward">Reward</SelectItem>
            <SelectItem value="redemption">Redemption</SelectItem>
            <SelectItem value="donation">Donation</SelectItem>
            <SelectItem value="purchase">Purchase</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="gift">Gift</SelectItem>
            <SelectItem value="card_load">Card Load</SelectItem>
            <SelectItem value="ic_to_it">IC → IT</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || filtered.length === 0}
          onClick={exportCSV}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border-t">
        {isLoading ? (
          <div className="p-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 py-3">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-20 h-4" />
              </div>
            ))}
          </div>
        ) : paginated.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>User ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell className="capitalize">{log.type.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{log.amount.toLocaleString()} IC</TableCell>
                    <TableCell className="truncate max-w-xs">{log.email}</TableCell>
                    <TableCell className="text-xs text-cp-neutral-500">{log.userId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-cp-neutral-500">
            <p>No activity logs found</p>
            {searchQuery && <p className="text-sm mt-1">Try adjusting your filters.</p>}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-4">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            Previous
          </Button>
          <span className="text-sm font-medium px-2">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreditsList;
