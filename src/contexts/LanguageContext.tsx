'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

export interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Translations> = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.features': 'المميزات',
    'nav.howItWorks': 'كيف يعمل؟',
    'nav.faq': 'الأسئلة الشائعة',
    'nav.contact': 'تواصل معنا',
    'nav.trackOrder': 'تتبع طلبي',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'حساب جديد',
    'nav.dashboard': 'لوحة التحكم',
    'nav.admin': 'الإدارة',
    'nav.logout': 'تسجيل الخروج',
    'nav.orderNow': 'اطلب الآن',
    'nav.switchLang': 'English',

    // Hero Section
    'hero.badge': 'الجيل القادم من الذكاء الاصطناعي',
    'hero.title': 'افتح عالم الذكاء الاصطناعي مع Google AI Pro',
    'hero.subtitle': 'طوّر دراستك وإنتاجيتك وإبداعك باستخدام أدوات الذكاء الاصطناعي المتقدمة.',
    'hero.price': '25 جنيه مصري',
    'hero.priceSub': 'دعوة رسمية لتفعيل الاشتراك',
    'hero.ctaPrimary': 'اطلب اشتراكك الآن',
    'hero.ctaSecondary': 'اكتشف المميزات',
    'hero.deliveryTarget': 'هدف المعالجة: 5 دقائق بعد التحقق من الدفع (وفق التوافر)',
    'hero.disclaimer': 'ملاحظة توضيحية: هذه خدمة وسيطة مستقلة لإرسال دعوات الاشتراك، وليست تابعة لشركة Google أو معتمدة رسمياً منها.',
    'hero.featuresList1': 'تفعيل على بريدك الإلكتروني الشخصي',
    'hero.featuresList2': 'دفع فوري عبر كاش وإنستاباي (InstaPay)',
    'hero.featuresList3': 'دعم فني سريع ومتابعة مستمرة',

    // Features Section
    'features.title': 'اكتشف إمكانيات Google AI Pro',
    'features.subtitle': 'أدوات ذكية تساعدك على التعلم والإبداع وإنجاز مهامك بكفاءة.',
    'features.disclaimer': 'ملاحظة: تختلف المزايا وحدود الاستخدام الدقيقة وفق شروط خطط Google الحالية، وأهلية الحساب الجغرافي.',
    'features.card1.title': 'Gemini AI',
    'features.card1.desc': 'مساعد ذكي يساعدك على الكتابة والتلخيص وشرح الأفكار وحل المشكلات والمساعدة في البرمجة.',
    'features.card2.title': 'Deep Research',
    'features.card2.desc': 'استكشف الموضوعات المعقدة وساعد في جمع المعلومات وتنظيمها وإعداد تقارير بحثية مفصلة.',
    'features.card3.title': 'NotebookLM',
    'features.card3.desc': 'حلّل مصادر الدراسة والمستندات، وأنشئ ملخصات ومراجعات تساعدك على فهم المحتوى.',
    'features.card4.title': 'إنشاء الصور والفيديو بالذكاء الاصطناعي',
    'features.card4.desc': 'استكشف أدوات إنشاء المحتوى المرئي والصور والفيديو باستخدام الذكاء الاصطناعي، حسب المزايا المتاحة في خطتك.',
    'features.card5.title': 'Gemini في تطبيقات Google',
    'features.card5.desc': 'استفد من مساعدات الذكاء الاصطناعي في تطبيقات Google المدعومة مثل Gmail وGoogle Docs، وفق التوافر.',
    'features.card6.title': 'مساحة تخزين Google One',
    'features.card6.desc': 'استفد من مساحة التخزين المرتبطة بخطتك، إذا كانت مشمولة في الاشتراك الفعلي الذي ستحصل عليه.',
    'features.orderBtn': 'اطلب هذا الاشتراك',
    'features.officialLink': 'معلومات المنتج الرسمية',

    // How it works
    'how.title': 'كيف تحصل على اشتراكك؟',
    'how.subtitle': 'خطوات بسيطة وواضحة لاستلام دعوتك في أسرع وقت',
    'how.step1.title': 'البريد الإلكتروني',
    'how.step1.desc': 'أدخل بريدك الإلكتروني الصحيح الذي ترغب في استلام الدعوة عليه.',
    'how.step2.title': 'تحويل المبلغ',
    'how.step2.desc': 'حوّل المبلغ إلى وسيلة الدفع المعروضة (فودافون كاش، إنستاباي، إلخ).',
    'how.step3.title': 'رفع إثبات الدفع',
    'how.step3.desc': 'ارفع إثبات الدفع (سكرين شوت أو إيصال) وانتظر مراجعة الإدارة.',
    'how.step4.title': 'استلام الدعوة',
    'how.step4.desc': 'بعد تأكيد الدفع، تتم معالجة الطلب وإرسال الدعوة إذا كان الاشتراك متاحًا ومؤهلًا.',
    'how.speedNotice': 'الهدف التقديري للمعالجة هو 5 دقائق بعد التحقق من الدفع بنجاح، رهن التوافر وتوافق الحساب (ليس وقتاً مضموناً حتمياً).',
    'how.statusLegend': 'مراحل الطلب الدقيقة:',
    'how.status1': '1. تم استلام الدفع',
    'how.status2': '2. تمت مراجعة الدفع والموافقة',
    'how.status3': '3. جاري معالجة الدعوة',
    'how.status4': '4. تم إرسال الدعوة بنجاح',

    // Checkout
    'checkout.title': 'طلب اشتراك Google AI Pro',
    'checkout.subtitle': 'أكمل بياناتك لتحصل على دعوة تفعيل الاشتراك',
    'checkout.fullName': 'الاسم بالكامل',
    'checkout.email': 'البريد الإلكتروني (حساب Google)',
    'checkout.confirmEmail': 'تأكيد البريد الإلكتروني',
    'checkout.phone': 'رقم الهاتف / الواتساب (اختياري)',
    'checkout.termsAgree': 'أوافق على الشروط والأحكام، وسياسة الخصوصية، وسياسة الاسترجاع.',
    'checkout.submit': 'متابعة إلى خيارات الدفع',
    'checkout.orderSummary': 'ملخص الطلب',
    'checkout.product': 'المنتج',
    'checkout.productName': 'دعوة اشتراك Google AI Pro',
    'checkout.price': 'السعر الإجمالي',
    'checkout.paymentMethod': 'طريقة الدفع',
    'checkout.paymentCash': 'تحويل كاش / إنستاباي',
    'checkout.securityNote': 'تنبيه أمان: لن نطلب منك مطلقاً كلمة مرور حساب Google الخاص بك أو رموز التحقق.',
    'checkout.errorEmailMismatch': 'البريد الإلكتروني وتأكيده غير متطابقين!',
    'checkout.errorTermsRequired': 'يرجى الموافقة على الشروط والأحكام للمتابعة.',
    'checkout.creating': 'جاري تجهيز الطلب...',

    // Payment & Receipt
    'payment.title': 'إتمام الدفع ورفع الإيصال',
    'payment.orderId': 'رقم الطلب',
    'payment.amountToPay': 'المبلغ المطلوب تحويله',
    'payment.selectMethod': 'اختر طريقة الدفع المناسبة:',
    'payment.recipientName': 'اسم المستلم',
    'payment.accountNumber': 'رقم التحويل / المعرف',
    'payment.copy': 'نسخ',
    'payment.copied': 'تم النسخ!',
    'payment.instructions': 'تعليمات التحويل:',
    'payment.uploadProof': 'رفع إثبات التحويل (سكرين شوت أو إيصال PDF/صورة)',
    'payment.txRef': 'الرقم المرجعي للتحويل / رقم المحفظة المحول منها (اختياري)',
    'payment.dropFile': 'اسحب الإيصال هنا أو اضغط للاختيار',
    'payment.supportedFiles': 'الملفات المدعومة: JPG, PNG, WebP, PDF (الحد الأقصى 5 ميجابايت)',
    'payment.submitProof': 'تأكيد ورفع الإثبات',
    'payment.uploading': 'جاري التحقق والرفع...',
    'payment.proofUploaded': 'تم رفع إثبات الدفع بنجاح وهو الآن قيد المراجعة الفورية من قبل فريق العمل.',
    'payment.replaceProof': 'استبدال الإيصال بإيصال جديد',
    'payment.warningNotAuto': 'تنبيه: مجرد رفع الصورة لا يعني تأكيد الدفع فورياً؛ يقوم المسؤول بمطابقة التحويل في الحساب البنكي أو المحفظة.',

    // Tracking & Timeline
    'track.title': 'تتبع حالة طلبك',
    'track.subtitle': 'أدخل رقم الطلب وبريدك الإلكتروني للاطلاع على آخر التحديثات',
    'track.orderNumber': 'رقم الطلب (مثال: GAP-2026-...)',
    'track.email': 'البريد الإلكتروني للطلب',
    'track.search': 'بحث عن الطلب',
    'track.notFound': 'لم يتم العثور على طلب بهذه البيانات. يرجى التأكد من رقم الطلب والبريد.',
    'status.awaiting_payment': 'في انتظار الدفع',
    'status.receipt_submitted': 'تم رفع الإيصال',
    'status.under_review': 'قيد مراجعة الدفع',
    'status.approved': 'تم تأكيد الدفع',
    'status.processing': 'جاري تجهيز الدعوة',
    'status.invitation_sent': 'تم إرسال الدعوة',
    'status.completed': 'مكتمل بنجاح',
    'status.rejected': 'تم رفض إثبات الدفع',
    'status.more_info': 'مطلوب معلومات إضافية / إيصال أوضح',
    'status.cancelled': 'ملغي',
    'status.refunded': 'تم استرداد المبلغ',

    // Customer Dashboard
    'customer.welcome': 'مرحباً بك',
    'customer.myOrders': 'طلباتي',
    'customer.noOrders': 'لا توجد طلبات مسجلة حتى الآن.',
    'customer.activeOrders': 'الطلبات النشطة',
    'customer.awaitingPayment': 'في انتظار الدفع',
    'customer.receiptsUnderReview': 'إيصالات قيد المراجعة',
    'customer.completedOrders': 'الطلبات المكتملة',

    // Admin
    'admin.dashboard': 'لوحة الإدارة الشاملة',
    'admin.confirmedRevenue': 'الإيرادات المؤكدة',
    'admin.totalOrders': 'إجمالي الطلبات',
    'admin.pendingReview': 'إيصالات بانتظار المراجعة',
    'admin.pendingDispatch': 'دعوات بانتظار الإرسال',
    'admin.delayedOrders': 'تنبيه: طلبات متأخرة (>5 دقائق)',
    'admin.approve': 'قبول الدفع',
    'admin.reject': 'رفض الدفع',
    'admin.sendInvite': 'تسجيل إرسال الدعوة',
    'admin.complete': 'إكمال الطلب',
    'admin.cancel': 'إلغاء الطلب',
    'admin.refund': 'تسجيل استرداد',
    'admin.exportCsv': 'تصدير الطلبات (CSV)',
    'admin.products': 'إعدادات المنتج والأسعار',
    'admin.paymentMethods': 'طرق الدفع',
    'admin.siteSettings': 'إعدادات الموقع',
    'admin.auditLogs': 'سجل العمليات والرقابة',
    'admin.emailLogs': 'سجل الإشعارات البريدية',

    // Trust & Policies
    'policy.terms': 'الشروط والأحكام',
    'policy.privacy': 'سياسة الخصوصية',
    'policy.refund': 'سياسة الاسترجاع',
    'policy.faq': 'الأسئلة المتكررة',
    'footer.copyright': 'جميع الحقوق محفوظة © Google AI Pro Store.',
    'footer.disclaimer': 'Google AI Pro وGoogle وGemini هي علامات تجارية مملوكة لشركة Google LLC. هذا الموقع هو منصة مستقلة توفر خدمات التفعيل والوساطة الرقمية ولا يدّعي أي ملكية أو تمثيل رسمي لشركة Google.',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.howItWorks': 'How It Works',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact Us',
    'nav.trackOrder': 'Track My Order',
    'nav.login': 'Sign In',
    'nav.register': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin',
    'nav.logout': 'Sign Out',
    'nav.orderNow': 'Order Now',
    'nav.switchLang': 'العربية',

    // Hero Section
    'hero.badge': 'Next-Generation Artificial Intelligence',
    'hero.title': 'Unlock the World of AI with Google AI Pro',
    'hero.subtitle': 'Supercharge your learning, productivity, and creativity with advanced AI tools.',
    'hero.price': '25 EGP',
    'hero.priceSub': 'Official Invitation to Activate Subscription',
    'hero.ctaPrimary': 'Order Your Subscription Now',
    'hero.ctaSecondary': 'Explore Features',
    'hero.deliveryTarget': 'Estimated Processing Target: 5 minutes after payment verification (subject to availability)',
    'hero.disclaimer': 'Disclosure: This is an independent third-party subscription facilitation service. It is not operated, owned, or endorsed by Google LLC.',
    'hero.featuresList1': 'Activated directly on your personal Google email',
    'hero.featuresList2': 'Instant payment via Mobile Cash & InstaPay',
    'hero.featuresList3': 'Dedicated support & continuous tracking',

    // Features Section
    'features.title': 'Explore Google AI Pro Capabilities',
    'features.subtitle': 'Intelligent tools crafted to help you study, create, and achieve with peak efficiency.',
    'features.disclaimer': 'Note: Exact benefits and usage limits depend on current Google plan terms, account eligibility, and regional availability.',
    'features.card1.title': 'Gemini AI',
    'features.card1.desc': 'Intelligent assistant helping you write, summarize, clarify concepts, solve problems, and assist in programming.',
    'features.card2.title': 'Deep Research',
    'features.card2.desc': 'Explore complex topics, gather and synthesize information, and assemble comprehensive research reports.',
    'features.card3.title': 'NotebookLM',
    'features.card3.desc': 'Analyze study sources and documents, generate summaries, study guides, and review materials to master content.',
    'features.card4.title': 'AI Image & Video Creation',
    'features.card4.desc': 'Explore creative AI tools for visual content, images, and video creation, based on features available in your plan.',
    'features.card5.title': 'Gemini in Google Apps',
    'features.card5.desc': 'Take advantage of AI assistance across supported Google Workspace apps like Gmail and Google Docs, subject to availability.',
    'features.card6.title': 'Google One Storage',
    'features.card6.desc': 'Benefit from cloud storage linked with your plan, if included in the actual subscription package provided.',
    'features.orderBtn': 'Order This Plan',
    'features.officialLink': 'Official Google Product Info',

    // How it works
    'how.title': 'How It Works',
    'how.subtitle': 'Clear, simple steps to receive your subscription invitation swiftly',
    'how.step1.title': 'Enter Your Email',
    'how.step1.desc': 'Provide your correct personal email address where you wish to receive the invitation.',
    'how.step2.title': 'Transfer Payment',
    'how.step2.desc': 'Transfer the exact amount to one of the displayed payment accounts (Vodafone Cash, InstaPay, etc.).',
    'how.step3.title': 'Upload Payment Proof',
    'how.step3.desc': 'Upload your transfer receipt or screenshot and wait for administrative verification.',
    'how.step4.title': 'Receive Invitation',
    'how.step4.desc': 'Upon payment verification, your order is processed and the official invitation is dispatched if available and eligible.',
    'how.speedNotice': 'Estimated target processing time is 5 minutes following successful payment verification, subject to availability (not a guaranteed delivery timeframe).',
    'how.statusLegend': 'Detailed Order Lifecycle Stages:',
    'how.status1': '1. Payment Received',
    'how.status2': '2. Payment Approved',
    'how.status3': '3. Invitation Processing',
    'how.status4': '4. Invitation Dispatched',

    // Checkout
    'checkout.title': 'Order Google AI Pro Subscription',
    'checkout.subtitle': 'Fill in your details to receive your activation invitation',
    'checkout.fullName': 'Full Name',
    'checkout.email': 'Google Account Email',
    'checkout.confirmEmail': 'Confirm Email Address',
    'checkout.phone': 'Phone / WhatsApp Number (Optional)',
    'checkout.termsAgree': 'I agree to the Terms of Service, Privacy Policy, and Refund Policy.',
    'checkout.submit': 'Proceed to Payment Options',
    'checkout.orderSummary': 'Order Summary',
    'checkout.product': 'Product',
    'checkout.productName': 'Google AI Pro Subscription Invitation',
    'checkout.price': 'Total Amount',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.paymentCash': 'Cash Transfer / InstaPay',
    'checkout.securityNote': 'Security Notice: We will NEVER ask for your Google account password or verification codes.',
    'checkout.errorEmailMismatch': 'Email addresses do not match!',
    'checkout.errorTermsRequired': 'Please agree to the Terms and Policies to proceed.',
    'checkout.creating': 'Creating your order...',

    // Payment & Receipt
    'payment.title': 'Complete Payment & Upload Receipt',
    'payment.orderId': 'Order ID',
    'payment.amountToPay': 'Amount to Transfer',
    'payment.selectMethod': 'Select Payment Method:',
    'payment.recipientName': 'Recipient Name',
    'payment.accountNumber': 'Transfer Number / Identifier',
    'payment.copy': 'Copy',
    'payment.copied': 'Copied!',
    'payment.instructions': 'Transfer Instructions:',
    'payment.uploadProof': 'Upload Transfer Proof (Screenshot or Receipt PDF/Image)',
    'payment.txRef': 'Transaction Reference / Sender Wallet Number (Optional)',
    'payment.dropFile': 'Drag and drop your receipt here or click to browse',
    'payment.supportedFiles': 'Supported formats: JPG, PNG, WebP, PDF (Max 5MB)',
    'payment.submitProof': 'Submit & Upload Receipt',
    'payment.uploading': 'Validating & Uploading...',
    'payment.proofUploaded': 'Payment proof uploaded successfully! Our team is reviewing it now.',
    'payment.replaceProof': 'Replace with a new receipt',
    'payment.warningNotAuto': 'Notice: Uploading an image does not automatically mark payment as approved. Staff must verify funds in the account.',

    // Tracking & Timeline
    'track.title': 'Track Your Order',
    'track.subtitle': 'Enter your Order ID and Email to inspect the latest real-time status',
    'track.orderNumber': 'Order ID (e.g. GAP-2026-...)',
    'track.email': 'Order Email Address',
    'track.search': 'Track Order',
    'track.notFound': 'No order found with the provided details. Please check the Order ID and email.',
    'status.awaiting_payment': 'Awaiting Payment',
    'status.receipt_submitted': 'Receipt Submitted',
    'status.under_review': 'Under Payment Review',
    'status.approved': 'Payment Approved',
    'status.processing': 'Invitation Processing',
    'status.invitation_sent': 'Invitation Sent',
    'status.completed': 'Completed',
    'status.rejected': 'Payment Rejected',
    'status.more_info': 'Additional Information / Clearer Receipt Required',
    'status.cancelled': 'Cancelled',
    'status.refunded': 'Refunded',

    // Customer Dashboard
    'customer.welcome': 'Welcome',
    'customer.myOrders': 'My Orders',
    'customer.noOrders': 'No orders found yet.',
    'customer.activeOrders': 'Active Orders',
    'customer.awaitingPayment': 'Awaiting Payment',
    'customer.receiptsUnderReview': 'Receipts Under Review',
    'customer.completedOrders': 'Completed Orders',

    // Admin
    'admin.dashboard': 'Admin Command Center',
    'admin.confirmedRevenue': 'Confirmed Revenue',
    'admin.totalOrders': 'Total Orders',
    'admin.pendingReview': 'Receipts Pending Review',
    'admin.pendingDispatch': 'Invitations Awaiting Dispatch',
    'admin.delayedOrders': 'Delayed Orders Alert (>5m)',
    'admin.approve': 'Approve Payment',
    'admin.reject': 'Reject Payment',
    'admin.sendInvite': 'Record Invitation Sent',
    'admin.complete': 'Mark Completed',
    'admin.cancel': 'Cancel Order',
    'admin.refund': 'Record Refund',
    'admin.exportCsv': 'Export Orders (CSV)',
    'admin.products': 'Product & Pricing Settings',
    'admin.paymentMethods': 'Payment Methods',
    'admin.siteSettings': 'Site Settings',
    'admin.auditLogs': 'Audit Logs',
    'admin.emailLogs': 'Email Notification Logs',

    // Trust & Policies
    'policy.terms': 'Terms of Service',
    'policy.privacy': 'Privacy Policy',
    'policy.refund': 'Refund Policy',
    'policy.faq': 'Frequently Asked Questions',
    'footer.copyright': 'All rights reserved © Google AI Pro Store.',
    'footer.disclaimer': 'Google, Google AI Pro, and Gemini are trademarks of Google LLC. This platform is an independent service facilitator and does not claim any official affiliation with or endorsement by Google LLC.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('gap_language') as Language;
    if (saved === 'ar' || saved === 'en') {
      setLanguageState(saved);
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = saved;
    } else {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('gap_language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
