import React, { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStats from '@/components/admin/AdminStats';
import AdminTabContent from '@/components/admin/AdminTabContent';
import RedemptionFilters from '@/components/admin/RedemptionFilters';
import RedemptionsList from '@/components/admin/RedemptionsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Footer from '@/components/ui-components/Footer';
import { CreditCard, Users, Coins, Settings, DollarSign } from 'lucide-react';
import { getRedemptionStats, getUmrahRedemptions, UmrahRedemptionData } from '@/utils/firebase/redemptionService';

import UsersList from '@/components/admin/UsersList';
import TokenPurchasesList from '@/components/admin/TokenPurchasesList';

type StatusFilterType = 'all' | 'pending' | 'reviewed' | 'contacted' | 'completed' | 'cancelled';

const AdminDashboard = () => {
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
    gold: 0
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
    'Indonesia'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const redemptionStats = await getRedemptionStats();
        setStats(redemptionStats);

        const filters: any = {};
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (countryFilter !== 'all') filters.country = countryFilter;
        if (searchQuery) filters.search = searchQuery;

        const redemptions = await getUmrahRedemptions(filters);
        setSubmissions(redemptions);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [statusFilter, countryFilter, searchQuery]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTierFilter('all');
    setCountryFilter('all');
  };

  const exportToCSV = () => {
    console.log('Export to CSV');
  };

  const handleToggleSubmission = (id: string) => {
    setOpenSubmissionId(openSubmissionId === id ? null : id);
  };

  const handleViewDetails = (submission: UmrahRedemptionData & { id: string }) => {
    console.log("View details for:", submission);
  };

  const getStatusBadge = (status: UmrahRedemptionData['status']) => {
    return <span className="inline-block px-2 py-1 text-xs rounded-full">{status}</span>;
  };

  const getTierBadge = (tier: string) => {
    return <span className="inline-block px-2 py-1 text-xs rounded-full">{tier}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-cp-neutral-50">
      <AdminHeader />

      <div className="container mx-auto px-4 py-6 flex-1">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <AdminStats stats={stats} loading={loading} />

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-cp-neutral-200">
          <Tabs defaultValue="redemptions" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 h-auto p-0 bg-cp-neutral-100">
              <TabsTrigger
                value="redemptions"
                className="data-[state=active]:bg-white rounded-none py-3 border-r border-cp-neutral-200 data-[state=active]:border-b-0"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Redemptions
              </TabsTrigger>
              <TabsTrigger
                value="token-purchases"
                className="data-[state=active]:bg-white rounded-none py-3 border-r border-cp-neutral-200 data-[state=active]:border-b-0"
              >
                <Coins className="h-4 w-4 mr-2" />
                Token Purchases
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-white rounded-none py-3 border-r border-cp-neutral-200 data-[state=active]:border-b-0"
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="credits"
                className="data-[state=active]:bg-white rounded-none py-3 border-r border-cp-neutral-200 data-[state=active]:border-b-0"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Ihram Credits
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-white rounded-none py-3 data-[state=active]:border-b-0"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
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
                <p className="text-sm text-cp-neutral-600">This section will allow admin to adjust, view, or transfer user IC balances.</p>
                <p className="mt-2 text-xs text-cp-neutral-400 italic">Coming soon — connect to Firestore balance logic.</p>
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
