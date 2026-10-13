export type ItemType = 'lost' | 'found' | 'missing_person' | 'found_person';

export interface PersonDetails {
  fullName: string;
  age?: number;
  ageGroup?: 'child' | 'teen' | 'adult' | 'elderly';
  gender?: 'male' | 'female' | 'other';
  lastSeenLocation?: string;
  lastSeenDate?: string;
  clothingDescription?: string;
  physicalDescription?: string;
  spokenLanguages?: string[];
  healthConditions?: string; // e.g. Autism, Dementia, needs urgent medication
  policeCaseNumber?: string; // e.g. RIB/KGL/2026/0412
  emergencyContactHotline?: string;
  isUrgent?: boolean;
  relationshipToReporter?: string;
  foundAtLocation?: string;
  currentLocationOrShelter?: string; // e.g. Isange One Stop Center, Sector Office, Hospital
}

export type PublicItemStatus = 
  | 'searching' 
  | 'possible_match' 
  | 'found' 
  | 'recovery_in_progress' 
  | 'recovered' 
  | 'closed';

export type CaseStatus = 
  | 'NEW'
  | 'CONTACTED'
  | 'UNDER_REVIEW'
  | 'VERIFYING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'MATCHED'
  | 'RECOVERED'
  | 'CLOSED';

export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected' | 'Needs More Information';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type AuthenticityLevel = 'Confirmed' | 'Uncertain' | 'Suspicious';
export type AdminDecision = 'Publish' | 'Do Not Publish' | 'Request More Information';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  preferredLanguage: 'rw' | 'en';
  isVerified?: boolean;
  district?: string;
  createdAt: string;
}

export interface ItemCategory {
  id: string;
  nameRw: string;
  nameEn: string;
  icon: string;
  count?: number;
  isActive: boolean;
}

export interface RwandaLocation {
  province: string;
  district: string;
  sector?: string;
  cell?: string;
  village?: string;
  landmark?: string;
}

// Internal Private Case (created when a user contacts Rangisha or submits inquiry)
export interface ContactCase {
  id: string;
  caseNumber: string; // RNG-CASE-2026-000001
  personName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  type: 'lost' | 'found';
  itemName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  location: RwandaLocation;
  date: string;
  approximateTime?: string;
  photos: string[];
  additionalInfo?: string;
  rewardInfo?: {
    offeredOrExpected: boolean;
    amount?: number; // RWF
  };
  brand?: string;
  model?: string;
  color?: string;
  serialNumber?: string;
  personDetails?: PersonDetails;
  isUrgent?: boolean;
  
  // Status & Admin Analysis
  status: CaseStatus;
  adminAnalysis?: {
    verificationStatus: VerificationStatus;
    adminNotes: string;
    riskLevel: RiskLevel;
    authenticity: AuthenticityLevel;
    decision: AdminDecision;
    analyzedBy?: string;
    analyzedAt?: string;
  };

  // Associated published item if published
  publishedItemId?: string;

  createdAt: string;
  updatedAt: string;
}

// Published Item (Admin created & published to public website)
export interface PublishedItem {
  id: string;
  reportId: string; // e.g. RNG-LOST-2026-000023 or RNG-FOUND-2026-000034
  caseId?: string; // link to internal ContactCase
  type: ItemType;
  title: string;
  categoryId: string;
  categoryName: string;
  description: string;
  brand?: string;
  model?: string;
  color?: string;
  serialNumberMasked?: string; // Masked for public security
  location: {
    province: string;
    district: string; // Public only sees district/sector
    sector?: string;
    landmark?: string;
  };
  exactLocationInternal?: string; // Private
  images: string[];
  date: string;
  rewardText?: string; // e.g. "Contact Rangisha for details" or specific amount if approved
  rewardAmount?: number;
  personDetails?: PersonDetails;
  isUrgent?: boolean;
  
  // Public Visibility and Status
  isPublished: boolean;
  visibility: 'public' | 'draft' | 'archived';
  status: PublicItemStatus;
  
  // Internal admin information (NEVER sent to public search)
  internalNotes?: string;
  contactPersonName?: string;
  contactPersonPhone?: string; // Strictly private
  contactPersonEmail?: string;

  createdAt: string;
  updatedAt: string;
}

export type AnyItem = PublishedItem;

export interface ItemMatch {
  id: string;
  lostItem: PublishedItem;
  foundItem: PublishedItem;
  score: number;
  breakdown: {
    category: number;
    keywords: number;
    location: number;
    brand: number;
    color: number;
    date: number;
  };
  reasons: string[];
  status: 'possible' | 'notified' | 'confirmed' | 'dismissed';
}

export interface CommissionSettings {
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  finderRewardType: 'percentage' | 'fixed';
  finderRewardValue: number;
  minimumReward: number;
  maximumReward: number;
  currency: string;
  taxInclusive: boolean;
}

export interface AdminContactSettings {
  phone: string;
  whatsapp: string;
  email: string;
  officeAddress: string;
  officeHours: string;
  instagram: string;
  facebook: string;
  twitter: string;
  telegram?: string;
  messenger?: string;
}

export interface ServiceSettings {
  serviceName: string;
  available: boolean;
  status: 'available' | 'coming_soon' | 'unavailable';
  message: string;
  messageRw?: string;
  expectedAvailability: string;
  expectedAvailabilityRw?: string;
  updatedAt?: string;
}

export interface SystemSettings {
  commission: CommissionSettings;
  contact: AdminContactSettings;
  service?: ServiceSettings;
  requireAdminApprovalBeforePublish: boolean;
  maintenanceMode: boolean;
}

export interface Transaction {
  id: string;
  transactionRef: string;
  caseId?: string;
  itemReportId: string;
  itemTitle: string;
  totalAmount: number;
  rangishaCommission?: number;
  rangaCommission?: number;
  finderPayout: number;
  currency: string;
  paymentMethod: 'momo' | 'airtel' | 'card' | 'bank';
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  payerPhone?: string;
  payerName: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail?: string;
  actorRole: UserRole;
  action: string;
  targetId: string;
  targetType: 'case' | 'item' | 'settings' | 'user' | 'report';
  previousStatus?: string;
  newStatus?: string;
  details: string;
  timestamp: string;
}

export interface ReportListing {
  id: string;
  itemId: string;
  itemReportId: string;
  itemTitle: string;
  reporterName: string;
  reporterPhone?: string;
  reason: 'scam' | 'fake_item' | 'wrong_information' | 'harassment' | 'fraud' | 'duplicate' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Review {
  id: string;
  authorName: string;
  location: string;
  rating: number;
  itemTitle: string;
  story: string;
  date: string;
  verified: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  type: 'match' | 'approval' | 'case' | 'payment' | 'admin';
  createdAt: string;
}

export interface RecoveryRequest {
  id: string;
  requestId: string; // e.g. RNG-REC-2026-000001
  itemId: string;
  itemReportId: string;
  itemTitle: string;
  claimantName: string;
  claimantPhone: string;
  claimantEmail?: string;
  ownershipExplanation: string;
  identifyingDetails: string;
  proofDocumentUrl?: string;
  preferredContactMethod: 'whatsapp' | 'phone' | 'email';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
