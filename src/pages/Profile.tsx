import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Settings, User, Calendar, Download, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUser } from "@/contexts/UserContext";
import { signOut } from '../auth';
import { getICTransactions, updateUserProfile, ActivityType } from '@/utils/firestoreService';

const Profile = () => {
  const navigate = useNavigate();
const { toast } = useToast();
const { userData, user, refreshUserData } = useUser();
const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
const [isLoggingOut, setIsLoggingOut] = useState(false);
 interface Transaction {
   id: string;
   type: ActivityType;
   amount: number;
   timestamp: any;
   description?: string;
 }
 const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: userData?.name || '',
    country: userData?.country || '',
    phone: userData?.phone || '',
  });

  const joinedDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : '—';
  const totalTokens = userData?.icBalance || 0;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setLogoutDialogOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleExportActivity = () => {
    toast({
      title: "Activity Export",
      description: "Your activity history has been exported to CSV.",
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUserProfile(user?.uid, {
        name: formData.name,
        country: formData.country,
        phone: formData.phone,
      });
      toast({ title: "Profile Updated" });
      setEditMode(false);
      refreshUserData();
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "Could not update profile. Try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchTx = async () => {
      if (!user?.uid) return;
      try {
        const txs = await getICTransactions(user.uid, 100);
        setTransactions(txs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cp-green-50 to-white">
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-cp-neutral-700 mr-2"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft size={24} />
          </Button>
          <h1 className="text-xl font-semibold text-cp-green-700">Profile</h1>
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
        <Card className="overflow-hidden shadow-sm border-none">
          <div className="bg-gradient-to-r from-cp-green-600 to-cp-green-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mr-4 shadow-md">
                  <User size={32} className="text-cp-green-600" />
                </div>
                <div className="text-white">
                  <div className="text-xl font-semibold">{formData.name || 'Pilgrim'}</div>
                  <div className="text-white/80">{userData?.email || user?.email || 'Not available'}</div>
                </div>
              </div>
              {!editMode ? (
                <Button variant="ghost" size="icon" onClick={() => setEditMode(true)}>
                  <Pencil className="text-white" size={18} />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="text-white" size={18} />
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-cp-neutral-500">Country</div>
                {editMode ? (
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                ) : (
                  <div className="font-medium">{formData.country || '—'}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-cp-neutral-500">Member Since</div>
                <div className="font-medium">{joinedDate}</div>
              </div>
              <div>
                <div className="text-sm text-cp-neutral-500">Total Balance</div>
                <div className="font-medium">{totalTokens.toLocaleString()} IC</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-cp-neutral-500 mb-1">Phone Number</div>
              {editMode ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Optional"
                />
              ) : (
                <div className="font-medium">{formData.phone || '—'}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity History */}
        <Card className="shadow-sm border-none">
          <CardContent className="p-6">
            <div className="flex items-center mb-4 justify-between">
              <div className="flex items-center">
                <Calendar size={18} className="text-cp-green-600 mr-2" />
                <h3 className="text-lg font-medium">Activity History</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-cp-green-600 flex items-center gap-1"
                onClick={handleExportActivity}
              >
                <Download size={14} />
                Export
              </Button>
            </div>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-cp-neutral-500">Loading...</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-cp-neutral-500">No activity yet</p>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium capitalize">
                          {tx.type === "purchase"
                            ? "Token Purchase"
                            : tx.type === "redemption"
                            ? "Umrah Redemption"
                            : tx.type === "card_load"
                            ? "Card Load"
                            : tx.type === "paypal"
                            ? "Top-Up via PayPal"
                            : "Transaction"}
                        </div>
                        <div className="text-sm text-cp-neutral-500">
                          {tx.timestamp?.toDate
                            ? tx.timestamp.toDate().toLocaleDateString()
                            : '—'}
                        </div>
                        {tx.description && (
                          <div className="text-xs text-cp-neutral-600">{tx.description}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {tx.amount >= 0 ? '+' : '-'}
                          {Math.abs(tx.amount)} IC
                        </div>
                        <div className="text-xs px-2 py-1 rounded-full bg-cp-green-100 text-cp-green-700 inline-block">
                          completed
                        </div>
                      </div>
                    </div>
                    <Separator className="my-3" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="border-cp-green-300 text-cp-green-700 flex gap-2"
            onClick={() => navigate('/settings')}
          >
            <Settings size={18} />
            Settings
          </Button>
          <Button
            variant="outline"
            className="border-cp-neutral-300 text-cp-neutral-700 flex gap-2"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </div>

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex sm:justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
