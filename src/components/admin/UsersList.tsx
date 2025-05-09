import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToCSV } from '@/utils/exportCSV';
import { getAllUsersWithBalances } from '@/utils/firestoreService';

interface UserRecord {
  id: string;
  email?: string;
  wallet?: string;
  role?: string;
  createdAt?: any;
  balance: number;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getAllUsersWithBalances();
      setUsers(data);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: '2-digit'
    }).format(date);
  };

  const filtered = searchQuery
    ? users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.wallet?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = ['Email', 'Wallet', 'Role', 'Join Date', 'IC Balance'];
    const csvData = filtered.map(user => [
      user.email || '—',
      user.wallet || '—',
      user.role || 'user',
      formatDate(user.createdAt),
      user.balance.toFixed(2)
    ]);
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-list-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div>
      {/* Search + Export */}
      <div className="px-4 py-3 flex flex-col sm:flex-row justify-between gap-2">
        <input
          type="text"
          placeholder="Search by email or wallet..."
          className="w-full sm:w-80 px-4 py-2 text-sm border border-cp-neutral-200 rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || filtered.length === 0}
          onClick={handleExport}
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
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>IC Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email || '—'}</TableCell>
                    <TableCell className="truncate max-w-xs">{user.wallet || '—'}</TableCell>
                    <TableCell className="capitalize">{user.role || 'user'}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{user.balance.toLocaleString()} IC</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-cp-neutral-500">
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
