// File: src/pages/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import AdminTabContent from '@/components/admin/AdminTabContent';
import RedemptionFilters from '@/components/admin/RedemptionFilters';
import RedemptionsList from '@/components/admin/RedemptionsList';
import UsersList from '@/components/admin/UsersList';
import TokenPurchasesList from '@/components/admin/TokenPurchasesList';
import CreditsList from '@/components/admin/CreditsList';
import ImpactLogsList from '@/components/admin/ImpactLogsList';
import Footer from '@/components/ui-components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Users, Coins, Settings, DollarSign } from 'lucide-react';
import { listenToRedemptions } from '@/utils/firestoreService';
import { UmrahRedemptionData } from '@/utils/firebase/redemptionService';

type StatusFilterType = 'all' | 'pending' | 'reviewed' | 'contacted' | 'completed' | 'cancelled';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('redemptions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Array<UmrahRedemptionData & { id: string }>>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    contacted: 0,
    completed: 0,
    cancelled: 0,
    bronze: 0,
    silver: 0,
    gold: 0,
  });
  const [openSubmissionId, setOpenSubmissionId] = useState<string | null>(null);

  const countries = [
    'United States',
    'Saudi Arabia',
    'United Kingdom',
    'Canada',
    'United Arab Emirates',
    'Malaysia',
    'Singapore',
    'Indonesia',
  ];

  useEffect(() => {
    const unsubscribe = listenToRedemptions((all: any[]) => {
      const filtered = all.filter((item) => {
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesCountry = countryFilter === 'all' || item.country === countryFilter;
        const matchesSearch = searchQuery === '' || item.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesCountry && matchesSearch;
      });

      setSubmissions(filtered);

      const liveStats = {
        total: all.length,
        pending: all.filter(r => r.status === 'pending').length,
        reviewed: all.filter(r => r.status === 'reviewed').length,
        contacted: all.filter(r => r.status === 'contacted').length,
        completed: all.filter(r => r.status === 'fulfilled').length,
        cancelled: all.filter(r => r.status === 'cancelled').length,
        bronze: all.filter(r => r.tier === 'bronze').length,
        silver: all.filter(r => r.tier === 'silver').length,
        gold: all.filter(r => r.tier === 'gold').length,
      };

      setStats(liveStats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [statusFilter, countryFilter, searchQuery]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTierFilter('all');
    setCountryFilter('all');
  };

  const exportToCSV = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Export to CSV');
    }
  };

  const handleToggleSubmission = (id: string) => {
    setOpenSubmissionId(openSubmissionId === id ? null : id);
  };

  const handleViewDetails = (submission: UmrahRedemptionData & { id: string }) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("View details for:", submission);
    }
  };

  const getStatusBadge = (status: UmrahRedemptionData['status']) => (
    <span className="inline-block px-2 py-1 text-xs rounded-full">{status}</span>
  );

  const getTierBadge = (tier: string) => (
    <span className="inline-block px-2 py-1 text-xs rounded-full">{tier}</span>
  );

  return (
    <div className="min-h-screen flex flex-col bg-cp-neutral-50">
      <AdminHeader />
      <div className="container mx-auto px-4 py-6 flex-1">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <AdminStats stats={stats} loading={loading} />

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-cp-neutral-200">
          <Tabs defaultValue="redemptions" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 h-auto p-0 bg-cp-neutral-100">
              <TabsTrigger value="redemptions" className="data-[state=active]:bg-white rounded-none py-3 border-r border-cp-neutral-200 data-[state=active]:border-b-0">
                <CreditCard className="h-4 w-4 mr-2" /> Redemptions
              </TabsTrigger>
              <TabsTrigger value="token-purchases" className="data-[state=active]:bg-white rounded-none py-3 border-r border-cp-neutral-200 data-[state=active]:border-b-0">
                <Coins className="h-4 w-4 mr-2" /> Token Purchases
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-white rounded-none py-3 border-r border-cp-neutral-200 data-[state=active]:border-b-0">
                <Users className="h-4 w-4 mr-2" /> Users
              </TabsTrigger>
              <TabsTrigger value="credits" className="data-[state=active]:bg-white rounded-none py-3 border-r border-cp-neutral-200 data-[state=active]:border-b-0">
                <DollarSign className="h-4 w-4 mr-2" /> Ihram Credits
              </TabsTrigger>
              <TabsTrigger value="impact" className="data-[state=active]:bg-white rounded-none py-3 border-r border-cp-neutral-200 data-[state=active]:border-b-0">
                <Coins className="h-4 w-4 mr-2" /> Impact
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white rounded-none py-3 data-[state=active]:border-b-0">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="redemptions">
              <div className="p-4">
                <RedemptionFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  tierFilter={tierFilter}
                  setTierFilter={setTierFilter}
                  countryFilter={countryFilter}
                  setCountryFilter={setCountryFilter}
                  countries={countries}
                  resetFilters={resetFilters}
                  exportToCSV={exportToCSV}
                />
                <RedemptionsList
                  submissions={submissions}
                  loading={loading}
                  statusFilter={statusFilter}
                  tierFilter={tierFilter}
                  countryFilter={countryFilter}
                  searchQuery={searchQuery}
                  resetFilters={resetFilters}
                  openSubmissionId={openSubmissionId}
                  handleToggleSubmission={handleToggleSubmission}
                  handleViewDetails={handleViewDetails}
                  getStatusBadge={getStatusBadge}
                  getTierBadge={getTierBadge}
                />
              </div>
            </TabsContent>

            <TabsContent value="token-purchases">
              <div className="p-4">
                <TokenPurchasesList />
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="p-4">
                <UsersList />
              </div>
            </TabsContent>

            <TabsContent value="credits">
              <div className="p-4">
                <CreditsList />
              </div>
            </TabsContent>

            <TabsContent value="impact">
              <div className="p-4">
                <ImpactLogsList />
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <AdminTabContent tab="settings" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
