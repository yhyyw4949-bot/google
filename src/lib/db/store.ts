import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UserProfile,
  ProductConfig,
  PaymentMethod,
  Order,
  PaymentProof,
  OrderStatusHistoryItem,
  AdminNote,
  AuditLog,
  EmailNotification,
  SiteSettings,
  PaymentStatus,
  FulfillmentStatus,
} from '../types';

interface DatabaseData {
  profiles: UserProfile[];
  passwords: Record<string, string>; // userId -> password hash
  products: ProductConfig[];
  paymentMethods: PaymentMethod[];
  orders: Order[];
  paymentProofs: PaymentProof[];
  orderStatusHistory: OrderStatusHistoryItem[];
  adminNotes: AdminNote[];
  auditLogs: AuditLog[];
  emailNotifications: EmailNotification[];
  siteSettings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Helper to hash passwords securely
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_googleaipro_salt_2026').digest('hex');
}

export function generateOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `GAP-${dateStr}-${randomSuffix}`;
}

const INITIAL_DATA: DatabaseData = {
  profiles: [
    {
      id: 'admin-001',
      email: 'admin@googleaipro.eg',
      fullName: 'مدير النظام الرئيسي',
      phone: '+20 100 000 0001',
      role: 'admin',
      isSuspended: false,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 'user-001',
      email: 'ahmed@example.com',
      fullName: 'أحمد محمود',
      phone: '+20 102 345 6789',
      role: 'customer',
      isSuspended: false,
      createdAt: '2026-10-10T12:00:00.000Z',
      updatedAt: '2026-10-10T12:00:00.000Z',
    },
  ],
  passwords: {
    'admin-001': hashPassword('Admin@123456'),
    'user-001': hashPassword('User@123456'),
  },
  products: [
    {
      id: 'google-ai-pro-invite',
      titleAr: 'Google AI Pro',
      titleEn: 'Google AI Pro',
      descAr: 'دعوة تفعيل رسمية لاشتراك Google AI Pro المتقدم على بريدك الشخصي.',
      descEn: 'Official activation invitation for advanced Google AI Pro subscription on your personal email.',
      priceCents: 2500, // 25.00 EGP
      currency: 'EGP',
      isAvailable: true,
      durationAr: 'دعوة تفعيل للاشتراك المتاح وفق شروط Google',
      durationEn: 'Activation invitation for available subscription under Google terms',
      deliveryTargetMins: 5,
      maxQuota: 5, // Exactly 5 orders limit batch
      batchResetTimestamp: '2026-10-16T00:00:00.000Z',
      batchNumber: 1,
      disclaimerAr: 'تنبيه: هذه خدمة وساطة مستقلة. تختلف المزايا وحدود الاستخدام الدقيقة وفق شروط خطط Google الحالية، وأهلية الحساب الجغرافي. لا تتضمن حسابات YouTube Premium مالم يذكر ذلك صراحة.',
      disclaimerEn: 'Notice: This is an independent intermediary service. Exact benefits and usage limits depend on current Google plan terms and account eligibility. Does not include YouTube Premium unless explicitly verified.',
      featureCards: [
        {
          id: 'card-1',
          titleAr: 'Gemini AI',
          titleEn: 'Gemini AI',
          descAr: 'مساعد ذكي يساعدك على الكتابة والتلخيص وشرح الأفكار وحل المشكلات والمساعدة في البرمجة.',
          descEn: 'Intelligent assistant helping you write, summarize, clarify concepts, solve problems, and assist in programming.',
          iconName: 'Sparkles',
          officialUrl: 'https://gemini.google.com',
          isEnabled: true,
          order: 1,
        },
        {
          id: 'card-2',
          titleAr: 'Deep Research',
          titleEn: 'Deep Research',
          descAr: 'استكشف الموضوعات المعقدة وساعد في جمع المعلومات وتنظيمها وإعداد تقارير بحثية مفصلة.',
          descEn: 'Explore complex topics, gather and synthesize information, and assemble comprehensive research reports.',
          iconName: 'Search',
          officialUrl: 'https://blog.google/technology/ai/',
          isEnabled: true,
          order: 2,
        },
        {
          id: 'card-3',
          titleAr: 'NotebookLM',
          titleEn: 'NotebookLM',
          descAr: 'حلّل مصادر الدراسة والمستندات، وأنشئ ملخصات ومراجعات تساعدك على فهم المحتوى.',
          descEn: 'Analyze study sources and documents, generate summaries, study guides, and review materials to master content.',
          iconName: 'BookOpen',
          officialUrl: 'https://notebooklm.google',
          isEnabled: true,
          order: 3,
        },
        {
          id: 'card-4',
          titleAr: 'إنشاء الصور والفيديو بالذكاء الاصطناعي',
          titleEn: 'AI Image & Video Creation',
          descAr: 'استكشف أدوات إنشاء المحتوى المرئي والصور والفيديو باستخدام الذكاء الاصطناعي، حسب المزايا المتاحة في خطتك.',
          descEn: 'Explore creative AI tools for visual content, images, and video creation, based on features available in your plan.',
          iconName: 'Image',
          officialUrl: 'https://deepmind.google/technologies/imagen-3/',
          isEnabled: true,
          order: 4,
        },
        {
          id: 'card-5',
          titleAr: 'Gemini في تطبيقات Google',
          titleEn: 'Gemini in Google Apps',
          descAr: 'استفد من مساعدات الذكاء الاصطناعي في تطبيقات Google المدعومة مثل Gmail وGoogle Docs، وفق التوافر.',
          descEn: 'Take advantage of AI assistance across supported Google Workspace apps like Gmail and Google Docs, subject to availability.',
          iconName: 'LayoutGrid',
          officialUrl: 'https://workspace.google.com',
          isEnabled: true,
          order: 5,
        },
        {
          id: 'card-6',
          titleAr: 'مساحة تخزين Google One',
          titleEn: 'Google One Storage',
          descAr: 'استفد من مساحة التخزين المرتبطة بخطتك، إذا كانت مشمولة في الاشتراك الفعلي الذي ستحصل عليه.',
          descEn: 'Benefit from cloud storage linked with your plan, if included in the actual subscription package provided.',
          iconName: 'Cloud',
          officialUrl: 'https://one.google.com',
          isEnabled: true,
          order: 6,
        },
      ],
      updatedAt: '2026-10-16T12:00:00.000Z',
    },
  ],
  paymentMethods: [
    {
      id: 'method-voda',
      code: 'vodafone_cash',
      nameAr: 'فودافون كاش (Vodafone Cash)',
      nameEn: 'Vodafone Cash',
      recipientName: 'محفظة المتجر الرسمية',
      accountIdentifier: '01012345678',
      instructionsAr: 'قم بالتحويل عبر تطبيق أنا فودافون أو كود *9*7*الرقم*المبلغ# واحتفظ بلقطة الشاشة (سكرين شوت) للتحويل.',
      instructionsEn: 'Transfer via Ana Vodafone App or dial *9*7*Number*Amount# and keep a screenshot of the confirmation.',
      isEnabled: true,
      sortOrder: 1,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 'method-insta',
      code: 'instapay',
      nameAr: 'إنستاباي (InstaPay)',
      nameEn: 'InstaPay Egypt',
      recipientName: 'حساب إنستاباي المعتمد',
      accountIdentifier: 'googleaipro@instapay',
      instructionsAr: 'حول إلى معرف الدفع اللحظي (IPA): googleaipro@instapay واكتب رقم الطلب في خانة الملاحظات إن أمكن.',
      instructionsEn: 'Transfer to the Instant Payment Address (IPA): googleaipro@instapay and note your Order ID if possible.',
      isEnabled: true,
      sortOrder: 2,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 'method-etisalat',
      code: 'etisalat_cash',
      nameAr: 'اتصالات كاش (Etisalat Cash)',
      nameEn: 'Etisalat Cash',
      recipientName: 'محفظة المتجر',
      accountIdentifier: '01112345678',
      instructionsAr: 'حول المبلغ إلى رقم المحفظة المعروض وارفع صورة إشعار نجاح العملية.',
      instructionsEn: 'Transfer amount to the wallet number and upload the transaction success receipt.',
      isEnabled: true,
      sortOrder: 3,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
  ],
  orders: [
    {
      id: 'GAP-20261016-1001',
      customerId: 'user-001',
      customerName: 'أحمد محمود',
      customerEmail: 'ahmed@example.com',
      customerPhone: '+20 102 345 6789',
      productId: 'google-ai-pro-invite',
      productName: 'Google AI Pro',
      priceCents: 2500,
      currency: 'EGP',
      paymentMethodId: 'method-voda',
      paymentMethodName: 'فودافون كاش (Vodafone Cash)',
      paymentStatus: 'approved',
      fulfillmentStatus: 'completed',
      invitationSentAt: '2026-10-16T11:05:00.000Z',
      completedAt: '2026-10-16T11:08:00.000Z',
      actualDispatchNotes: 'تم إرسال الدعوة الرسمية بنجاح عبر نظام إدارة الدعوات المعتمد.',
      batchNumber: 1,
      createdAt: '2026-10-16T10:00:00.000Z',
      updatedAt: '2026-10-16T11:08:00.000Z',
    },
    {
      id: 'GAP-20261016-1002',
      customerName: 'سارة خالد',
      customerEmail: 'sara.khalid@gmail.com',
      customerPhone: '+20 111 222 3344',
      productId: 'google-ai-pro-invite',
      productName: 'Google AI Pro',
      priceCents: 2500,
      currency: 'EGP',
      paymentMethodId: 'method-insta',
      paymentMethodName: 'إنستاباي (InstaPay)',
      paymentStatus: 'receipt_submitted',
      fulfillmentStatus: 'pending',
      batchNumber: 1,
      createdAt: '2026-10-16T10:15:00.000Z',
      updatedAt: '2026-10-16T10:15:00.000Z',
    },
    {
      id: 'GAP-20261016-1003',
      customerName: 'محمود عبد الرحمن',
      customerEmail: 'mahmoud.abdel@gmail.com',
      customerPhone: '+20 122 998 7766',
      productId: 'google-ai-pro-invite',
      productName: 'Google AI Pro',
      priceCents: 2500,
      currency: 'EGP',
      paymentMethodId: 'method-voda',
      paymentMethodName: 'فودافون كاش (Vodafone Cash)',
      paymentStatus: 'awaiting_payment',
      fulfillmentStatus: 'pending',
      batchNumber: 1,
      createdAt: '2026-10-16T10:30:00.000Z',
      updatedAt: '2026-10-16T10:30:00.000Z',
    },
  ],
  paymentProofs: [
    {
      id: 'proof-001',
      orderId: 'GAP-20261016-1001',
      filePath: '/uploads/receipts/sample-receipt-1.png',
      originalFilename: 'vodafone_transfer.png',
      mimeType: 'image/png',
      fileSizeBytes: 245000,
      transactionReference: 'TXN-984210',
      reviewStatus: 'approved',
      reviewerId: 'admin-001',
      reviewTimestamp: '2026-10-16T11:04:00.000Z',
      createdAt: '2026-10-16T11:02:00.000Z',
    },
    {
      id: 'proof-002',
      orderId: 'GAP-20261016-1002',
      filePath: '/uploads/receipts/sample-receipt-2.png',
      originalFilename: 'instapay_payment.png',
      mimeType: 'image/png',
      fileSizeBytes: 312000,
      transactionReference: 'IPN-554411',
      reviewStatus: 'pending',
      createdAt: '2026-10-16T14:42:00.000Z',
    },
  ],
  orderStatusHistory: [
    {
      id: 'hist-001',
      orderId: 'GAP-20261016-1001',
      previousPaymentStatus: 'awaiting_payment',
      newPaymentStatus: 'receipt_submitted',
      previousFulfillmentStatus: 'pending',
      newFulfillmentStatus: 'pending',
      changedBy: 'customer',
      notes: 'تم رفع إثبات الدفع من قبل العميل',
      createdAt: '2026-10-16T11:02:00.000Z',
    },
    {
      id: 'hist-002',
      orderId: 'GAP-20261016-1001',
      previousPaymentStatus: 'receipt_submitted',
      newPaymentStatus: 'approved',
      previousFulfillmentStatus: 'pending',
      newFulfillmentStatus: 'processing',
      changedBy: 'مدير النظام الرئيسي',
      notes: 'تم التحقق من استلام المبلغ في فودافون كاش',
      createdAt: '2026-10-16T11:04:00.000Z',
    },
    {
      id: 'hist-003',
      orderId: 'GAP-20261016-1001',
      previousPaymentStatus: 'approved',
      newPaymentStatus: 'approved',
      previousFulfillmentStatus: 'processing',
      newFulfillmentStatus: 'invitation_sent',
      changedBy: 'مدير النظام الرئيسي',
      notes: 'تم إرسال دعوة التفعيل الرسمية إلى بريد العميل',
      createdAt: '2026-10-16T11:05:00.000Z',
    },
  ],
  adminNotes: [
    {
      id: 'note-001',
      orderId: 'GAP-20261016-1001',
      adminId: 'admin-001',
      adminName: 'مدير النظام الرئيسي',
      note: 'تم إتمام الطلب بنجاح في أقل من 5 دقائق.',
      isInternalOnly: true,
      createdAt: '2026-10-16T11:08:00.000Z',
    },
  ],
  auditLogs: [
    {
      id: 'audit-001',
      userEmail: 'admin@googleaipro.eg',
      action: 'APPROVE_PAYMENT',
      resourceType: 'orders',
      resourceId: 'GAP-20261016-1001',
      details: { amount: 2500, currency: 'EGP' },
      createdAt: '2026-10-16T11:04:00.000Z',
    },
    {
      id: 'audit-002',
      userEmail: 'admin@googleaipro.eg',
      action: 'DISPATCH_INVITATION',
      resourceType: 'orders',
      resourceId: 'GAP-20261016-1001',
      details: { channel: 'official_invite_link' },
      createdAt: '2026-10-16T11:05:00.000Z',
    },
  ],
  emailNotifications: [
    {
      id: 'email-001',
      orderId: 'GAP-20261016-1001',
      recipientEmail: 'ahmed@example.com',
      templateType: 'order_created',
      language: 'ar',
      subject: 'تم إنشاء طلبك بنجاح - رقم الطلب GAP-20261016-1001',
      bodyHtml: '<p>شكراً لطلبك اشتراك Google AI Pro. يرجى إتمام التحويل ورفع الإيصال.</p>',
      status: 'sent',
      sentAt: '2026-10-16T11:00:30.000Z',
      createdAt: '2026-10-16T11:00:00.000Z',
    },
    {
      id: 'email-002',
      orderId: 'GAP-20261016-1001',
      recipientEmail: 'ahmed@example.com',
      templateType: 'invitation_sent',
      language: 'ar',
      subject: 'تم إرسال دعوة تفعيل اشتراكك في Google AI Pro!',
      bodyHtml: '<p>تم إرسال دعوتك بنجاح إلى بريدك الإلكتروني. تفقد صندوق الوارد أو البريد الترويجي.</p>',
      status: 'sent',
      sentAt: '2026-10-16T11:05:10.000Z',
      createdAt: '2026-10-16T11:05:00.000Z',
    },
  ],
  siteSettings: {
    id: 'main',
    brandNameAr: 'متجر Google AI Pro مصر',
    brandNameEn: 'Google AI Pro Egypt Store',
    logoUrl: '/logo.png',
    contactEmail: 'support@googleaipro.eg',
    supportPhone: '+20 100 000 0001',
    whatsappNumber: '+20 100 000 0001',
    announcementAr: '⚡ سرعة المعالجة المقدرة 5 دقائق بعد تأكيد الدفع عبر فودافون كاش وإنستاباي!',
    announcementEn: '⚡ Target processing time: 5 minutes after payment verification via Mobile Cash & InstaPay!',
    isAnnouncementActive: true,
    maintenanceMode: false,
    updatedAt: '2026-10-16T12:00:00.000Z',
  },
};

class DBStore {
  private data: DatabaseData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content) as DatabaseData;
        // Ensure product has batch fields
        if (parsed.products && parsed.products[0]) {
          if (!parsed.products[0].maxQuota) parsed.products[0].maxQuota = 5;
          if (!parsed.products[0].batchNumber) parsed.products[0].batchNumber = 1;
          if (!parsed.products[0].batchResetTimestamp) parsed.products[0].batchResetTimestamp = '2026-10-16T00:00:00.000Z';
        }
        // Ensure existing orders have batchNumber assigned
        if (parsed.orders) {
          parsed.orders.forEach((o) => {
            if (o.batchNumber === undefined) {
              o.batchNumber = 1;
            }
          });
        }
        return parsed;
      }
    } catch (err) {
      console.error('Error loading DB file, falling back to initial data', err);
    }
    this.saveData(INITIAL_DATA);
    return INITIAL_DATA;
  }

  private saveData(data: DatabaseData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  // Auth & Profile
  public getProfileByEmail(email: string): UserProfile | undefined {
    return this.data.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  }

  public getProfileById(id: string): UserProfile | undefined {
    return this.data.profiles.find((p) => p.id === id);
  }

  public verifyPassword(userId: string, passwordAttempt: string): boolean {
    const hash = this.data.passwords[userId];
    if (!hash) return false;
    return hash === hashPassword(passwordAttempt);
  }

  public createProfile(profile: UserProfile, passwordPlain: string): UserProfile {
    this.data.profiles.push(profile);
    this.data.passwords[profile.id] = hashPassword(passwordPlain);
    this.saveData(this.data);
    return profile;
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const idx = this.data.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.profiles[idx] = {
      ...this.data.profiles[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.profiles[idx];
  }

  public getAllProfiles(): UserProfile[] {
    return [...this.data.profiles];
  }

  // Product
  public getProduct(): ProductConfig {
    if (!this.data.products[0].maxQuota) {
      this.data.products[0].maxQuota = 5;
    }
    if (!this.data.products[0].batchNumber) {
      this.data.products[0].batchNumber = 1;
    }
    return this.data.products[0];
  }

  public getQuotaStatus(): {
    maxQuota: number;
    activeOrdersCount: number;
    remainingSlots: number;
    isSoldOut: boolean;
    batchResetTimestamp?: string;
    batchNumber: number;
    totalLifetimeOrdersCount: number;
  } {
    const prod = this.getProduct();
    const maxQuota = prod.maxQuota || 5;
    const batchNumber = prod.batchNumber || 1;
    const batchResetTime = prod.batchResetTimestamp ? new Date(prod.batchResetTimestamp).getTime() : 0;

    // Filter orders created in the current batch that are not cancelled
    const activeOrdersInBatch = this.data.orders.filter((o) => {
      if (o.fulfillmentStatus === 'cancelled') return false;
      const orderBatch = o.batchNumber || 1;
      return orderBatch === batchNumber;
    });
    const activeOrdersCount = activeOrdersInBatch.length;
    const remainingSlots = Math.max(0, maxQuota - activeOrdersCount);
    const isSoldOut = activeOrdersCount >= maxQuota;

    return {
      maxQuota,
      activeOrdersCount,
      remainingSlots,
      isSoldOut,
      batchResetTimestamp: prod.batchResetTimestamp,
      batchNumber,
      totalLifetimeOrdersCount: this.data.orders.length,
    };
  }

  public restockBatch(newQuota?: number): {
    product: ProductConfig;
    quota: ReturnType<DBStore['getQuotaStatus']>;
  } {
    const prod = this.getProduct();
    const nextBatchNumber = (prod.batchNumber || 1) + 1;
    const updates: Partial<ProductConfig> = {
      batchResetTimestamp: new Date().toISOString(),
      batchNumber: nextBatchNumber,
      isAvailable: true,
    };
    if (newQuota !== undefined && !isNaN(newQuota) && newQuota > 0) {
      updates.maxQuota = newQuota;
    }
    const updated = this.updateProduct(updates);
    return {
      product: updated,
      quota: this.getQuotaStatus(),
    };
  }

  public updateProduct(updates: Partial<ProductConfig>): ProductConfig {
    this.data.products[0] = {
      ...this.data.products[0],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.products[0];
  }

  // Payment Methods
  public getPaymentMethods(onlyActive = true): PaymentMethod[] {
    if (onlyActive) {
      return this.data.paymentMethods.filter((m) => m.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return [...this.data.paymentMethods].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getPaymentMethodById(id: string): PaymentMethod | undefined {
    return this.data.paymentMethods.find((m) => m.id === id);
  }

  public savePaymentMethod(method: PaymentMethod): PaymentMethod {
    const idx = this.data.paymentMethods.findIndex((m) => m.id === method.id);
    if (idx >= 0) {
      this.data.paymentMethods[idx] = { ...method, updatedAt: new Date().toISOString() };
    } else {
      this.data.paymentMethods.push(method);
    }
    this.saveData(this.data);
    return method;
  }

  public deletePaymentMethod(id: string): boolean {
    const idx = this.data.paymentMethods.findIndex((m) => m.id === id);
    if (idx >= 0) {
      this.data.paymentMethods.splice(idx, 1);
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // Orders
  public getOrders(filters?: {
    customerId?: string;
    customerEmail?: string;
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
  }): Order[] {
    let list = [...this.data.orders];
    if (filters?.customerId) {
      list = list.filter((o) => o.customerId === filters.customerId);
    }
    if (filters?.customerEmail) {
      list = list.filter((o) => o.customerEmail.toLowerCase() === filters.customerEmail?.toLowerCase());
    }
    if (filters?.paymentStatus) {
      list = list.filter((o) => o.paymentStatus === filters.paymentStatus);
    }
    if (filters?.fulfillmentStatus) {
      list = list.filter((o) => o.fulfillmentStatus === filters.fulfillmentStatus);
    }
    // Attach proofs, history, and notes to each order
    return list
      .map((order) => ({
        ...order,
        proofs: this.data.paymentProofs.filter((p) => p.orderId === order.id),
        history: this.data.orderStatusHistory
          .filter((h) => h.orderId === order.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        notes: this.data.adminNotes.filter((n) => n.orderId === order.id),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | null {
    const order = this.data.orders.find((o) => o.id === id);
    if (!order) return null;
    return {
      ...order,
      proofs: this.data.paymentProofs.filter((p) => p.orderId === order.id),
      history: this.data.orderStatusHistory
        .filter((h) => h.orderId === order.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      notes: this.data.adminNotes.filter((n) => n.orderId === order.id),
    };
  }

  public createOrder(order: Order): Order {
    if (!order.batchNumber) {
      order.batchNumber = this.getProduct().batchNumber || 1;
    }
    this.data.orders.push(order);
    this.saveData(this.data);
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.getOrderById(id);
  }

  // Payment Proofs
  public addPaymentProof(proof: PaymentProof): PaymentProof {
    // Supersede any prior pending proofs for this order
    this.data.paymentProofs.forEach((p) => {
      if (p.orderId === proof.orderId && p.reviewStatus === 'pending') {
        p.reviewStatus = 'superseded';
      }
    });
    this.data.paymentProofs.push(proof);
    this.saveData(this.data);
    return proof;
  }

  public getPaymentProofsForOrder(orderId: string): PaymentProof[] {
    return this.data.paymentProofs.filter((p) => p.orderId === orderId);
  }

  public getPaymentProofById(id: string): PaymentProof | undefined {
    return this.data.paymentProofs.find((p) => p.id === id);
  }

  public updatePaymentProof(id: string, updates: Partial<PaymentProof>): PaymentProof | null {
    const idx = this.data.paymentProofs.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.paymentProofs[idx] = { ...this.data.paymentProofs[idx], ...updates };
    this.saveData(this.data);
    return this.data.paymentProofs[idx];
  }

  // Status History
  public addStatusHistory(item: OrderStatusHistoryItem): OrderStatusHistoryItem {
    this.data.orderStatusHistory.push(item);
    this.saveData(this.data);
    return item;
  }

  // Admin Notes
  public addAdminNote(note: AdminNote): AdminNote {
    this.data.adminNotes.push(note);
    this.saveData(this.data);
    return note;
  }

  // Audit Logs
  public addAuditLog(log: AuditLog): AuditLog {
    this.data.auditLogs.unshift(log);
    this.saveData(this.data);
    return log;
  }

  public getAuditLogs(limit = 100): AuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  // Email Notifications
  public addEmailNotification(email: EmailNotification): EmailNotification {
    this.data.emailNotifications.unshift(email);
    this.saveData(this.data);
    return email;
  }

  public getEmailNotifications(limit = 100): EmailNotification[] {
    return this.data.emailNotifications.slice(0, limit);
  }

  // Site Settings
  public getSiteSettings(): SiteSettings {
    return this.data.siteSettings;
  }

  public updateSiteSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.data.siteSettings = {
      ...this.data.siteSettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.data);
    return this.data.siteSettings;
  }
}

// Global Singleton with automatic method upgrade check
const globalForStore = global as unknown as { __gap_db_store?: DBStore };
if (
  !globalForStore.__gap_db_store ||
  typeof (globalForStore.__gap_db_store as DBStore).restockBatch !== 'function'
) {
  globalForStore.__gap_db_store = new DBStore();
}
export const db = globalForStore.__gap_db_store;
