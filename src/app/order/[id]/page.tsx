'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Order, PaymentMethod } from '@/lib/types';
import {
  Copy,
  Check,
  UploadCloud,
  FileText,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Phone,
  Info,
  ExternalLink,
} from 'lucide-react';

function OrderPaymentContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [txReference, setTxReference] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchOrderData = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        throw new Error('Order not found or unauthorized');
      }
      const data = await res.json();
      setOrder(data.order);
      if (data.order.paymentMethodId) {
        setSelectedMethodId(data.order.paymentMethodId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load order';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/public/config');
      const data = await res.json();
      if (data.paymentMethods) {
        setPaymentMethods(data.paymentMethods);
        if (!selectedMethodId && data.paymentMethods.length > 0) {
          setSelectedMethodId(data.paymentMethods[0].id);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchOrderData();
    fetchMethods();
  }, [id]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg(language === 'ar' ? 'الحد الأقصى لحجم الملف هو 15 ميجابايت.' : 'File size cannot exceed 15MB.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg(language === 'ar' ? 'يرجى اختيار ملف الإيصال أولاً.' : 'Please select a receipt file.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (txReference) formData.append('transactionReference', txReference);
    if (selectedMethodId) formData.append('paymentMethodId', selectedMethodId);
    if (order?.customerEmail) formData.append('email', order.customerEmail);
    formData.append('language', language);

    try {
      const res = await fetch(`/api/orders/${id}/receipt`, {
        method: 'POST',
        body: formData,
      });

      let data: Record<string, any> = {};
      try {
        data = await res.json();
      } catch {
        data = { error: res.statusText || 'Upload failed' };
      }

      if (!res.ok) {
        throw new Error(data.error || (language === 'ar' ? 'تعذر رفع الإيصال. يرجى المحاولة مرة أخرى أو التأكد من نوع الملف.' : 'Failed to upload receipt'));
      }

      setSuccessMsg(t('payment.proofUploaded'));
      setSelectedFile(null);
      setOrder(data.order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMsg(msg);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm">{language === 'ar' ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-32 pb-20 max-w-lg mx-auto px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">
          {language === 'ar' ? 'تعذر العثور على الطلب' : 'Order Not Found'}
        </h2>
        <p className="text-sm text-slate-400">
          {errorMsg || (language === 'ar' ? 'الطلب غير موجود أو لا تملك صلاحية الوصول إليه.' : 'Order does not exist or unauthorized.')}
        </p>
        <Link href="/" className="inline-block mt-4 px-6 py-2.5 rounded-xl glow-btn text-white text-xs font-semibold">
          {t('nav.home')}
        </Link>
      </div>
    );
  }

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId) || paymentMethods[0];
  const priceFormatted = `${(order.priceCents / 100).toFixed(2)} ${order.currency}`;

  // 7-Stage Timeline steps
  const timelineStages = [
    { key: 'awaiting_payment', label: t('status.awaiting_payment') },
    { key: 'receipt_submitted', label: t('status.receipt_submitted') },
    { key: 'under_review', label: t('status.under_review') },
    { key: 'approved', label: t('status.approved') },
    { key: 'processing', label: t('status.processing') },
    { key: 'invitation_sent', label: t('status.invitation_sent') },
    { key: 'completed', label: t('status.completed') },
  ];

  // Helper to determine stage state
  const getStageStatus = (stageKey: string) => {
    const p = order.paymentStatus;
    const f = order.fulfillmentStatus;

    if (f === 'completed') return 'completed';

    if (stageKey === 'awaiting_payment') {
      return p !== 'awaiting_payment' ? 'completed' : 'current';
    }
    if (stageKey === 'receipt_submitted') {
      if (p === 'awaiting_payment') return 'upcoming';
      return p === 'receipt_submitted' ? 'current' : 'completed';
    }
    if (stageKey === 'under_review') {
      if (p === 'awaiting_payment' || p === 'receipt_submitted') return 'upcoming';
      return p === 'under_review' ? 'current' : 'completed';
    }
    if (stageKey === 'approved') {
      if (p === 'approved') return 'completed';
      return 'upcoming';
    }
    if (stageKey === 'processing') {
      if (p === 'approved' && f === 'processing') return 'current';
      if (f === 'invitation_sent') return 'completed';
      return 'upcoming';
    }
    if (stageKey === 'invitation_sent') {
      if (f === 'invitation_sent') return 'current';
      return 'upcoming';
    }
    if (stageKey === 'completed') {
      return 'upcoming';
    }
    return 'upcoming';
  };

  const isReceiptUploadAllowed =
    order.paymentStatus !== 'approved' && order.fulfillmentStatus !== 'completed' && order.fulfillmentStatus !== 'cancelled';

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Order Header Card */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-mono">
                {t('payment.orderId')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                {order.id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {order.productName}
            </h1>
            <p className="text-xs text-slate-400">
              {language === 'ar' ? 'البريد المسجل للاستلام:' : 'Target activation email:'}{' '}
              <span className="text-white font-medium">{order.customerEmail}</span>
            </p>
          </div>

          <div className="text-start md:text-end space-y-1">
            <span className="text-xs text-slate-400 block">{t('payment.amountToPay')}</span>
            <div className="text-3xl sm:text-4xl font-black text-white text-gradient-purple">
              {priceFormatted}
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center md:justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {language === 'ar' ? 'سعر ثابت ومؤكد' : 'Confirmed locked price'}
            </span>
          </div>
        </div>

        {/* Dynamic 7-Stage Progress Timeline */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{language === 'ar' ? 'مراحل متابعة الطلب الحية' : 'Live Order Progress Timeline'}</span>
            </h3>

            {/* Target time indication */}
            <div className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{t('hero.deliveryTarget')}</span>
            </div>
          </div>

          {/* Timeline Bar */}
          <div className="relative pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {timelineStages.map((stage, idx) => {
                const status = getStageStatus(stage.key);
                return (
                  <div
                    key={stage.key}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      status === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : status === 'current'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 animate-pulse'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1.5">
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold w-4 h-4 rounded-full border flex items-center justify-center">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold block leading-tight">
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special notices for rejection or more info */}
          {order.paymentStatus === 'rejected' && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm space-y-1">
              <div className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{t('status.rejected')}</span>
              </div>
              <p>{order.rejectionReason || 'يرجى مراجعة إيصال التحويل ورفعه مرة أخرى أو التواصل مع الدعم.'}</p>
            </div>
          )}

          {order.actualDispatchNotes && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs sm:text-sm space-y-1">
              <span className="font-bold text-white block">
                {language === 'ar' ? 'ملاحظات إرسال الدعوة:' : 'Invitation Dispatch Notes:'}
              </span>
              <p>{order.actualDispatchNotes}</p>
            </div>
          )}
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Main Grid: Payment Instructions & Receipt Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Payment Method Selector & Instructions */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{t('payment.selectMethod')}</span>
            </h2>

            {/* Payment Method Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const isSelected = method.id === selectedMethodId;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethodId(method.id)}
                    className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-1">
                      {language === 'ar' ? method.nameAr : method.nameEn}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {method.accountIdentifier}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Method Details Box */}
            {selectedMethod && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-xs text-slate-400">{t('payment.recipientName')}:</span>
                  <span className="text-xs font-bold text-white">{selectedMethod.recipientName}</span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <span className="text-xs text-slate-400">{t('payment.accountNumber')}:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-cyan-300">
                      {selectedMethod.accountIdentifier}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedMethod.accountIdentifier, 'account')}
                      className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      title={t('payment.copy')}
                    >
                      {copiedKey === 'account' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1.5">{t('payment.instructions')}</span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                    {language === 'ar' ? selectedMethod.instructionsAr : selectedMethod.instructionsEn}
                  </p>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p>{t('payment.warningNotAuto')}</p>
            </div>
          </div>

          {/* Receipt Upload Form */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <span>{t('payment.uploadProof')}</span>
            </h2>

            {/* List existing proofs if any */}
            {order.proofs && order.proofs.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-slate-400 block">
                  {language === 'ar' ? 'الإيصالات المرفوعة سابقاً:' : 'Previously Uploaded Receipts:'}
                </span>
                {order.proofs.map((proof, idx) => (
                  <div
                    key={proof.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="truncate text-slate-300">{proof.originalFilename}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({Math.round(proof.fileSizeBytes / 1024)} KB)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          proof.reviewStatus === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : proof.reviewStatus === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {proof.reviewStatus}
                      </span>
                      <a
                        href={`/api/receipts/${proof.id}?email=${encodeURIComponent(order.customerEmail)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 p-1"
                        title={language === 'ar' ? 'معاينة الإيصال' : 'View receipt'}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isReceiptUploadAllowed ? (
              <form onSubmit={handleUploadReceipt} className="space-y-4">
                {/* Transaction Ref input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t('payment.txRef')}
                  </label>
                  <input
                    type="text"
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: TXN-123456 أو 010...' : 'e.g. TXN-123456 or Wallet #'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'ملف الإيصال' : 'Receipt File'} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center transition-colors bg-slate-900/40">
                    <input
                      type="file"
                      accept="image/*,.pdf,.heic,.heif"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-300">
                      {selectedFile ? selectedFile.name : t('payment.dropFile')}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {t('payment.supportedFiles')}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full py-3.5 rounded-xl glow-btn text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-500/20"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t('payment.uploading')}</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>
                        {order.proofs && order.proofs.length > 0
                          ? t('payment.replaceProof')
                          : t('payment.submitProof')}
                      </span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'ar'
                      ? 'تمت مراجعة واعتماد إثبات الدفع لهذا الطلب.'
                      : 'Payment has been approved for this order.'}
                  </span>
                </div>
                <p className="text-slate-400">
                  {language === 'ar'
                    ? 'لا حاجة لرفع إيصالات إضافية. يمكنك متابعة حالة إرسال الدعوة في الجدول الزمني أعلاه.'
                    : 'No further receipts needed. Please track your invitation dispatch above.'}
                </p>
              </div>
            )}

            {/* Quick Support Helper */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>{language === 'ar' ? 'هل تواجه أي مشكلة؟' : 'Need help with transfer?'}</span>
              <a
                href="https://wa.me/201000000001"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>واتساب الدعم الفني</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function OrderPaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-sm">جاري تحميل تفاصيل الطلب...</span>
          </div>
        </div>
      }
    >
      <OrderPaymentContent params={params} />
    </React.Suspense>
  );
}

