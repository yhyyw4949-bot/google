'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/lib/types';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Search,
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    awaitingPayment: 0,
    underReview: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    if (user) {
      fetch('/api/customer/orders')
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) {
            setOrders(data.orders);
            setMetrics(data.metrics);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm">{language === 'ar' ? 'جاري تحميل لوحة التحكم...' : 'Loading dashboard...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-indigo-400 uppercase tracking-widest font-mono">
              {t('customer.welcome')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {user?.fullName}
            </h1>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>

          <Link
            href="/checkout"
            className="glow-btn px-5 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('nav.orderNow')}</span>
          </Link>
        </div>

        {/* Overview Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-xs text-slate-400">{t('customer.myOrders')}</span>
            <div className="text-2xl font-black text-white">{metrics.total}</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-xs text-slate-400">{t('customer.activeOrders')}</span>
            <div className="text-2xl font-black text-indigo-400">{metrics.active}</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-xs text-slate-400">{t('customer.awaitingPayment')}</span>
            <div className="text-2xl font-black text-amber-400">{metrics.awaitingPayment}</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-xs text-slate-400">{t('customer.receiptsUnderReview')}</span>
            <div className="text-2xl font-black text-cyan-400">{metrics.underReview}</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-1">
            <span className="text-xs text-slate-400">{t('customer.completedOrders')}</span>
            <div className="text-2xl font-black text-emerald-400">{metrics.completed}</div>
          </div>
        </div>

        {/* Orders Table / List */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-400" />
              <span>{t('customer.myOrders')}</span>
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">{t('customer.noOrders')}</p>
              <Link
                href="/checkout"
                className="inline-block mt-2 glow-btn px-6 py-2.5 rounded-xl text-white text-xs font-semibold"
              >
                {t('nav.orderNow')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="glass-card rounded-2xl p-5 border border-white/10 hover:border-indigo-500/30 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-400">{o.id}</span>
                      <h3 className="text-base font-bold text-white">{o.productName}</h3>
                      <span className="text-xs text-slate-500">
                        {new Date(o.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold ${
                          o.paymentStatus === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : o.paymentStatus === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {t(`status.${o.paymentStatus}`)}
                      </span>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold ${
                          o.fulfillmentStatus === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : o.fulfillmentStatus === 'invitation_sent'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t(`status.${o.fulfillmentStatus}`)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-3">
                    <div className="flex items-center gap-4">
                      <span>
                        {language === 'ar' ? 'السعر:' : 'Price:'}{' '}
                        <strong className="text-white">{(o.priceCents / 100).toFixed(2)} {o.currency}</strong>
                      </span>
                      <span>
                        {language === 'ar' ? 'وسيلة الدفع:' : 'Method:'}{' '}
                        <strong className="text-slate-300">{o.paymentMethodName || 'كاش'}</strong>
                      </span>
                    </div>

                    <Link
                      href={`/order/${o.id}`}
                      className="inline-flex items-center gap-1.5 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
                    >
                      <span>
                        {o.paymentStatus === 'awaiting_payment'
                          ? language === 'ar' ? 'الدفع ورفع الإيصال' : 'Pay & Upload Receipt'
                          : language === 'ar' ? 'عرض تفاصيل الطلب' : 'View Order Details'}
                      </span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
