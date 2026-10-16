'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Order,
  UserProfile,
  ProductConfig,
  PaymentMethod,
  AuditLog,
  EmailNotification,
  SiteSettings,
  PaymentStatus,
  FulfillmentStatus,
} from '@/lib/types';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Users,
  CreditCard,
  Settings,
  Download,
  Search,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  Check,
  X,
  Mail,
  History,
  Info,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'products' | 'payments' | 'customers' | 'settings' | 'audit' | 'emails'
  >('orders');

  // Metrics state
  const [metrics, setMetrics] = useState<Record<string, number>>({});
  const [delayedOrders, setDelayedOrders] = useState<Order[]>([]);
  const [activityFeed, setActivityFeed] = useState<AuditLog[]>([]);
  const [chartData, setChartData] = useState<{ date: string; count: number; revenue: number }[]>([]);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterFulfillment, setFilterFulfillment] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Action Modals
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject' | 'request_info' | 'dispatch' | 'complete' | 'cancel' | 'refund' | 'note';
    orderId: string;
    isOpen: boolean;
  } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Other entities
  const [product, setProduct] = useState<ProductConfig | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [methodSaving, setMethodSaving] = useState(false);
  const [customers, setCustomers] = useState<(UserProfile & { ordersCount: number; totalSpentEGP: number })[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailNotification[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Guard: check if admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/login?redirect=/admin');
      }
    }
  }, [user, authLoading, router]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [metricsRes, ordersRes, productRes, methodsRes, customersRes, settingsRes, auditRes, emailRes] =
        await Promise.all([
          fetch('/api/admin/metrics'),
          fetch('/api/admin/orders'),
          fetch('/api/admin/product'),
          fetch('/api/admin/payment-methods'),
          fetch('/api/admin/customers'),
          fetch('/api/admin/settings'),
          fetch('/api/admin/audit-logs'),
          fetch('/api/admin/email-logs'),
        ]);

      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        setMetrics(mData.metrics);
        setDelayedOrders(mData.delayedOrders || []);
        setActivityFeed(mData.activityFeed || []);
        setChartData(mData.chartData || []);
      }

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData.orders || []);
      }

      if (productRes.ok) {
        const pData = await productRes.json();
        setProduct(pData.product);
      }

      if (methodsRes.ok) {
        const methData = await methodsRes.json();
        setPaymentMethods(methData.paymentMethods || []);
      }

      if (customersRes.ok) {
        const cData = await customersRes.json();
        setCustomers(cData.customers || []);
      }

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSiteSettings(sData.settings);
      }

      if (auditRes.ok) {
        const aData = await auditRes.json();
        setAuditLogs(aData.logs || []);
      }

      if (emailRes.ok) {
        const eData = await emailRes.json();
        setEmailLogs(eData.emails || []);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllData();
    }
  }, [user]);

  // Execute Order Status Action
  const handleOrderAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    setNotice(null);

    let actionKey = '';
    const body: Record<string, unknown> = { language };

    switch (actionModal.type) {
      case 'approve':
        actionKey = 'approve_payment';
        break;
      case 'reject':
        actionKey = 'reject_payment';
        body.rejectionReason = actionReason;
        break;
      case 'request_info':
        actionKey = 'request_more_info';
        body.rejectionReason = actionReason;
        break;
      case 'dispatch':
        actionKey = 'invitation_sent';
        body.dispatchNotes = dispatchNotes;
        break;
      case 'complete':
        actionKey = 'complete_order';
        break;
      case 'cancel':
        actionKey = 'cancel_order';
        break;
      case 'refund':
        actionKey = 'refund_order';
        break;
      case 'note':
        // special note endpoint
        break;
    }

    try {
      if (actionModal.type === 'note') {
        const res = await fetch(`/api/admin/orders/${actionModal.orderId}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: internalNote }),
        });
        if (!res.ok) throw new Error('Failed to add note');
      } else {
        body.action = actionKey;
        body.internalNote = internalNote;
        const res = await fetch(`/api/admin/orders/${actionModal.orderId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to update status');
      }

      setNotice({ type: 'success', message: 'Action executed successfully!' });
      setActionModal(null);
      setActionReason('');
      setDispatchNotes('');
      setInternalNote('');
      loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setNotice({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle customer suspend
  const handleToggleSuspend = async (customerId: string) => {
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/toggle-suspend`, { method: 'POST' });
      if (res.ok) {
        setNotice({ type: 'success', message: 'Customer suspension updated' });
        loadAllData();
      }
    } catch {
      setNotice({ type: 'error', message: 'Failed to update suspension' });
    }
  };

  // Update Product Settings
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    try {
      const res = await fetch('/api/admin/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        setNotice({ type: 'success', message: 'Product settings updated successfully' });
        loadAllData();
      }
    } catch {
      setNotice({ type: 'error', message: 'Failed to update product settings' });
    }
  };

  // Toggle Feature Card
  const handleToggleFeatureCard = (cardId: string) => {
    if (!product) return;
    const updatedCards = product.featureCards.map((c) =>
      c.id === cardId ? { ...c, isEnabled: !c.isEnabled } : c
    );
    setProduct({ ...product, featureCards: updatedCards });
  };

  // Save Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        setNotice({ type: 'success', message: 'Site settings updated successfully' });
        loadAllData();
      }
    } catch {
      setNotice({ type: 'error', message: 'Failed to update settings' });
    }
  };

  // Save / Update Payment Method
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;
    setMethodSaving(true);
    try {
      const res = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMethod),
      });
      if (res.ok) {
        setNotice({ type: 'success', message: 'تم حفظ وتحديث بيانات وسيلة الدفع بنجاح!' });
        setEditingMethod(null);
        loadAllData();
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      setNotice({ type: 'error', message: 'تعذر حفظ بيانات وسيلة الدفع' });
    } finally {
      setMethodSaving(false);
    }
  };

  // Delete Payment Method
  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف وسيلة الدفع هذه؟')) return;
    try {
      const res = await fetch(`/api/admin/payment-methods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotice({ type: 'success', message: 'تم حذف وسيلة الدفع بنجاح' });
        loadAllData();
      }
    } catch {
      setNotice({ type: 'error', message: 'تعذر حذف وسيلة الدفع' });
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !orderSearch ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());

    const matchesPayment = filterPayment === 'all' || o.paymentStatus === filterPayment;
    const matchesFulfillment = filterFulfillment === 'all' || o.fulfillmentStatus === filterFulfillment;

    return matchesSearch && matchesPayment && matchesFulfillment;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm">جاري تحميل لوحة الإدارة الشاملة...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#060814]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {t('admin.dashboard')}
              </h1>
              <p className="text-xs text-slate-400">
                Google AI Pro Management Center • Real-time Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export-csv"
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('admin.exportCsv')}</span>
            </a>
            <button
              onClick={loadAllData}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Notice */}
        {notice && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between ${
              notice.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            <span>{notice.message}</span>
            <button onClick={() => setNotice(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Delayed Orders Glowing Alert Banner (if > 0) */}
        {delayedOrders.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/10 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-sm block">
                  {language === 'ar' ? 'تنبيه: يوجد طلبات متأخرة عن الهدف الزمني (5 دقائق)!' : 'Delayed Orders Alert!'}
                </span>
                <span className="text-xs text-amber-300/80">
                  {language === 'ar'
                    ? `يوجد ${delayedOrders.length} طلب تم تأكيد دفعهم ولم يتم إرسال الدعوة بعد منذ أكثر من 5 دقائق.`
                    : `${delayedOrders.length} orders approved > 5 minutes ago are awaiting invitation dispatch.`}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('orders');
                setFilterPayment('approved');
                setFilterFulfillment('processing');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs whitespace-nowrap hover:bg-amber-400 transition-colors"
            >
              {language === 'ar' ? 'معالجة الطلبات المتأخرة الآن' : 'Process Delayed Orders'}
            </button>
          </div>
        )}

        {/* Overview Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{t('admin.confirmedRevenue')}</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {metrics.confirmedRevenueEGP || 0} <span className="text-xs">EGP</span>
            </div>
            <span className="text-[10px] text-slate-500">خالي من الطلبات غير المدفوعة</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{t('admin.totalOrders')}</span>
              <Package className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{metrics.totalOrders || 0}</div>
            <span className="text-[10px] text-slate-500">إجمالي الطلبات المسجلة</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{t('admin.pendingReview')}</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {metrics.receiptsUnderReview || 0}
            </div>
            <span className="text-[10px] text-slate-500">إيصالات بانتظار المطابقة</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>{t('admin.pendingDispatch')}</span>
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400">
              {metrics.invitationsAwaitingProcessing || 0}
            </div>
            <span className="text-[10px] text-slate-500">دعوات بانتظار الإرسال</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>مكتمل بنجاح</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{metrics.completedOrders || 0}</div>
            <span className="text-[10px] text-slate-500">تم تسليم الدعوات</span>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>مسترد / ملغي</span>
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">
              {(metrics.refundedOrders || 0) + (metrics.cancelledOrders || 0)}
            </div>
            <span className="text-[10px] text-slate-500">تم التعامل معها</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            الطلبات ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            المنتج والأسعار
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            طرق الدفع
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            العملاء ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            إعدادات الموقع
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            سجل العمليات ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'emails'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            الإشعارات البريدية ({emailLogs.length})
          </button>
        </div>

        {/* ================= TAB 1: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="بحث برقم الطلب، الاسم، أو البريد..."
                  className="w-full ps-10 pe-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none"
                >
                  <option value="all">كل حالات الدفع</option>
                  <option value="awaiting_payment">في انتظار الدفع</option>
                  <option value="receipt_submitted">تم رفع الإيصال</option>
                  <option value="approved">تم تأكيد الدفع</option>
                  <option value="rejected">تم الرفض</option>
                </select>

                <select
                  value={filterFulfillment}
                  onChange={(e) => setFilterFulfillment(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none"
                >
                  <option value="all">كل حالات التنفيذ</option>
                  <option value="pending">معلق</option>
                  <option value="processing">جاري التجهيز</option>
                  <option value="invitation_sent">تم إرسال الدعوة</option>
                  <option value="completed">مكتمل</option>
                  <option value="cancelled">ملغي</option>
                  <option value="refunded">مسترد</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs text-slate-300">
                  <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase border-b border-white/5">
                    <tr>
                      <th className="p-4 text-start">رقم الطلب</th>
                      <th className="p-4 text-start">العميل</th>
                      <th className="p-4 text-start">السعر</th>
                      <th className="p-4 text-start">حالة الدفع</th>
                      <th className="p-4 text-start">حالة التنفيذ</th>
                      <th className="p-4 text-start">الإيصال</th>
                      <th className="p-4 text-start">التاريخ</th>
                      <th className="p-4 text-center">إجراءات الإدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          لا توجد طلبات تطابق الفلترة الحالية.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-bold text-indigo-400 whitespace-nowrap">
                            {o.id}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-white block">{o.customerName}</span>
                            <span className="text-[11px] text-slate-400">{o.customerEmail}</span>
                          </td>
                          <td className="p-4 font-bold text-white whitespace-nowrap">
                            {(o.priceCents / 100).toFixed(2)} {o.currency}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                o.paymentStatus === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : o.paymentStatus === 'rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {t(`status.${o.paymentStatus}`)}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                o.fulfillmentStatus === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : o.fulfillmentStatus === 'invitation_sent'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : o.fulfillmentStatus === 'processing'
                                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 animate-pulse'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {t(`status.${o.fulfillmentStatus}`)}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {o.proofs && o.proofs.length > 0 ? (
                              <a
                                href={`/api/receipts/${o.proofs[o.proofs.length - 1].id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>معاينة ({o.proofs.length})</span>
                              </a>
                            ) : (
                              <span className="text-slate-600 text-[11px]">لم يُرفع بعد</span>
                            )}
                          </td>
                          <td className="p-4 whitespace-nowrap text-slate-500 text-[11px]">
                            {new Date(o.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="p-4 whitespace-nowrap text-center">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Open Detail Drawer */}
                              <button
                                onClick={() => setSelectedOrder(o)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                                title="عرض التفاصيل الكاملة"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Quick Approve Payment */}
                              {o.paymentStatus !== 'approved' && (
                                <button
                                  onClick={() =>
                                    setActionModal({ type: 'approve', orderId: o.id, isOpen: true })
                                  }
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                                  title="قبول وتأكيد الدفع"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Quick Reject */}
                              {o.paymentStatus !== 'approved' && o.paymentStatus !== 'rejected' && (
                                <button
                                  onClick={() =>
                                    setActionModal({ type: 'reject', orderId: o.id, isOpen: true })
                                  }
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                                  title="رفض الإيصال"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Dispatch Invitation */}
                              {o.paymentStatus === 'approved' &&
                                o.fulfillmentStatus !== 'invitation_sent' &&
                                o.fulfillmentStatus !== 'completed' && (
                                  <button
                                    onClick={() =>
                                      setActionModal({ type: 'dispatch', orderId: o.id, isOpen: true })
                                    }
                                    className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-[10px] font-bold"
                                    title="تسجيل إرسال الدعوة"
                                  >
                                    إرسال الدعوة
                                  </button>
                                )}

                              {/* Mark Completed */}
                              {o.fulfillmentStatus === 'invitation_sent' && (
                                <button
                                  onClick={() =>
                                    setActionModal({ type: 'complete', orderId: o.id, isOpen: true })
                                  }
                                  className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold"
                                  title="إكمال الطلب"
                                >
                                  إكمال
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRODUCT MANAGEMENT ================= */}
        {activeTab === 'products' && product && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              <span>إعدادات المنتج والأسعار الحالية</span>
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    السعر المعروض للعميل (جنيه مصري)
                  </label>
                  <input
                    type="number"
                    value={product.priceCents / 100}
                    onChange={(e) =>
                      setProduct({ ...product, priceCents: Math.round(Number(e.target.value) * 100) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    * الطلبات القائمة تحتفظ بسعرها المؤكد وقت إنشائها.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    الحد الأقصى للدفعة (الحصة المحددة)
                  </label>
                  <input
                    type="number"
                    value={product.maxQuota || 5}
                    onChange={(e) =>
                      setProduct({ ...product, maxQuota: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-bold text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    * يتم إيقاف الطلبات تلقائياً بعد هذا العدد (افتراضي: 5).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    الهدف الزمني للمعالجة (بالدقائق)
                  </label>
                  <input
                    type="number"
                    value={product.deliveryTargetMins}
                    onChange={(e) =>
                      setProduct({ ...product, deliveryTargetMins: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    حالة توفر الطلبات الجديدة
                  </label>
                  <select
                    value={product.isAvailable ? 'yes' : 'no'}
                    onChange={(e) => setProduct({ ...product, isAvailable: e.target.value === 'yes' })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none"
                  >
                    <option value="yes">متاح للطلب الفوري</option>
                    <option value="no">متوقف مؤقتاً (نفاد الحصص)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    الوصف بالعربية
                  </label>
                  <textarea
                    rows={3}
                    value={product.descAr}
                    onChange={(e) => setProduct({ ...product, descAr: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    التوضيح القانوني وحدود الاستخدام (Disclaimer)
                  </label>
                  <textarea
                    rows={3}
                    value={product.disclaimerAr}
                    onChange={(e) => setProduct({ ...product, disclaimerAr: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Feature Cards Management */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <span className="text-xs font-bold text-white block">
                  إدارة بطاقات المميزات الست (تفعيل / إخفاء):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.featureCards.map((card) => (
                    <div
                      key={card.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                        card.isEnabled
                          ? 'bg-indigo-600/10 border-indigo-500/30 text-white'
                          : 'bg-slate-900/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs block">{card.titleAr}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{card.descAr}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatureCard(card.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          card.isEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {card.isEnabled ? 'مفعل' : 'معطل'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl glow-btn text-white font-bold text-xs"
              >
                حفظ التعديلات على المنتج
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 3: PAYMENT METHODS ================= */}
        {activeTab === 'payments' && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span>طرق الدفع المصرية المعتمدة وتعديلها</span>
                </h2>
                <p className="text-xs text-slate-400">
                  تعديل أرقام المحافظ، معرفات إنستاباي، تعليمات التحويل، وأسماء المستلمين.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingMethod({
                    id: `method-${Date.now()}`,
                    code: 'custom',
                    nameAr: 'طريقة دفع جديدة',
                    nameEn: 'New Payment Method',
                    recipientName: 'اسم المستلم المعتمد',
                    accountIdentifier: '010XXXXXXXX',
                    instructionsAr: 'قم بالتحويل إلى الرقم وارفع لقطة الشاشة.',
                    instructionsEn: 'Transfer to the number and upload proof.',
                    isEnabled: true,
                    sortOrder: paymentMethods.length + 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  })
                }
                className="px-4 py-2 rounded-xl glow-btn text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة وسيلة دفع جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentMethods.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl glass-card border border-white/10 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{m.nameAr}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.isEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {m.isEnabled ? 'مفعل' : 'معطل'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300">
                      <p>
                        <strong className="text-slate-400">اسم المستلم:</strong>{' '}
                        <span className="text-white font-medium">{m.recipientName}</span>
                      </p>
                      <p>
                        <strong className="text-slate-400">رقم التحويل / المعرف:</strong>{' '}
                        <span className="font-mono text-cyan-300 font-bold">{m.accountIdentifier}</span>
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-3 bg-slate-900/80 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                      {m.instructionsAr}
                    </p>
                  </div>

                  {/* Edit and Delete Actions */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingMethod(m)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePaymentMethod(m.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors cursor-pointer"
                      title="حذف وسيلة الدفع"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for Editing / Creating Payment Method */}
            {editingMethod && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/20 max-w-lg w-full space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <span>تعديل وسيلة الدفع: {editingMethod.nameAr}</span>
                    </h3>
                    <button
                      onClick={() => setEditingMethod(null)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSavePaymentMethod} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        اسم طريقة الدفع بالعربية (يظهر للعميل)
                      </label>
                      <input
                        type="text"
                        required
                        value={editingMethod.nameAr}
                        onChange={(e) =>
                          setEditingMethod({ ...editingMethod, nameAr: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">
                          اسم المستلم المعتمد
                        </label>
                        <input
                          type="text"
                          required
                          value={editingMethod.recipientName}
                          onChange={(e) =>
                            setEditingMethod({ ...editingMethod, recipientName: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">
                          رقم التحويل / معرف المحفظة أو إنستاباي
                        </label>
                        <input
                          type="text"
                          required
                          value={editingMethod.accountIdentifier}
                          onChange={(e) =>
                            setEditingMethod({ ...editingMethod, accountIdentifier: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        تعليمات التحويل للعميل
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={editingMethod.instructionsAr}
                        onChange={(e) =>
                          setEditingMethod({ ...editingMethod, instructionsAr: e.target.value })
                        }
                        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="methodEnabled"
                        checked={editingMethod.isEnabled}
                        onChange={(e) =>
                          setEditingMethod({ ...editingMethod, isEnabled: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-indigo-600 bg-slate-900"
                      />
                      <label htmlFor="methodEnabled" className="text-slate-300 font-medium">
                        تفعيل طريقة الدفع هذه في صفحة إتمام الطلب للعملاء
                      </label>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingMethod(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={methodSaving}
                        className="px-5 py-2 rounded-xl glow-btn text-white font-bold cursor-pointer disabled:opacity-50"
                      >
                        {methodSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: CUSTOMERS ================= */}
        {activeTab === 'customers' && (
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>إدارة حسابات العملاء</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase border-b border-white/5">
                  <tr>
                    <th className="p-4 text-start">الاسم</th>
                    <th className="p-4 text-start">البريد الإلكتروني</th>
                    <th className="p-4 text-start">رقم الهاتف</th>
                    <th className="p-4 text-start">الدور</th>
                    <th className="p-4 text-start">الطلبات</th>
                    <th className="p-4 text-start">إجمالي الإنفاق</th>
                    <th className="p-4 text-center">الحالة / تحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white">{c.fullName}</td>
                      <td className="p-4 text-slate-400">{c.email}</td>
                      <td className="p-4 text-slate-400 font-mono">{c.phone || '-'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {c.role}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white">{c.ordersCount}</td>
                      <td className="p-4 font-bold text-emerald-400">
                        {c.totalSpentEGP.toFixed(2)} EGP
                      </td>
                      <td className="p-4 text-center">
                        {c.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleSuspend(c.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              c.isSuspended
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            }`}
                          >
                            {c.isSuspended ? 'إلغاء الإيقاف' : 'إيقاف الحساب'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SITE SETTINGS ================= */}
        {activeTab === 'settings' && siteSettings && (
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              <span>إعدادات وهوية المتجر</span>
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    اسم المتجر بالعربية
                  </label>
                  <input
                    type="text"
                    value={siteSettings.brandNameAr}
                    onChange={(e) => setSiteSettings({ ...siteSettings, brandNameAr: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    بريد الدعم الفني
                  </label>
                  <input
                    type="email"
                    value={siteSettings.contactEmail}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  نص شريط الإعلانات في الصفحة الرئيسية
                </label>
                <input
                  type="text"
                  value={siteSettings.announcementAr}
                  onChange={(e) => setSiteSettings({ ...siteSettings, announcementAr: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="annActive"
                  checked={siteSettings.isAnnouncementActive}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, isAnnouncementActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900"
                />
                <label htmlFor="annActive" className="text-xs text-slate-300">
                  تفعيل ظهور شريط الإعلانات أعلى الموقع
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl glow-btn text-white font-bold text-xs"
              >
                حفظ إعدادات الموقع
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 6: AUDIT LOGS ================= */}
        {activeTab === 'audit' && (
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <span>سجل العمليات والرقابة غير القابل للتعديل</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase border-b border-white/5">
                  <tr>
                    <th className="p-4 text-start">العملية</th>
                    <th className="p-4 text-start">المستخدم</th>
                    <th className="p-4 text-start">المورد</th>
                    <th className="p-4 text-start">معرف المورد</th>
                    <th className="p-4 text-start">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono font-bold text-indigo-300">{log.action}</td>
                      <td className="p-4 text-slate-400">{log.userEmail || 'System'}</td>
                      <td className="p-4 text-slate-300">{log.resourceType}</td>
                      <td className="p-4 font-mono text-cyan-400">{log.resourceId}</td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(log.createdAt).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 7: EMAIL NOTIFICATIONS ================= */}
        {activeTab === 'emails' && (
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <span>سجل الإشعارات البريدية المرسلة</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase border-b border-white/5">
                  <tr>
                    <th className="p-4 text-start">رقم الطلب</th>
                    <th className="p-4 text-start">المستلم</th>
                    <th className="p-4 text-start">نوع الرسالة</th>
                    <th className="p-4 text-start">العنوان</th>
                    <th className="p-4 text-start">الحالة</th>
                    <th className="p-4 text-start">الوقت</th>
                    <th className="p-4 text-center">معاينة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {emailLogs.map((em) => (
                    <tr key={em.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono text-indigo-400">{em.orderId}</td>
                      <td className="p-4 text-slate-300">{em.recipientEmail}</td>
                      <td className="p-4 font-mono text-purple-300">{em.templateType}</td>
                      <td className="p-4 text-white line-clamp-1">{em.subject}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          {em.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {new Date(em.createdAt).toLocaleString('ar-EG')}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedEmail(em)}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-indigo-400 font-semibold"
                        >
                          عرض HTML
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= ORDER INSPECTOR MODAL ================= */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono text-indigo-400">{selectedOrder.id}</span>
                  <h3 className="text-xl font-bold text-white">تفاصيل الطلب الكاملة</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">العميل</span>
                  <span className="font-bold text-white block">{selectedOrder.customerName}</span>
                  <span className="text-[11px] text-slate-400">{selectedOrder.customerEmail}</span>
                  {selectedOrder.customerPhone && (
                    <span className="text-[11px] text-cyan-300 block">{selectedOrder.customerPhone}</span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">المنتج والمبلغ</span>
                  <span className="font-bold text-white block">{selectedOrder.productName}</span>
                  <span className="text-sm font-black text-emerald-400">
                    {(selectedOrder.priceCents / 100).toFixed(2)} {selectedOrder.currency}
                  </span>
                  <span className="text-[11px] text-slate-400 block">{selectedOrder.paymentMethodName}</span>
                </div>
              </div>

              {/* Payment Proofs in Inspector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">إثباتات الدفع المرفوعة:</span>
                {selectedOrder.proofs && selectedOrder.proofs.length > 0 ? (
                  selectedOrder.proofs.map((proof) => (
                    <div
                      key={proof.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-white block">{proof.originalFilename}</span>
                        {proof.transactionReference && (
                          <span className="text-[11px] text-cyan-300 font-mono">
                            الرقم المرجعي: {proof.transactionReference}
                          </span>
                        )}
                      </div>
                      <a
                        href={`/api/receipts/${proof.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 flex items-center gap-1 font-semibold text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>فتح الإيصال</span>
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">لا يوجد إيصال مرفوع حتى الآن.</p>
                )}
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">ملاحظات الإدارة الداخلية:</span>
                {selectedOrder.notes && selectedOrder.notes.length > 0 ? (
                  selectedOrder.notes.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[10px]">
                        <span>{n.adminName}</span>
                        <span>{new Date(n.createdAt).toLocaleString('ar-EG')}</span>
                      </div>
                      <p className="text-slate-200">{n.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">لا توجد ملاحظات داخلية.</p>
                )}
              </div>

              {/* Action Buttons inside Drawer */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setActionModal({ type: 'approve', orderId: selectedOrder.id, isOpen: true });
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  قبول وتأكيد الدفع
                </button>
                <button
                  onClick={() => {
                    setActionModal({ type: 'reject', orderId: selectedOrder.id, isOpen: true });
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  رفض الدفع مع سبب
                </button>
                <button
                  onClick={() => {
                    setActionModal({ type: 'dispatch', orderId: selectedOrder.id, isOpen: true });
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  تسجيل إرسال الدعوة
                </button>
                <button
                  onClick={() => {
                    setActionModal({ type: 'note', orderId: selectedOrder.id, isOpen: true });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                >
                  إضافة ملاحظة داخلية
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ================= ACTION CONFIRMATION MODAL ================= */}
        {actionModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/20 max-w-md w-full space-y-4">
              <h3 className="text-lg font-bold text-white">
                تأكيد العملية ({actionModal.type.toUpperCase()})
              </h3>

              {actionModal.type === 'reject' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    سبب الرفض (يظهر للعميل في بريده وصفحة طلبه) <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="مثال: لم يصل التحويل في المحفظة، أو المبلغ أقل من 25 جنيه."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {actionModal.type === 'dispatch' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ملاحظات الإرسال الفعلي (تُسجل وتُرسل للعميل)
                  </label>
                  <textarea
                    rows={3}
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="مثال: تم إرسال رابط الدعوة إلى بريدك الإلكتروني بنجاح."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {(actionModal.type === 'note' || actionModal.type === 'approve') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ملاحظة داخلية إضافية (اختياري)
                  </label>
                  <input
                    type="text"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="ملاحظات سرية للإدارة..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleOrderAction}
                  className="px-5 py-2 rounded-xl glow-btn text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'جاري التنفيذ...' : 'تأكيد وتنفيذ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= EMAIL PREVIEW MODAL ================= */}
        {selectedEmail && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/20 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-xs text-indigo-400 font-mono">{selectedEmail.templateType}</span>
                  <h3 className="text-base font-bold text-white">{selectedEmail.subject}</h3>
                </div>
                <button onClick={() => setSelectedEmail(null)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs overflow-auto"
                dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
