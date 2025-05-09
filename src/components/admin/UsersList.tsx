import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [roleFilter, setRoleFilter] = useState('all');
  const [minBalance, setMinBalance] = useState('');
  const [maxBalance, setMaxBalance] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

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

  const filtered = users.filter(user => {
    const matchesSearch =
      !searchQuery ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.wallet?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    const min = parseFloat(minBalance);
    const max = parseFloat(maxBalance);
    const matchesMin = isNaN(min) || user.balance >= min;
    const matchesMax = isNaN(max) || user.balance <= max;

    return matchesSearch && matchesRole && matchesMin && matchesMax;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

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
      {/* Filters */}
      <div className="px-4 py-3 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <Input
            type="text"
            placeholder="Search by email or wallet..."
            className="w-full lg:w-80"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select value={roleFilter} onValueChange={(val) => {
            setRoleFilter(val);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Min Balance"
            className="w-[120px]"
            value={minBalance}
            onChange={(e) => {
              setMinBalance(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Input
            type="number"
            placeholder="Max Balance"
            className="w-[120px]"
            value={maxBalance}
            onChange={(e) => {
              setMaxBalance(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
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
          <div className="p-4 space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-4 py-3">
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
                  <TableHead>Email</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>IC Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(user => (
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

export default UsersList;
