import { 
  PublishedItem, 
  ContactCase, 
  ItemMatch, 
  SystemSettings, 
  Transaction, 
  AuditLog, 
  ReportListing, 
  Review, 
  User, 
  RecoveryRequest, 
  ServiceSettings 
} from '../types';

function getAdminHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('rangisha_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export const api = {
  // Public search queries approved & published items
  async getItems(params: {
    type?: 'lost' | 'found' | 'missing_person' | 'found_person' | 'all';
    category?: string;
    district?: string;
    q?: string;
    status?: string;
    sort?: 'newest' | 'oldest' | 'rewardHigh';
    page?: number;
    limit?: number;
  }): Promise<{ items: PublishedItem[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'all') query.set('type', params.type);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.district && params.district !== 'all') query.set('district', params.district);
    if (params.q) query.set('q', params.q);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    try {
      const res = await fetch(`/api/items?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch items');
      return await res.json();
    } catch (err: any) {
      console.warn('api.getItems network fallback:', err?.message || err);
      return { items: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  async getItemById(id: string): Promise<PublishedItem> {
    const res = await fetch(`/api/items/${id}`);
    if (!res.ok) throw new Error('Item not found');
    return res.json();
  },

  // Lost Item Report Form
  async reportLostItem(data: any): Promise<{ success: boolean; reportId: string; caseNumber: string; message: string }> {
    const res = await fetch('/api/lost-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to submit lost report' }));
      throw new Error(err.error || 'Failed to submit lost report');
    }
    return res.json();
  },

  // Found Item Report Form
  async reportFoundItem(data: any): Promise<{ success: boolean; reportId: string; caseNumber: string; message: string }> {
    const res = await fetch('/api/found-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to submit found report' }));
      throw new Error(err.error || 'Failed to submit found report');
    }
    return res.json();
  },

  // "RANGISHA" / "Iyi ni iyanjye" Recovery Claim
  async submitRecoveryRequest(data: Partial<RecoveryRequest>): Promise<{ success: boolean; requestId: string; message: string; recoveryRequest: RecoveryRequest }> {
    const res = await fetch('/api/recovery-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to submit recovery claim' }));
      throw new Error(err.error || 'Failed to submit recovery claim');
    }
    return res.json();
  },

  async getRecoveryRequests(): Promise<RecoveryRequest[]> {
    const res = await fetch('/api/recovery-requests');
    if (!res.ok) throw new Error('Failed to fetch recovery requests');
    return res.json();
  },

  async updateRecoveryRequest(id: string, updates: Partial<RecoveryRequest>): Promise<{ success: boolean; recoveryRequest: RecoveryRequest }> {
    const res = await fetch(`/api/recovery-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update recovery request');
    return res.json();
  },

  // Transactions & Commissions
  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch('/api/transactions');
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async createTransaction(data: Partial<Transaction>): Promise<{ success: boolean; transaction: Transaction }> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },

  // Citizen Contact Intake -> Creates Case in Admin Dashboard (RNG-CASE-2026-XXXXXX)
  async submitContactCase(caseData: Partial<ContactCase>): Promise<{ success: boolean; caseNumber: string; message: string; case: ContactCase }> {
    const res = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caseData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to submit information' }));
      throw new Error(err.error || 'Failed to submit information');
    }
    return res.json();
  },

  // Smart Matching
  async getAllMatches(): Promise<ItemMatch[]> {
    const res = await fetch('/api/matches-all');
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return await res.json();
    } catch (err: any) {
      console.warn('api.getSettings network fallback:', err?.message || err);
      return {
        commission: {
          commissionType: 'percentage',
          commissionValue: 10,
          finderRewardType: 'percentage',
          finderRewardValue: 90,
          minimumReward: 2000,
          maximumReward: 1000000,
          currency: 'RWF',
          taxInclusive: true
        },
        requireAdminApprovalBeforePublish: true,
        maintenanceMode: false,
        service: {
          serviceName: 'Office Verification & Handover',
          available: true,
          status: 'available',
          message: 'Our physical service center is open for collection and drop-offs.',
          messageRw: 'Ibiro bya Rangisha.com bifunguye kwakira no gutanga ibyatakaye.',
          expectedAvailability: 'Monday to Saturday (8:00 AM - 6:00 PM)',
          expectedAvailabilityRw: 'Kuwa Mbere kugeza Kuwa Gatandatu (8:00 AM - 6:00 PM)',
          updatedAt: new Date().toISOString()
        },
        contact: {
          phone: '0794473504',
          whatsapp: '0736138312',
          email: 'contact@rangisha.rw',
          officeAddress: 'KN 3 Rd, CHIC Complex, 2nd Floor, Kigali, Rwanda',
          officeHours: 'Mon - Sat: 8:00 AM - 6:00 PM CAT',
          instagram: 'https://instagram.com/rangisha_rw',
          facebook: 'https://facebook.com/rangisharw',
          twitter: 'https://x.com/rangisharw'
        }
      };
    }
  },

  // Reviews
  async getReviews(): Promise<Review[]> {
    try {
      const res = await fetch('/api/reviews');
      if (!res.ok) return [];
      return await res.json();
    } catch (err: any) {
      console.warn('api.getReviews network fallback:', err?.message || err);
      return [];
    }
  },

  // Report Suspicious
  async reportSuspicious(payload: {
    itemId: string;
    reason: string;
    description: string;
    reporterName?: string;
    reporterPhone?: string;
  }): Promise<{ success: boolean }> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to report listing');
    return res.json();
  },

  // Auth
  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    // When password is provided, use the dedicated admin login endpoint
    const endpoint = password ? '/api/admin/login' : '/api/auth/login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async adminLogin(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Admin login failed' }));
      throw new Error(err.error || 'Admin login failed');
    }
    return res.json();
  },

  async getSeedUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/seed-users');
    return res.json();
  },

  // ==========================
  // ADMIN API CALLS (With Bearer Token Auth)
  // ==========================
  async getAdminDashboard(): Promise<any> {
    const res = await fetch('/api/admin/dashboard', {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to load admin dashboard');
    return res.json();
  },

  async getAdminCases(status?: string, type?: string): Promise<ContactCase[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (type && type !== 'all') params.set('type', type);
    const res = await fetch(`/api/admin/cases?${params.toString()}`, {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to load admin cases');
    return res.json();
  },

  async getAdminCaseById(id: string): Promise<ContactCase> {
    const res = await fetch(`/api/admin/cases/${id}`, {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to load case');
    return res.json();
  },

  async updateCaseAnalysis(id: string, data: any): Promise<{ success: boolean; case: ContactCase }> {
    const res = await fetch(`/api/admin/cases/${id}/analysis`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update case analysis');
    return res.json();
  },

  async publishCaseToWebsite(caseId: string, customItemData?: any): Promise<{ success: boolean; item: PublishedItem }> {
    const res = await fetch(`/api/admin/cases/${caseId}/publish`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ customItemData })
    });
    if (!res.ok) throw new Error('Failed to publish case to website');
    return res.json();
  },

  async getAdminItems(): Promise<PublishedItem[]> {
    const res = await fetch('/api/admin/items', {
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to load admin items');
    return res.json();
  },

  // Immediate publication Add Item for Admin Panel
  async addAdminItem(data: {
    name: string;
    location: string;
    description: string;
    date: string;
    image?: string;
    images?: string[];
    type?: 'lost' | 'found' | 'missing_person' | 'found_person';
    categoryId?: string;
    categoryName?: string;
    personDetails?: any;
    rewardText?: string;
    rewardAmount?: number;
  }): Promise<{ success: boolean; item: PublishedItem }> {
    const res = await fetch('/api/admin/items', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add item' }));
      throw new Error(err.error || 'Failed to add item');
    }
    return res.json();
  },

  async createDraftItem(data: Partial<PublishedItem>): Promise<PublishedItem> {
    const res = await fetch('/api/admin/items/draft', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create draft item');
    return res.json();
  },

  async publishItem(id: string): Promise<{ success: boolean; item: PublishedItem }> {
    const res = await fetch(`/api/admin/items/${id}/publish`, {
      method: 'PATCH',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to publish item');
    return res.json();
  },

  async unpublishItem(id: string): Promise<{ success: boolean; item: PublishedItem }> {
    const res = await fetch(`/api/admin/items/${id}/unpublish`, {
      method: 'PATCH',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to unpublish item');
    return res.json();
  },

  async updateAdminItem(id: string, updates: Partial<PublishedItem>): Promise<{ success: boolean; item: PublishedItem }> {
    const res = await fetch(`/api/admin/items/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  },

  async deleteAdminItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/items/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  async getServiceSettings(): Promise<ServiceSettings> {
    const res = await fetch('/api/service-settings');
    if (!res.ok) throw new Error('Failed to fetch service settings');
    return res.json();
  },

  async updateAdminServiceSettings(data: Partial<ServiceSettings>): Promise<{ success: boolean; service: ServiceSettings }> {
    const res = await fetch('/api/admin/service-settings', {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update service settings');
    return res.json();
  },

  async getMongoStatus(): Promise<{ 
    connected: boolean; 
    database?: string; 
    message: string; 
    collections?: { name: string; count: number }[] 
  }> {
    const res = await fetch('/api/admin/mongodb/status', {
      headers: getAdminHeaders()
    });
    if (!res.ok) return { connected: false, message: 'Database diagnostic query failed' };
    return res.json();
  },

  async triggerMongoSync(): Promise<{ 
    success: boolean; 
    message: string; 
    summary?: { 
      connected: boolean; 
      database: string; 
      collections: { name: string; count: number }[] 
    } 
  }> {
    const res = await fetch('/api/admin/mongodb/sync', {
      method: 'POST',
      headers: getAdminHeaders()
    });
    if (!res.ok) throw new Error('Failed to trigger database test');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/admin/audit-logs', {
      headers: getAdminHeaders()
    });
    return res.json();
  },

  async getAdminReports(): Promise<ReportListing[]> {
    const res = await fetch('/api/admin/reports', {
      headers: getAdminHeaders()
    });
    return res.json();
  },

  async updateReportStatus(id: string, status: string): Promise<any> {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  }
};
