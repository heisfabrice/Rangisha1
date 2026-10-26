import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import { 
  ServiceSettings, 
  AdminContactSettings, 
  PublishedItem, 
  ContactCase, 
  RecoveryRequest, 
  Transaction, 
  User,
  SystemSettings,
  AuditLog,
  ReportListing,
  Review
} from '../src/types/index';
import { db as devDb } from './db';

dotenv.config();

const DB_NAME = process.env.MONGODB_DB_NAME || 'rangisha';

// Collection definitions in MongoDB Atlas
const ITEMS_COLLECTION = 'items';
const PRODUCTS_COLLECTION = 'products';
const CASES_COLLECTION = 'cases';
const RECOVERY_REQUESTS_COLLECTION = 'recoveryRequests';
const TRANSACTIONS_COLLECTION = 'transactions';
const USERS_COLLECTION = 'users';
const SERVICE_SETTINGS_COLLECTION = 'serviceSettings';
const SITE_SETTINGS_COLLECTION = 'siteSettings';
const SYSTEM_SETTINGS_COLLECTION = 'systemSettings';
const AUDIT_LOGS_COLLECTION = 'auditLogs';
const REPORTS_COLLECTION = 'reports';
const REVIEWS_COLLECTION = 'reviews';
const COUNTERS_COLLECTION = 'counters';

// Global cache for connection pooling across Vercel serverless lambda invocations
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim());
}

let devNoticeLogged = false;
function logDevNotice() {
  if (!devNoticeLogged && !isProductionEnv() && !isMongoConfigured()) {
    console.warn('[Rangisha Dev Notice] MONGODB_URI not configured. Using local development store. For production persistence, configure MONGODB_URI in Vercel Project Settings.');
    devNoticeLogged = true;
  }
}

/**
 * Initializes and returns a cached MongoDB Atlas client.
 * Uses connection pooling and reuses the active connection across serverless invocations.
 */
export async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  if (global._mongoClientPromise) {
    try {
      const client = await global._mongoClientPromise;
      return client;
    } catch (err: any) {
      global._mongoClientPromise = undefined;
      throw new Error(`MongoDB connection failed: ${err?.message || 'Unknown error'}`);
    }
  }

  const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10
  });

  global._mongoClientPromise = client.connect().catch(err => {
    global._mongoClientPromise = undefined;
    console.error('[MongoDB Atlas Connection Error]:', err?.message || err);
    throw err;
  });

  return global._mongoClientPromise;
}

/**
 * Returns database handle for 'rangisha' database
 */
export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(DB_NAME);
}

// ==========================================
// 0. ATOMIC COUNTERS (Concurrency-Safe IDs)
// ==========================================

export async function getNextSequenceNumber(
  counterName: string, 
  prefix: string, 
  padLength: number = 6
): Promise<string> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const result = await db.collection(COUNTERS_COLLECTION).findOneAndUpdate(
        { _id: counterName as any },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
      const seq = (result as any)?.seq || 1;
      return `${prefix}-${String(seq).padStart(padLength, '0')}`;
    } catch (err: any) {
      console.error(`[MongoDB Error] getNextSequenceNumber (${counterName}):`, err?.message || err);
    }
  }

  if (isProductionEnv() && !isMongoConfigured()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  // Development sequential fallback
  logDevNotice();
  if (counterName === 'case') return devDb.getNextCaseNumber();
  if (counterName === 'lostReport') return devDb.getNextLostReportId();
  if (counterName === 'foundReport') return devDb.getNextFoundReportId();
  if (counterName === 'recovery') return devDb.getNextRecoveryRequestId();
  if (counterName === 'transaction') return devDb.getNextTransactionRef();

  const fallbackSeq = Math.floor(Date.now() % 1000000);
  return `${prefix}-${String(fallbackSeq).padStart(padLength, '0')}`;
}

// ==========================================
// 1. PRODUCTS / REPORTED ITEMS
// ==========================================

export async function getPublicItemsFromDb(params: {
  type?: string;
  category?: string;
  district?: string;
  q?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: PublishedItem[]; total: number; page: number; totalPages: number }> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const collection = db.collection(ITEMS_COLLECTION);

    const query: any = {
      isPublished: true,
      visibility: 'public'
    };

    if (params.type && params.type !== 'all') {
      query.type = params.type;
    }
    if (params.category && params.category !== 'all') {
      query.categoryId = params.category;
    }
    if (params.district && params.district !== 'all') {
      query['location.district'] = { $regex: new RegExp(`^${params.district}$`, 'i') };
    }
    if (params.status && params.status !== 'all') {
      query.status = params.status;
    }
    if (params.q && params.q.trim()) {
      const term = params.q.trim();
      const regex = { $regex: term, $options: 'i' };
      query.$or = [
        { title: regex },
        { description: regex },
        { reportId: regex },
        { brand: regex },
        { 'location.district': regex },
        { 'location.sector': regex }
      ];
    }

    let sortOption: any = { createdAt: -1 };
    if (params.sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (params.sort === 'rewardHigh') {
      sortOption = { rewardAmount: -1 };
    }

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      collection.countDocuments(query),
      collection.find(query).sort(sortOption).skip(skip).limit(limit).toArray()
    ]);

    const items = docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: rest.id || String(_id),
        contactPersonPhone: undefined,
        contactPersonEmail: undefined,
        internalNotes: undefined,
        exactLocationInternal: undefined
      } as PublishedItem;
    });

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  // Local development store
  logDevNotice();
  let all = devDb.getPublicItems();
  if (params.type && params.type !== 'all') {
    all = all.filter(i => i.type === params.type);
  }
  if (params.category && params.category !== 'all') {
    all = all.filter(i => i.categoryId === params.category);
  }
  if (params.district && params.district !== 'all') {
    all = all.filter(i => i.location?.district?.toLowerCase() === params.district?.toLowerCase());
  }
  if (params.status && params.status !== 'all') {
    all = all.filter(i => i.status === params.status);
  }
  if (params.q && params.q.trim()) {
    const term = params.q.trim().toLowerCase();
    all = all.filter(i => 
      i.title.toLowerCase().includes(term) ||
      i.description.toLowerCase().includes(term) ||
      i.reportId.toLowerCase().includes(term)
    );
  }

  if (params.sort === 'oldest') {
    all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (params.sort === 'rewardHigh') {
    all.sort((a, b) => (b.rewardAmount || 0) - (a.rewardAmount || 0));
  } else {
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const total = all.length;
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 20));
  const start = (page - 1) * limit;

  return {
    items: all.slice(start, start + limit),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1
  };
}

export async function getAllItemsFromDb(): Promise<PublishedItem[]> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const collection = db.collection(ITEMS_COLLECTION);
    let docs = await collection.find({}).sort({ createdAt: -1 }).toArray();
    if (docs.length === 0) {
      const prodCollection = db.collection(PRODUCTS_COLLECTION);
      docs = await prodCollection.find({}).sort({ createdAt: -1 }).toArray();
    }
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return { ...rest, id: rest.id || String(_id) } as PublishedItem;
    });
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getAllItems();
}

export async function getItemByIdFromDb(id: string): Promise<PublishedItem | null> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const filter = {
      $or: [{ _id: id as any }, { id }, { reportId: id }]
    };
    let doc = await db.collection(ITEMS_COLLECTION).findOne(filter);
    if (!doc) {
      doc = await db.collection(PRODUCTS_COLLECTION).findOne(filter);
    }
    if (!doc) return null;

    const { _id, ...rest } = doc;
    return { ...rest, id: rest.id || String(_id) } as PublishedItem;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getItemById(id) || null;
}

export async function saveItemToDb(item: PublishedItem): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const { id, ...data } = item;
    const updateDoc = { 
      $set: { 
        ...data, 
        id, 
        updatedAt: item.updatedAt || new Date().toISOString() 
      } 
    };

    await Promise.all([
      db.collection(ITEMS_COLLECTION).updateOne(
        { _id: id as any },
        updateDoc,
        { upsert: true }
      ),
      db.collection(PRODUCTS_COLLECTION).updateOne(
        { _id: id as any },
        updateDoc,
        { upsert: true }
      )
    ]);
    return true;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  const existing = devDb.getItemById(item.id);
  if (existing) {
    devDb.updateItem(item.id, item);
  } else {
    devDb.createDirectPublishedItem(item);
  }
  return true;
}

export async function deleteItemFromDb(id: string): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const filter = { 
      $or: [{ _id: id as any }, { id }, { reportId: id }] 
    };

    await Promise.all([
      db.collection(ITEMS_COLLECTION).deleteOne(filter),
      db.collection(PRODUCTS_COLLECTION).deleteOne(filter)
    ]);
    return true;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.deleteItem(id);
}

// ==========================================
// 2. CASES / INTAKE REPORTS
// ==========================================

export async function getCasesFromDb(filterQuery: { status?: string; type?: string } = {}): Promise<ContactCase[]> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const query: any = {};
    if (filterQuery.status && filterQuery.status !== 'all') {
      query.status = filterQuery.status;
    }
    if (filterQuery.type && filterQuery.type !== 'all') {
      query.type = filterQuery.type;
    }

    const docs = await db.collection(CASES_COLLECTION).find(query).sort({ createdAt: -1 }).toArray();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return { ...rest, id: rest.id || String(_id) } as ContactCase;
    });
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  let cases = devDb.getCases();
  if (filterQuery.status && filterQuery.status !== 'all') {
    cases = cases.filter(c => c.status === filterQuery.status);
  }
  if (filterQuery.type && filterQuery.type !== 'all') {
    cases = cases.filter(c => c.type === filterQuery.type);
  }
  return cases;
}

export async function getCaseByIdFromDb(id: string): Promise<ContactCase | null> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const doc = await db.collection(CASES_COLLECTION).findOne({
      $or: [{ _id: id as any }, { id }, { caseNumber: id }]
    });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { ...rest, id: rest.id || String(_id) } as ContactCase;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getCaseById(id) || null;
}

export async function saveCaseToDb(caseObj: ContactCase): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const { id, ...data } = caseObj;
    await db.collection(CASES_COLLECTION).updateOne(
      { _id: id as any },
      { 
        $set: { 
          ...data, 
          id, 
          updatedAt: caseObj.updatedAt || new Date().toISOString() 
        } 
      },
      { upsert: true }
    );
    return true;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  const existing = devDb.getCaseById(caseObj.id);
  if (existing) {
    devDb.updateCase(caseObj.id, caseObj);
  } else {
    devDb.createCase(caseObj);
  }
  return true;
}

// ==========================================
// 3. RECOVERY REQUESTS (CLAIMS)
// ==========================================

export async function getRecoveryRequestsFromDb(): Promise<RecoveryRequest[]> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const docs = await db.collection(RECOVERY_REQUESTS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return { ...rest, id: rest.id || String(_id) } as RecoveryRequest;
    });
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getRecoveryRequests();
}

export async function getRecoveryRequestByIdFromDb(id: string): Promise<RecoveryRequest | null> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const doc = await db.collection(RECOVERY_REQUESTS_COLLECTION).findOne({
      $or: [{ _id: id as any }, { id }, { requestId: id }]
    });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { ...rest, id: rest.id || String(_id) } as RecoveryRequest;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getRecoveryRequestById(id) || null;
}

export async function saveRecoveryRequestToDb(req: RecoveryRequest): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const { id, ...data } = req;
    await db.collection(RECOVERY_REQUESTS_COLLECTION).updateOne(
      { _id: id as any },
      { $set: { ...data, id } },
      { upsert: true }
    );
    return true;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  const existing = devDb.getRecoveryRequestById(req.id);
  if (existing) {
    devDb.updateRecoveryRequest(req.id, req);
  } else {
    devDb.createRecoveryRequest(req);
  }
  return true;
}

// ==========================================
// 4. TRANSACTIONS
// ==========================================

export async function getTransactionsFromDb(): Promise<Transaction[]> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const docs = await db.collection(TRANSACTIONS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return { ...rest, id: rest.id || String(_id) } as Transaction;
    });
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getTransactions();
}

export async function saveTransactionToDb(txn: Transaction): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const { id, ...data } = txn;
    await db.collection(TRANSACTIONS_COLLECTION).updateOne(
      { _id: id as any },
      { $set: { ...data, id } },
      { upsert: true }
    );
    return true;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  devDb.createTransaction(txn);
  return true;
}

// ==========================================
// 5. USERS
// ==========================================

export async function getUsersFromDb(): Promise<User[]> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const docs = await db.collection(USERS_COLLECTION).find({}).toArray();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return { ...rest, id: rest.id || String(_id) } as User;
    });
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getUsers();
}

export async function getUserByEmailFromDb(email: string): Promise<User | null> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const doc = await db.collection(USERS_COLLECTION).findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
    });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { ...rest, id: rest.id || String(_id) } as User;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getUserByEmail(email) || null;
}

export async function saveUserToDb(user: User): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const { id, ...data } = user;
    await db.collection(USERS_COLLECTION).updateOne(
      { _id: id as any },
      { $set: { ...data, id } },
      { upsert: true }
    );
    return true;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  return true;
}

// ==========================================
// 6. SERVICE AVAILABILITY SETTINGS
// ==========================================

export const DEFAULT_SERVICE_SETTINGS: ServiceSettings = {
  serviceName: 'Office Verification & Handover',
  available: true,
  status: 'available',
  message: 'Our physical service center is open for collection and drop-offs.',
  messageRw: 'Ibiro bya Rangisha.com bifunguye kwakira no gutanga ibyatakaye.',
  expectedAvailability: 'Monday to Saturday (8:00 AM - 6:00 PM)',
  expectedAvailabilityRw: 'Kuwa Mbere kugeza Kuwa Gatandatu (8:00 AM - 6:00 PM)',
  updatedAt: new Date().toISOString()
};

export async function getServiceSettingsFromDb(): Promise<ServiceSettings> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const doc = await db.collection(SERVICE_SETTINGS_COLLECTION).findOne({ _id: 'officeServiceSettings' as any });
      if (!doc) return DEFAULT_SERVICE_SETTINGS;

      return {
        serviceName: doc.serviceName || DEFAULT_SERVICE_SETTINGS.serviceName,
        available: Boolean(doc.available),
        status: doc.status || (doc.available ? 'available' : 'coming_soon'),
        message: doc.message || DEFAULT_SERVICE_SETTINGS.message,
        messageRw: doc.messageRw || DEFAULT_SERVICE_SETTINGS.messageRw,
        expectedAvailability: doc.expectedAvailability || DEFAULT_SERVICE_SETTINGS.expectedAvailability,
        expectedAvailabilityRw: doc.expectedAvailabilityRw || DEFAULT_SERVICE_SETTINGS.expectedAvailabilityRw,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString()
      };
    } catch {
      return DEFAULT_SERVICE_SETTINGS;
    }
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getServiceSettings();
}

export async function saveServiceSettingsToDb(data: Partial<ServiceSettings>): Promise<ServiceSettings> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const current = await getServiceSettingsFromDb();
    const updated: ServiceSettings = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString()
    };

    await db.collection(SERVICE_SETTINGS_COLLECTION).updateOne(
      { _id: 'officeServiceSettings' as any },
      { $set: updated },
      { upsert: true }
    );
    return updated;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.updateServiceSettings(data);
}

// ==========================================
// 7. WEBSITE CONTACT & SYSTEM SETTINGS
// ==========================================

export const DEFAULT_CONTACT_SETTINGS: AdminContactSettings = {
  phone: '0794473504',
  whatsapp: '0736138312',
  email: 'contact@rangisha.rw',
  officeAddress: 'KN 3 Rd, CHIC Complex, 2nd Floor, Kigali, Rwanda',
  officeHours: 'Kuwa Mbere - Kuwa Gatandatu: 8:00 AM - 6:00 PM CAT',
  instagram: 'https://instagram.com/rangisha_rw',
  facebook: 'https://facebook.com/rangisharw',
  twitter: 'https://x.com/rangisharw'
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
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
  contact: DEFAULT_CONTACT_SETTINGS,
  service: DEFAULT_SERVICE_SETTINGS,
  requireAdminApprovalBeforePublish: true,
  maintenanceMode: false
};

export async function getSiteSettingsFromDb(): Promise<AdminContactSettings> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const doc = await db.collection(SITE_SETTINGS_COLLECTION).findOne({ _id: 'siteContactSettings' as any });
      if (!doc) return DEFAULT_CONTACT_SETTINGS;

      return {
        phone: doc.phone || doc.hotline || DEFAULT_CONTACT_SETTINGS.phone,
        whatsapp: doc.whatsapp || DEFAULT_CONTACT_SETTINGS.whatsapp,
        email: doc.email || DEFAULT_CONTACT_SETTINGS.email,
        officeAddress: doc.officeAddress || DEFAULT_CONTACT_SETTINGS.officeAddress,
        officeHours: doc.officeHours || DEFAULT_CONTACT_SETTINGS.officeHours,
        instagram: doc.instagram || DEFAULT_CONTACT_SETTINGS.instagram,
        facebook: doc.facebook || DEFAULT_CONTACT_SETTINGS.facebook,
        twitter: doc.twitter || doc.x || DEFAULT_CONTACT_SETTINGS.twitter
      };
    } catch {
      return DEFAULT_CONTACT_SETTINGS;
    }
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getSettings().contact;
}

export async function saveSiteSettingsToDb(contact: Partial<AdminContactSettings>): Promise<AdminContactSettings> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const current = await getSiteSettingsFromDb();
    const updated: AdminContactSettings = {
      ...current,
      ...contact
    };

    await db.collection(SITE_SETTINGS_COLLECTION).updateOne(
      { _id: 'siteContactSettings' as any },
      { $set: { ...updated, updatedAt: new Date() } },
      { upsert: true }
    );
    return updated;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  const currentContact = devDb.getSettings().contact;
  const res = devDb.updateSettings({ contact: { ...currentContact, ...contact } });
  return res.contact;
}

export async function getSystemSettingsFromDb(): Promise<SystemSettings> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const [sysDoc, serviceSettings, contactSettings] = await Promise.all([
        db.collection(SYSTEM_SETTINGS_COLLECTION).findOne({ _id: 'globalSystemSettings' as any }),
        getServiceSettingsFromDb(),
        getSiteSettingsFromDb()
      ]);

      return {
        commission: sysDoc?.commission || DEFAULT_SYSTEM_SETTINGS.commission,
        contact: contactSettings,
        service: serviceSettings,
        requireAdminApprovalBeforePublish: sysDoc?.requireAdminApprovalBeforePublish ?? true,
        maintenanceMode: sysDoc?.maintenanceMode ?? false
      };
    } catch {
      return DEFAULT_SYSTEM_SETTINGS;
    }
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getSettings();
}

export async function saveSystemSettingsToDb(updates: Partial<SystemSettings>): Promise<SystemSettings> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const current = await getSystemSettingsFromDb();

    const merged: SystemSettings = {
      ...current,
      ...updates,
      commission: {
        ...current.commission,
        ...(updates.commission || {})
      },
      contact: {
        ...current.contact,
        ...(updates.contact || {})
      },
      service: updates.service ? {
        ...current.service!,
        ...updates.service
      } : current.service
    };

    await Promise.all([
      db.collection(SYSTEM_SETTINGS_COLLECTION).updateOne(
        { _id: 'globalSystemSettings' as any },
        { $set: { ...merged, updatedAt: new Date() } },
        { upsert: true }
      ),
      updates.contact ? saveSiteSettingsToDb(updates.contact) : Promise.resolve(),
      updates.service ? saveServiceSettingsToDb(updates.service) : Promise.resolve()
    ]);

    return merged;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.updateSettings(updates);
}

// ==========================================
// 8. AUDIT LOGS
// ==========================================

export async function getAuditLogsFromDb(limit: number = 200): Promise<AuditLog[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const docs = await db.collection(AUDIT_LOGS_COLLECTION).find({}).sort({ timestamp: -1 }).limit(limit).toArray();
      return docs.map((doc: any) => {
        const { _id, ...rest } = doc;
        return { ...rest, id: rest.id || String(_id) } as AuditLog;
      });
    } catch {
      return [];
    }
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getAuditLogs().slice(0, limit);
}

export async function saveAuditLogToDb(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...log
  };

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      await db.collection(AUDIT_LOGS_COLLECTION).insertOne({ _id: newLog.id as any, ...newLog });
    } catch (err: any) {
      console.error('[MongoDB Error] saveAuditLogToDb:', err?.message || err);
    }
    return newLog;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.addAuditLog(log);
}

// ==========================================
// 9. REPORTS (Suspicious Listings)
// ==========================================

export async function getReportsFromDb(): Promise<ReportListing[]> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const docs = await db.collection(REPORTS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return { ...rest, id: rest.id || String(_id) } as ReportListing;
    });
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getReports();
}

export async function saveReportToDb(report: Partial<ReportListing>): Promise<ReportListing> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const newReport: ReportListing = {
      id: `rep-${Date.now()}`,
      itemId: report.itemId || '',
      itemReportId: report.itemReportId || '',
      itemTitle: report.itemTitle || '',
      reporterName: report.reporterName || 'Citizen Anonymous',
      reporterPhone: report.reporterPhone,
      reason: report.reason || 'scam',
      description: report.description || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await db.collection(REPORTS_COLLECTION).updateOne(
      { _id: newReport.id as any },
      { $set: newReport },
      { upsert: true }
    );
    return newReport;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.createReport(report);
}

export async function updateReportStatusInDb(id: string, status: ReportListing['status']): Promise<boolean> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();
    const res = await db.collection(REPORTS_COLLECTION).updateOne(
      { $or: [{ _id: id as any }, { id }] },
      { $set: { status, updatedAt: new Date().toISOString() } }
    );
    return res.matchedCount > 0;
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.updateReportStatus(id, status);
}

// ==========================================
// 10. REVIEWS
// ==========================================

const INITIAL_VERIFIED_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    authorName: 'Jean Claude M.',
    location: 'Gasabo, Kigali',
    rating: 5,
    itemTitle: 'Indangamuntu & Carte Jaune',
    story: 'Rangisha.com yamfashije kugarura ibyangombwa byanjye nta guhura n\'abashukanyi. Ubuyobozi bwagenzuye byose mu mutekano!',
    date: '2026-03-29',
    verified: true
  },
  {
    id: 'rev-2',
    authorName: 'Diane K.',
    location: 'Kicukiro, Kigali',
    rating: 5,
    itemTitle: 'iPhone 13 na Mudasobwa',
    story: 'Natanze raporo y\'icyatoraguwe, mu masaha make nyiracyo yaramenyekanye binyuze ku mucyo wa Rangisha.com.',
    date: '2026-03-21',
    verified: true
  }
];

export async function getReviewsFromDb(): Promise<Review[]> {
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      const docs = await db.collection(REVIEWS_COLLECTION).find({}).sort({ date: -1 }).toArray();
      if (docs.length === 0) {
        return INITIAL_VERIFIED_REVIEWS;
      }
      return docs.map((doc: any) => {
        const { _id, ...rest } = doc;
        return { ...rest, id: rest.id || String(_id) } as Review;
      });
    } catch {
      return INITIAL_VERIFIED_REVIEWS;
    }
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getReviews();
}

// ==========================================
// 11. DASHBOARD ANALYTICS
// ==========================================

export async function getAnalyticsFromDb(): Promise<{
  totalCases: number;
  pendingCases: number;
  publishedItems: number;
  draftItems: number;
  recoveredCases: number;
  totalLost: number;
  totalFound: number;
  topCategories: { name: string; count: number }[];
}> {
  if (isMongoConfigured()) {
    const db = await getMongoDb();

    const [
      totalCases,
      pendingCases,
      publishedItems,
      draftItems,
      recoveredCases,
      totalLost,
      totalFound,
      itemsForCategories
    ] = await Promise.all([
      db.collection(CASES_COLLECTION).countDocuments(),
      db.collection(CASES_COLLECTION).countDocuments({ status: { $in: ['NEW', 'UNDER_REVIEW', 'VERIFYING'] } }),
      db.collection(ITEMS_COLLECTION).countDocuments({ isPublished: true, visibility: 'public' }),
      db.collection(ITEMS_COLLECTION).countDocuments({ visibility: 'draft' }),
      db.collection(CASES_COLLECTION).countDocuments({ status: { $in: ['RECOVERED', 'CLOSED'] } }),
      db.collection(ITEMS_COLLECTION).countDocuments({ type: 'lost', isPublished: true }),
      db.collection(ITEMS_COLLECTION).countDocuments({ type: 'found', isPublished: true }),
      db.collection(ITEMS_COLLECTION).find({ isPublished: true }, { projection: { categoryName: 1, categoryId: 1 } }).toArray()
    ]);

    const categoryCount: Record<string, number> = {};
    for (const item of itemsForCategories) {
      const cat = item.categoryName || item.categoryId || 'General';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }

    const topCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalCases,
      pendingCases,
      publishedItems,
      draftItems,
      recoveredCases,
      totalLost,
      totalFound,
      topCategories
    };
  }

  if (isProductionEnv()) {
    throw new Error('MONGODB_URI environment variable is not configured');
  }

  logDevNotice();
  return devDb.getAnalytics();
}

// ==========================================
// 12. HEALTH & SUMMARY DIAGNOSTICS
// ==========================================

export async function getMongoCollectionsSummary(): Promise<{
  connected: boolean;
  database: string;
  message: string;
  collections: { name: string; count: number }[];
}> {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    if (!isProductionEnv()) {
      const devItems = devDb.getAllItems();
      const devCases = devDb.getCases();
      return {
        connected: false,
        database: 'local_development_store',
        message: 'Using local store in development mode. Set MONGODB_URI in Vercel settings for production persistence.',
        collections: [
          { name: ITEMS_COLLECTION, count: devItems.length },
          { name: CASES_COLLECTION, count: devCases.length }
        ]
      };
    }
    return { 
      connected: false, 
      database: DB_NAME,
      message: 'MONGODB_URI environment variable not configured', 
      collections: [] 
    };
  }

  try {
    const db = await getMongoDb();
    const [
      itemsCount, 
      casesCount, 
      recoveryCount, 
      txnCount, 
      usersCount,
      reportsCount
    ] = await Promise.all([
      db.collection(ITEMS_COLLECTION).countDocuments().catch(() => 0),
      db.collection(CASES_COLLECTION).countDocuments().catch(() => 0),
      db.collection(RECOVERY_REQUESTS_COLLECTION).countDocuments().catch(() => 0),
      db.collection(TRANSACTIONS_COLLECTION).countDocuments().catch(() => 0),
      db.collection(USERS_COLLECTION).countDocuments().catch(() => 0),
      db.collection(REPORTS_COLLECTION).countDocuments().catch(() => 0)
    ]);

    return {
      connected: true,
      database: DB_NAME,
      message: 'Connected to MongoDB Atlas cluster',
      collections: [
        { name: ITEMS_COLLECTION, count: itemsCount },
        { name: CASES_COLLECTION, count: casesCount },
        { name: RECOVERY_REQUESTS_COLLECTION, count: recoveryCount },
        { name: TRANSACTIONS_COLLECTION, count: txnCount },
        { name: USERS_COLLECTION, count: usersCount },
        { name: REPORTS_COLLECTION, count: reportsCount }
      ]
    };
  } catch (err: any) {
    return {
      connected: false,
      database: DB_NAME,
      message: err?.message || 'Error querying MongoDB collections',
      collections: []
    };
  }
}

export async function testMongoConnection(): Promise<{ connected: boolean; message: string; database?: string }> {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    return { 
      connected: false, 
      message: isProductionEnv() 
        ? 'MONGODB_URI environment variable not configured' 
        : 'MONGODB_URI not configured (local development store active)' 
    };
  }
  try {
    const clientInstance = await getMongoClient();
    await clientInstance.db(DB_NAME).command({ ping: 1 });
    return { connected: true, message: 'Connected to MongoDB Atlas cluster', database: DB_NAME };
  } catch (err: any) {
    return { connected: false, message: `MongoDB Atlas connection failed: ${err?.message || 'Unreachable'}` };
  }
}

// Backward-compatibility exports
export const getItemsFromDb = getAllItemsFromDb;

export async function saveAllItemsToDb(items: PublishedItem[]): Promise<boolean> {
  for (const item of items) {
    await saveItemToDb(item);
  }
  return true;
}

export async function saveAllCasesToDb(cases: ContactCase[]): Promise<boolean> {
  for (const c of cases) {
    await saveCaseToDb(c);
  }
  return true;
}

export async function saveAllRecoveryRequestsToDb(requests: RecoveryRequest[]): Promise<boolean> {
  for (const r of requests) {
    await saveRecoveryRequestToDb(r);
  }
  return true;
}

export async function saveAllUsersToDb(users: User[]): Promise<boolean> {
  for (const u of users) {
    await saveUserToDb(u);
  }
  return true;
}

export async function saveAllTransactionsToDb(txns: Transaction[]): Promise<boolean> {
  for (const t of txns) {
    await saveTransactionToDb(t);
  }
  return true;
}
