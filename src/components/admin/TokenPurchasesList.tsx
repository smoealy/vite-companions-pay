import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { listenToTokenPurchases } from '@/utils/firestoreService';
import { exportToCSV } from '@/utils/exportCSV';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface TokenPurchase {
  id: string;
  amountUsd: number;
  tokenAmount: number;
  timestamp: any;
  email?: string;
  status: string;
  paymentMethod: string;
  walletAddress?: string;
}

const TokenPurchasesList: React.FC = () => {
  const [purchases, setPurchases] = useState<TokenPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    const unsubscribe = listenToTokenPurchases((data: TokenPurchase[]) => {
      setPurchases(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const formatStatus = (status: string) => {
    const normalized = status.toLowerCase();
    const baseClass = "px-2 py-1 text-xs rounded-full";
    if (normalized === 'success' || normalized === 'completed') {
      return <span className={`${baseClass} bg-cp-green-100 text-cp-green-700`}>Completed</span>;
    } else if (normalized === 'pending') {
      return <span className={`${baseClass} bg-cp-amber-100 text-cp-amber-700`}>Pending</span>;
    } else if (normalized === 'failed') {
      return <span className={`${baseClass} bg-cp-red-100 text-cp-red-700`}>Failed</span>;
    } else {
      return <span className={`${baseClass} bg-cp-neutral-100 text-cp-neutral-700`}>{status}</span>;
    }
  };

  const filtered = purchases.filter(p =>
    (!searchQuery || p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || p.status.toLowerCase() === statusFilter) &&
    (methodFilter === 'all' || p.paymentMethod.toLowerCase() === methodFilter)
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const exportCSV = () => {
    const headers = ['Date', 'Amount (USD)', 'Tokens', 'Email/Wallet', 'Method', 'Status'];
    const rows = filtered.map(p => [
      formatDate(p.timestamp),
      p.amountUsd.toFixed(2),
      p.tokenAmount.toFixed(2),
      p.email || p.walletAddress || 'N/A',
      p.paymentMethod,
      p.status
    ]);
    exportToCSV([headers, ...rows], `token-purchases-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div>
      {/* Filters */}
      <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <input
          type="text"
          placeholder="Search by email, wallet, method..."
          className="w-full lg:w-80 px-4 py-2 text-sm border border-cp-neutral-200 rounded-md"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="success">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Payment Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
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
      </div>

      {/* Table */}
      <div className="border-t">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-4" />
                <Skeleton className="flex-grow h-4" />
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
                  <TableHead>Amount</TableHead>
                  <TableHead>Email/Wallet</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{formatDate(p.timestamp)}</TableCell>
                    <TableCell>
                      ${p.amountUsd.toLocaleString()}
                      <div className="text-xs text-cp-neutral-500">{p.tokenAmount.toLocaleString()} IHRAM</div>
                    </TableCell>
                    <TableCell className="truncate max-w-xs">{p.email || p.walletAddress || 'Anonymous'}</TableCell>
                    <TableCell className="capitalize">{p.paymentMethod}</TableCell>
                    <TableCell>{formatStatus(p.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-cp-neutral-500">
            <p>No purchases found</p>
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

export default TokenPurchasesList;
