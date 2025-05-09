import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { listenToTokenPurchases } from '@/utils/firestoreService';
import { exportToCSV } from '@/utils/exportCSV';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationEnabled] = useState(true); // toggle if needed
  const perPage = 5;

  useEffect(() => {
    const unsubscribe = listenToTokenPurchases((data: TokenPurchase[]) => {
      setPurchases(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const formatStatus = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <span className="px-2 py-1 text-xs rounded-full bg-cp-green-100 text-cp-green-700">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-cp-amber-100 text-cp-amber-700">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-cp-red-100 text-cp-red-700">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-cp-neutral-100 text-cp-neutral-700">{status}</span>;
    }
  };

  const filteredPurchases = searchQuery 
    ? purchases.filter(purchase => 
        purchase.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : purchases;

  const totalPages = Math.ceil(filteredPurchases.length / perPage);
  const paginatedPurchases = paginationEnabled
    ? filteredPurchases.slice((currentPage - 1) * perPage, currentPage * perPage)
    : filteredPurchases;

  const exportCSV = () => {
    if (filteredPurchases.length === 0) return;
    const headers = ['Date', 'Amount (USD)', 'Tokens', 'Email/Wallet', 'Method', 'Status'];
    const csvData = filteredPurchases.map(purchase => [
      formatDate(purchase.timestamp),
      purchase.amountUsd.toFixed(2),
      purchase.tokenAmount.toFixed(2),
      purchase.email || purchase.walletAddress || 'N/A',
      purchase.paymentMethod,
      purchase.status
    ]);
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `token-purchases-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Search and Export */}
      <div className="px-4 py-3 flex flex-col sm:flex-row justify-between gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by email, wallet or payment method..."
            className="w-full sm:w-80 px-4 py-2 text-sm border border-cp-neutral-200 rounded-md"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || filteredPurchases.length === 0}
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
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 py-3">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-4" />
                <Skeleton className="flex-grow h-4" />
                <Skeleton className="w-20 h-4" />
              </div>
            ))}
          </div>
        ) : paginatedPurchases.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Email/Wallet</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="text-sm">{formatDate(purchase.timestamp)}</TableCell>
                    <TableCell className="font-medium">
                      ${purchase.amountUsd.toLocaleString()} 
                      <span className="text-xs text-cp-neutral-500 block">
                        {purchase.tokenAmount?.toLocaleString()} IHRAM
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {purchase.email || purchase.walletAddress || 'Anonymous'}
                    </TableCell>
                    <TableCell className="text-sm capitalize">{purchase.paymentMethod}</TableCell>
                    <TableCell>{formatStatus(purchase.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-cp-neutral-500">
            <p>No token purchases found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try adjusting your search query</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginationEnabled && totalPages > 1 && (
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
