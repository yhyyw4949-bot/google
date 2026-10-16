'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/lib/types';
import {
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function TrackOrderPage() {
  const { language, t } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setOrder(null);

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('track.notFound'));
      }

      setOrder(data.order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error finding order';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card text-xs text-cyan-300">
            <Search className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'متابعة لحظية ومباشرة' : 'Real-time Tracking'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('track.title')}
          </h1>
          <p className="text-sm text-slate-300">
            {t('track.subtitle')}
          </p>
        </div>

        {/* Tracking Form */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('track.orderNumber')}
                </label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="GAP-20261016-..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('track.email')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl glow-btn text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg shadow-indigo-500/20"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? (language === 'ar' ? 'جاري البحث...' : 'Searching...') : t('track.search')}</span>
            </button>
          </form>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Found Order Card */}
        {order && (
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
              <div>
                <span className="text-xs text-indigo-400 font-mono">{order.id}</span>
                <h3 className="text-xl font-bold text-white">{order.productName}</h3>
                <p className="text-xs text-slate-400">{order.customerEmail}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                  {t(`status.${order.paymentStatus}`)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300">
                  {t(`status.${order.fulfillmentStatus}`)}
                </span>
              </div>
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">
                  {language === 'ar' ? 'المبلغ المطلوب:' : 'Amount:'}
                </span>
                <span className="font-bold text-white text-sm">
                  {(order.priceCents / 100).toFixed(2)} {order.currency}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">
                  {language === 'ar' ? 'طريقة الدفع:' : 'Method:'}
                </span>
                <span className="font-semibold text-slate-200">
                  {order.paymentMethodName || (language === 'ar' ? 'تحويل كاش' : 'Cash')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">
                  {language === 'ar' ? 'تاريخ الطلب:' : 'Order Date:'}
                </span>
                <span className="font-medium text-slate-300">
                  {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">
                  {language === 'ar' ? 'الهدف التقديري:' : 'Target Time:'}
                </span>
                <span className="font-semibold text-cyan-300">
                  {language === 'ar' ? '5 دقائق بعد التحقق' : '5 mins after verification'}
                </span>
              </div>
            </div>

            {/* Notes if invitation is sent */}
            {order.actualDispatchNotes && (
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs sm:text-sm text-indigo-200 space-y-1">
                <span className="font-bold text-white block">
                  {language === 'ar' ? 'ملاحظات إرسال الدعوة:' : 'Invitation Dispatch Details:'}
                </span>
                <p>{order.actualDispatchNotes}</p>
              </div>
            )}

            {/* Rejection reason if any */}
            {order.rejectionReason && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm text-rose-300 space-y-1">
                <span className="font-bold text-rose-200 block">
                  {language === 'ar' ? 'تنبيه بشأن إثبات الدفع:' : 'Payment Verification Issue:'}
                </span>
                <p>{order.rejectionReason}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/order/${order.id}`}
                className="glow-btn px-5 py-2.5 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <span>{language === 'ar' ? 'صفحة تفاصيل الدفع والإيصال' : 'Payment & Receipt Details'}</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
