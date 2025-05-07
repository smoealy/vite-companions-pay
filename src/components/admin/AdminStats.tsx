
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminStatsProps {
  stats: {
    total: number;
    pending: number;
    reviewed: number;
    contacted: number;
    completed: number;
    cancelled: number;
    bronze: number;
    silver: number;
    gold: number;
  };
  loading: boolean;
}

const AdminStats = ({ stats, loading }: AdminStatsProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col">
          <p className="text-sm text-cp-neutral-500">Total Submissions</p>
          <p className="text-2xl font-semibold">{stats.total || 0}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="bg-cp-gold-50 text-cp-gold-700">{stats.gold || 0} Gold</Badge>
            <Badge variant="outline" className="bg-gray-50 text-gray-700">{stats.silver || 0} Silver</Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700">{stats.bronze || 0} Bronze</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-cp-neutral-500">Pending</p>
          <p className="text-2xl font-semibold">{stats.pending || 0}</p>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 mt-2">Require Review</Badge>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-cp-neutral-500">In Progress</p>
          <p className="text-2xl font-semibold">{(stats.reviewed || 0) + (stats.contacted || 0)}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">{stats.reviewed || 0} Reviewed</Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">{stats.contacted || 0} Contacted</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-cp-neutral-500">Completed</p>
          <p className="text-2xl font-semibold">{stats.completed || 0}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">{stats.completed || 0} Fulfilled</Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700">{stats.cancelled || 0} Cancelled</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
