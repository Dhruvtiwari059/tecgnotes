'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Shield, Lock, Users, BookOpen, FileText, KeyRound,
  Trash2, Plus, X, LogIn
} from 'lucide-react';

interface FeedbackRow {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface AdminUser {
  id: string;
  email: string;
  added_by: string | null;
  created_at: string;
}

export function AdminPanel() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackRow[]>([]);
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setUser(session.user);
      const { data } = await supabase.from('admin_users').select('email').eq('email', session.user.email).maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    }
    checkAdmin();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    async function loadData() {
      const [fb, admins] = await Promise.all([
        supabase.from('feedback').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_users').select('*').order('created_at', { ascending: false }),
      ]);
      setFeedbackList(fb.data || []);
      setAdminList(admins.data || []);
    }
    loadData();
  }, [isAdmin]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/admin' } });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    const { error } = await supabase.from('admin_users').insert({
      email: newAdminEmail.trim(),
      added_by: user.email,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('Admin added successfully', 'एडमिन सफलतापूर्वक जोड़ा गया'));
      setNewAdminEmail('');
      const { data } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
      setAdminList(data || []);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('Admin removed', 'एडमिन हटा दिया गया'));
      setAdminList(adminList.filter(a => a.id !== id));
    }
  };

  if (loading) {
    return (
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-10 w-48 bg-gray-800 mb-4" />
          <Skeleton className="h-64 bg-gray-800" />
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('Admin Login Required', 'एडमिन लॉगिन आवश्यक')}</h2>
          <p className="text-gray-400 mb-6">{t('Sign in with Google to access the admin panel.', 'एडमिन पैनल तक पहुँचने के लिए Google से साइन इन करें।')}</p>
          <Button onClick={handleLogin} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
            <LogIn className="w-4 h-4 mr-2" />
            {t('Sign in with Google', 'Google से साइन इन करें')}
          </Button>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t('Access Denied', 'पहुँच अस्वीकृत')}</h2>
          <p className="text-gray-400">{t('Your email is not in the admin whitelist.', 'आपका ईमेल एडमिन व्हाइटलिस्ट में नहीं है।')}</p>
          <p className="text-gray-500 text-sm mt-2">{user.email}</p>
          <Button onClick={handleLogout} variant="outline" className="mt-6 border-white/10 text-gray-300 hover:bg-white/5">
            {t('Sign Out', 'साइन आउट')}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#F97316]" />
              {t('Admin Panel', 'एडमिन पैनल')}
            </h1>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
            {t('Sign Out', 'साइन आउट')}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-900 border border-white/10 mb-6">
            <TabsTrigger value="feedback" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-[#1E3A8A]">
              <FileText className="w-4 h-4 mr-1" />
              {t('Feedback', 'फीडबैक')}
            </TabsTrigger>
            <TabsTrigger value="admins" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-[#1E3A8A]">
              <Users className="w-4 h-4 mr-1" />
              {t('Admins', 'एडमिन')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feedback">
            <div className="space-y-4">
              {feedbackList.length === 0 ? (
                <p className="text-gray-500 text-center py-12">{t('No feedback yet.', 'अभी कोई फीडबैक नहीं।')}</p>
              ) : (
                feedbackList.map((fb) => (
                  <Card key={fb.id} className="bg-gray-900 border-white/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-white font-semibold">{fb.name}</p>
                        <p className="text-gray-400 text-sm">{fb.email}</p>
                        <p className="text-gray-300 mt-2">{fb.message}</p>
                      </div>
                      <span className="text-gray-500 text-xs whitespace-nowrap">{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="admins">
            <Card className="bg-gray-900 border-white/10 p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#F97316]" />
                {t('Add Admin', 'एडमिन जोड़ें')}
              </h3>
              <div className="flex gap-3">
                <Input
                  placeholder={t('Enter email address', 'ईमेल पता दर्ज करें')}
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 flex-1"
                />
                <Button onClick={handleAddAdmin} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                  <Plus className="w-4 h-4 mr-1" />
                  {t('Add', 'जोड़ें')}
                </Button>
              </div>
            </Card>

            <div className="space-y-3">
              {adminList.map((admin) => (
                <Card key={admin.id} className="bg-gray-900 border-white/10 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{admin.email}</p>
                    <p className="text-gray-500 text-xs">{t('Added by', 'जोड़ा गया')}: {admin.added_by || 'system'} | {new Date(admin.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDeleteAdmin(admin.id)}
                    disabled={admin.email === user.email}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
