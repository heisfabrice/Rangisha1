import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import { 
  ServiceSettings, 
  AdminContactSettings, 
  PublishedItem, 
  ContactCase, 
  RecoveryRequest, 
  Transaction, 
  User 
} from '../src/types/index';

dotenv.config();

const uri = process.env.MONGODB_URI || '';
const DB_NAME = 'rangisha';

// Collection definitions in MongoDB Atlas
const ITEMS_COLLECTION = 'items';
const PRODUCTS_COLLECTION = 'products';
const CASES_COLLECTION = 'cases';
const RECOVERY_REQUESTS_COLLECTION = 'recoveryRequests';
const TRANSACTIONS_COLLECTION = 'transactions';
const USERS_COLLECTION = 'users';
const SERVICE_SETTINGS_COLLECTION = 'serviceSettings';
const SITE_SETTINGS_COLLECTION = 'siteSettings';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient | null> | null = null;
let isConnected = false;

/**
 * Initializes and returns a cached MongoDB Atlas client.
 * Uses connection pooling and avoids re-creating connections per request.
 * Safely handles missing MONGODB_URI or network/credential errors without crashing.
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri || !uri.trim()) {
    return null;
  }

  if (client && isConnected) {
    return client;
  }

  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        const newClient = new MongoClient(uri, {
          connectTimeoutMS: 5000,
          serverSelectionTimeoutMS: 5000,
          maxPoolSize: 10
        });

        await newClient.connect();
        client = newClient;
        isConnected = true;
        console.log('[MongoDB Atlas] Connected successfully to cluster.');
        return client;
      } catch (err: any) {
        console.error('[MongoDB Atlas Error] Failed to connect:', err?.message || err);
        isConnected = false;
        clientPromise = null;
        client = null;
        return null;
      }
    })();
  }

  return clientPromise;
}

export async function getMongoDb(): Promise<Db | null> {
  const mongoClient = await getMongoClient();
  if (!mongoClient) return null;
  try {
    return mongoClient.db(DB_NAME);
  } catch (err) {
    console.error('[MongoDB Atlas Error] Could not access DB:', err);
    return null;
  }
}

// ==========================================
// 1. PRODUCTS / REPORTED ITEMS (Ababuze & Ababonetse)
// ==========================================

export async function getItemsFromDb(): Promise<PublishedItem[]> {
  try {
    const db = await getMongoDb();
    if (!db) return [];

    const collection = db.collection(ITEMS_COLLECTION);
    let docs = await collection.find({}).toArray();
    if (docs.length === 0) {
      // Fallback check on products collection
      const prodCollection = db.collection(PRODUCTS_COLLECTION);
      docs = await prodCollection.find({}).toArray();
    }
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: rest.id || String(_id)
      } as PublishedItem;
    });
  } catch (err) {
    console.error('[MongoDB Atlas Error] getItemsFromDb:', err);
    return [];
  }
}

export async function saveItemToDb(item: PublishedItem): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const { id, ...data } = item;
    const updateDoc = { 
      $set: { 
        ...data, 
        id, 
        updatedAt: item.updatedAt || new Date().toISOString() 
      } 
    };

    // Save to both 'items' and 'products' collections in MongoDB Atlas
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
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveItemToDb:', err);
    return false;
  }
}

export async function saveAllItemsToDb(items: PublishedItem[]): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db || items.length === 0) return false;

    const ops = items.map(item => ({
      updateOne: {
        filter: { _id: item.id as any },
        update: { $set: { ...item } },
        upsert: true
      }
    }));

    // Bulk sync to both 'items' and 'products' in MongoDB Atlas
    await Promise.all([
      db.collection(ITEMS_COLLECTION).bulkWrite(ops),
      db.collection(PRODUCTS_COLLECTION).bulkWrite(ops)
    ]);
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveAllItemsToDb:', err);
    return false;
  }
}

export async function deleteItemFromDb(id: string): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const filter = { 
      $or: [{ _id: id as any }, { id }, { reportId: id }] 
    };

    await Promise.all([
      db.collection(ITEMS_COLLECTION).deleteOne(filter),
      db.collection(PRODUCTS_COLLECTION).deleteOne(filter)
    ]);
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] deleteItemFromDb:', err);
    return false;
  }
}

// ==========================================
// 2. CASES / INTAKE REPORTS
// ==========================================

export async function getCasesFromDb(): Promise<ContactCase[]> {
  try {
    const db = await getMongoDb();
    if (!db) return [];

    const collection = db.collection(CASES_COLLECTION);
    const docs = await collection.find({}).toArray();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: rest.id || String(_id)
      } as ContactCase;
    });
  } catch (err) {
    console.error('[MongoDB Atlas Error] getCasesFromDb:', err);
    return [];
  }
}

export async function saveCaseToDb(caseObj: ContactCase): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const collection = db.collection(CASES_COLLECTION);
    const { id, ...data } = caseObj;
    await collection.updateOne(
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
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveCaseToDb:', err);
    return false;
  }
}

export async function saveAllCasesToDb(cases: ContactCase[]): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db || cases.length === 0) return false;

    const collection = db.collection(CASES_COLLECTION);
    const ops = cases.map(c => ({
      updateOne: {
        filter: { _id: c.id as any },
        update: { $set: { ...c } },
        upsert: true
      }
    }));
    await collection.bulkWrite(ops);
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveAllCasesToDb:', err);
    return false;
  }
}

// ==========================================
// 3. RECOVERY REQUESTS (CLAIMS)
// ==========================================

export async function getRecoveryRequestsFromDb(): Promise<RecoveryRequest[]> {
  try {
    const db = await getMongoDb();
    if (!db) return [];

    const collection = db.collection(RECOVERY_REQUESTS_COLLECTION);
    const docs = await collection.find({}).toArray();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: rest.id || String(_id)
      } as RecoveryRequest;
    });
  } catch (err) {
    console.error('[MongoDB Atlas Error] getRecoveryRequestsFromDb:', err);
    return [];
  }
}

export async function saveRecoveryRequestToDb(req: RecoveryRequest): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const collection = db.collection(RECOVERY_REQUESTS_COLLECTION);
    const { id, ...data } = req;
    await collection.updateOne(
      { _id: id as any },
      { $set: { ...data, id } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveRecoveryRequestToDb:', err);
    return false;
  }
}

export async function saveAllRecoveryRequestsToDb(requests: RecoveryRequest[]): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db || requests.length === 0) return false;

    const collection = db.collection(RECOVERY_REQUESTS_COLLECTION);
    const ops = requests.map(r => ({
      updateOne: {
        filter: { _id: r.id as any },
        update: { $set: { ...r } },
        upsert: true
      }
    }));
    await collection.bulkWrite(ops);
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveAllRecoveryRequestsToDb:', err);
    return false;
  }
}

// ==========================================
// 4. TRANSACTIONS
// ==========================================

export async function getTransactionsFromDb(): Promise<Transaction[]> {
  try {
    const db = await getMongoDb();
    if (!db) return [];

    const collection = db.collection(TRANSACTIONS_COLLECTION);
    const docs = await collection.find({}).toArray();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: rest.id || String(_id)
      } as Transaction;
    });
  } catch (err) {
    console.error('[MongoDB Atlas Error] getTransactionsFromDb:', err);
    return [];
  }
}

export async function saveTransactionToDb(txn: Transaction): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const collection = db.collection(TRANSACTIONS_COLLECTION);
    const { id, ...data } = txn;
    await collection.updateOne(
      { _id: id as any },
      { $set: { ...data, id } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveTransactionToDb:', err);
    return false;
  }
}

export async function saveAllTransactionsToDb(txns: Transaction[]): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db || txns.length === 0) return false;

    const collection = db.collection(TRANSACTIONS_COLLECTION);
    const ops = txns.map(t => ({
      updateOne: {
        filter: { _id: t.id as any },
        update: { $set: { ...t } },
        upsert: true
      }
    }));
    await collection.bulkWrite(ops);
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveAllTransactionsToDb:', err);
    return false;
  }
}

// ==========================================
// 5. USERS
// ==========================================

export async function getUsersFromDb(): Promise<User[]> {
  try {
    const db = await getMongoDb();
    if (!db) return [];

    const collection = db.collection(USERS_COLLECTION);
    const docs = await collection.find({}).toArray();
    return docs.map((doc: any) => {
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: rest.id || String(_id)
      } as User;
    });
  } catch (err) {
    console.error('[MongoDB Atlas Error] getUsersFromDb:', err);
    return [];
  }
}

export async function saveUserToDb(user: User): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const collection = db.collection(USERS_COLLECTION);
    const { id, ...data } = user;
    await collection.updateOne(
      { _id: id as any },
      { $set: { ...data, id } },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveUserToDb:', err);
    return false;
  }
}

export async function saveAllUsersToDb(users: User[]): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db || users.length === 0) return false;

    const collection = db.collection(USERS_COLLECTION);
    const ops = users.map(u => ({
      updateOne: {
        filter: { _id: u.id as any },
        update: { $set: { ...u } },
        upsert: true
      }
    }));
    await collection.bulkWrite(ops);
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveAllUsersToDb:', err);
    return false;
  }
}

// ==========================================
// 6. SERVICE AVAILABILITY SETTINGS
// ==========================================

export async function getServiceSettingsFromDb(): Promise<ServiceSettings | null> {
  try {
    const db = await getMongoDb();
    if (!db) return null;

    const collection = db.collection(SERVICE_SETTINGS_COLLECTION);
    const doc = await collection.findOne({ serviceName: 'Office Service' });
    if (!doc) return null;

    return {
      serviceName: doc.serviceName || 'Office Service',
      available: Boolean(doc.available),
      status: doc.status || (doc.available ? 'available' : 'coming_soon'),
      message: doc.message || 'This service is currently unavailable and will be available in the coming days.',
      messageRw: doc.messageRw || 'Iyi serivisi yo kwakira ibyangombwa mu biro ntabwo iratangira, izatangira mu minsi iri imbere. Mukomeze mutwandikire kuri WhatsApp cyangwa Hotline.',
      expectedAvailability: doc.expectedAvailability || 'Coming days',
      expectedAvailabilityRw: doc.expectedAvailabilityRw || 'Mu minsi ya vuba',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString()
    };
  } catch (err) {
    console.error('[MongoDB Atlas Error] getServiceSettings:', err);
    return null;
  }
}

export async function saveServiceSettingsToDb(data: Partial<ServiceSettings>): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const collection = db.collection(SERVICE_SETTINGS_COLLECTION);
    await collection.updateOne(
      { serviceName: 'Office Service' },
      {
        $set: {
          serviceName: 'Office Service',
          available: data.available ?? false,
          status: data.status || (data.available ? 'available' : 'coming_soon'),
          message: data.message || 'This service is currently unavailable and will be available in the coming days.',
          messageRw: data.messageRw || 'Iyi serivisi yo kwakira ibyangombwa mu biro ntabwo iratangira, izatangira mu minsi iri imbere. Mukomeze mutwandikire kuri WhatsApp cyangwa Hotline.',
          expectedAvailability: data.expectedAvailability || 'Coming days',
          expectedAvailabilityRw: data.expectedAvailabilityRw || 'Mu minsi ya vuba',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveServiceSettings:', err);
    return false;
  }
}

// ==========================================
// 7. WEBSITE CONTACT SETTINGS
// ==========================================

export async function getSiteSettingsFromDb(): Promise<AdminContactSettings | null> {
  try {
    const db = await getMongoDb();
    if (!db) return null;

    const collection = db.collection(SITE_SETTINGS_COLLECTION);
    const doc = await collection.findOne({ _id: 'siteContactSettings' as any });
    if (!doc) return null;

    return {
      phone: doc.phone || doc.hotline || '0794473504',
      whatsapp: doc.whatsapp || '0736138312',
      email: doc.email || 'ishimwefabrice856@gmail.com',
      officeAddress: doc.officeAddress || 'KN 3 Rd, CHIC Complex, 3rd Floor, Kigali, Rwanda',
      officeHours: doc.officeHours || 'Kuwa Mbere - Kuwa Gatandatu: 8:00 AM - 6:00 PM CAT',
      instagram: doc.instagram || 'https://instagram.com/dollar.rw',
      facebook: doc.facebook || 'https://www.facebook.com/search/top?q=Heis%20Fabrice',
      twitter: doc.twitter || doc.x || 'https://x.com/heisfabrice1.2'
    };
  } catch (err) {
    console.error('[MongoDB Atlas Error] getSiteSettings:', err);
    return null;
  }
}

export async function saveSiteSettingsToDb(contact: AdminContactSettings): Promise<boolean> {
  try {
    const db = await getMongoDb();
    if (!db) return false;

    const collection = db.collection(SITE_SETTINGS_COLLECTION);
    await collection.updateOne(
      { _id: 'siteContactSettings' as any },
      {
        $set: {
          phone: contact.phone,
          hotline: contact.phone,
          whatsapp: contact.whatsapp,
          email: contact.email,
          officeAddress: contact.officeAddress,
          officeHours: contact.officeHours,
          instagram: contact.instagram,
          facebook: contact.facebook,
          twitter: contact.twitter,
          x: contact.twitter,
          updatedAt: new Date()
        },
        $unset: {
          telegram: "",
          messenger: ""
        }
      },
      { upsert: true }
    );
    return true;
  } catch (err) {
    console.error('[MongoDB Atlas Error] saveSiteSettings:', err);
    return false;
  }
}

// ==========================================
// 8. HEALTH & SUMMARY DIAGNOSTICS
// ==========================================

export async function getMongoCollectionsSummary(): Promise<{
  connected: boolean;
  database: string;
  message: string;
  collections: { name: string; count: number }[];
}> {
  if (!uri) {
    return { 
      connected: false, 
      database: DB_NAME,
      message: 'MONGODB_URI not configured', 
      collections: [] 
    };
  }

  try {
    const db = await getMongoDb();
    if (!db) {
      return { 
        connected: false, 
        database: DB_NAME,
        message: 'Could not connect to MongoDB Atlas cluster', 
        collections: [] 
      };
    }

    const [
      itemsCount, 
      productsCount,
      casesCount, 
      recoveryCount, 
      txnCounts, 
      usersCount,
      serviceDoc, 
      siteDoc
    ] = await Promise.all([
      db.collection(ITEMS_COLLECTION).countDocuments().catch(() => 0),
      db.collection(PRODUCTS_COLLECTION).countDocuments().catch(() => 0),
      db.collection(CASES_COLLECTION).countDocuments().catch(() => 0),
      db.collection(RECOVERY_REQUESTS_COLLECTION).countDocuments().catch(() => 0),
      db.collection(TRANSACTIONS_COLLECTION).countDocuments().catch(() => 0),
      db.collection(USERS_COLLECTION).countDocuments().catch(() => 0),
      db.collection(SERVICE_SETTINGS_COLLECTION).countDocuments().catch(() => 0),
      db.collection(SITE_SETTINGS_COLLECTION).countDocuments().catch(() => 0)
    ]);

    return {
      connected: true,
      database: DB_NAME,
      message: 'Connected to MongoDB Atlas cluster',
      collections: [
        { name: ITEMS_COLLECTION, count: itemsCount },
        { name: PRODUCTS_COLLECTION, count: productsCount },
        { name: CASES_COLLECTION, count: casesCount },
        { name: RECOVERY_REQUESTS_COLLECTION, count: recoveryCount },
        { name: TRANSACTIONS_COLLECTION, count: txnCounts },
        { name: USERS_COLLECTION, count: usersCount },
        { name: SERVICE_SETTINGS_COLLECTION, count: serviceDoc },
        { name: SITE_SETTINGS_COLLECTION, count: siteDoc }
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

export async function testMongoConnection(): Promise<{ connected: boolean; message: string }> {
  if (!uri) {
    return { connected: false, message: 'MONGODB_URI environment variable not configured' };
  }
  const clientInstance = await getMongoClient();
  if (clientInstance) {
    return { connected: true, message: 'Connected to MongoDB Atlas cluster' };
  }
  return { connected: false, message: 'Unable to reach MongoDB Atlas cluster (using persistent store fallback)' };
}

