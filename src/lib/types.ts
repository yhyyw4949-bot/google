export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureCardConfig {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  iconName: string;
  officialUrl?: string;
  isEnabled: boolean;
  order: number;
}

export interface ProductConfig {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  priceCents: number; // Integer minor units: 2500 for 25.00 EGP
  currency: string;   // 'EGP'
  isAvailable: boolean;
  durationAr: string;
  durationEn: string;
  deliveryTargetMins: number; // e.g. 5 mins
  maxQuota: number; // e.g. 5 orders only
  batchResetTimestamp?: string; // Timestamp when current batch was opened/renewed
  batchNumber?: number; // Sequential batch counter (Batch #1, #2, etc.)
  disclaimerAr: string;
  disclaimerEn: string;
  featureCards: FeatureCardConfig[];
  updatedAt: string;
}

export type PaymentMethodCode = 'vodafone_cash' | 'instapay' | 'orange_cash' | 'etisalat_cash' | 'bank_transfer' | 'custom';

export interface PaymentMethod {
  id: string;
  code: PaymentMethodCode;
  nameAr: string;
  nameEn: string;
  recipientName: string;
  accountIdentifier: string; // Phone number, IBAN, InstaPay handle
  instructionsAr: string;
  instructionsEn: string;
  qrCodeUrl?: string;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 
  | 'awaiting_payment'
  | 'receipt_submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'more_info_required';

export type FulfillmentStatus = 
  | 'pending'
  | 'processing'
  | 'invitation_sent'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export interface PaymentProof {
  id: string;
  orderId: string;
  filePath: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  transactionReference?: string;
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'superseded';
  reviewerId?: string;
  reviewTimestamp?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  previousPaymentStatus: PaymentStatus;
  newPaymentStatus: PaymentStatus;
  previousFulfillmentStatus: FulfillmentStatus;
  newFulfillmentStatus: FulfillmentStatus;
  changedBy: string; // 'customer' or admin name / id
  notes?: string;
  createdAt: string;
}

export interface AdminNote {
  id: string;
  orderId: string;
  adminId: string;
  adminName: string;
  note: string;
  isInternalOnly: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface EmailNotification {
  id: string;
  orderId: string;
  recipientEmail: string;
  templateType: 
    | 'order_created'
    | 'receipt_uploaded'
    | 'payment_approved'
    | 'payment_rejected'
    | 'more_info_requested'
    | 'invitation_sent'
    | 'order_completed'
    | 'order_cancelled'
    | 'order_refunded';
  language: 'ar' | 'en';
  subject: string;
  bodyHtml: string;
  status: 'queued' | 'sent' | 'failed';
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

export interface Order {
  id: string; // e.g. GAP-2026-10492
  customerId?: string; // Optional if guest, linked if logged in
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productId: string;
  productName: string;
  priceCents: number; // Stored at order creation time
  currency: string;
  paymentMethodId?: string;
  paymentMethodName?: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  rejectionReason?: string;
  invitationSentAt?: string;
  completedAt?: string;
  actualDispatchNotes?: string;
  batchNumber?: number;
  createdAt: string;
  updatedAt: string;
  proofs?: PaymentProof[];
  history?: OrderStatusHistoryItem[];
  notes?: AdminNote[];
}

export interface SiteSettings {
  id: string;
  brandNameAr: string;
  brandNameEn: string;
  logoUrl?: string;
  contactEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  announcementAr: string;
  announcementEn: string;
  isAnnouncementActive: boolean;
  maintenanceMode: boolean;
  defaultApprovalEmailSubjectAr?: string;
  defaultApprovalEmailBodyAr?: string;
  defaultDispatchEmailSubjectAr?: string;
  defaultDispatchEmailBodyAr?: string;
  updatedAt: string;
}
