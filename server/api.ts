import { Router, Request, Response } from 'express';
import { findMatchesForLostItem } from './matching';
import { calculateCommissionBreakdown } from './commission';
import { PublishedItem, ContactCase, RecoveryRequest, Transaction, RwandaLocation, User } from '../src/types/index';
import { 
  getPublicItemsFromDb,
  getAllItemsFromDb,
  getItemByIdFromDb,
  saveItemToDb,
  deleteItemFromDb,
  getCasesFromDb,
  getCaseByIdFromDb,
  saveCaseToDb,
  getRecoveryRequestsFromDb,
  getRecoveryRequestByIdFromDb,
  saveRecoveryRequestToDb,
  getTransactionsFromDb,
  saveTransactionToDb,
  getSystemSettingsFromDb,
  saveSystemSettingsToDb,
  getServiceSettingsFromDb,
  saveServiceSettingsToDb,
  getReportsFromDb,
  saveReportToDb,
  updateReportStatusInDb,
  getAuditLogsFromDb,
  saveAuditLogToDb,
  getReviewsFromDb,
  getAnalyticsFromDb,
  getNextSequenceNumber,
  getUsersFromDb,
  getUserByEmailFromDb,
  saveUserToDb,
  getMongoCollectionsSummary,
  testMongoConnection
} from './mongodb';
import { generateAdminToken, requireAdminAuth } from './auth';

export const apiRouter = Router();

// Helper to handle database errors safely without exposing credentials
function handleDbError(res: Response, err: any, actionName: string) {
  console.error(`[API Error] ${actionName}:`, err?.message || err);
  const isDbConfigError = 
    err?.message?.includes('MONGODB_URI') || 
    err?.message?.includes('connect ECONNREFUSED') ||
    err?.message?.includes('MongoServerSelectionError') ||
    err?.message?.includes('querySrv');

  if (isDbConfigError) {
    return res.status(503).json({
      error: 'Database service is currently unavailable. Please check that MONGODB_URI is correctly configured in Vercel Project Settings.'
    });
  }

  res.status(500).json({ error: err?.message || 'Internal database error' });
}

// ==========================================
// 1. PUBLIC ITEMS (Approved & Published Only)
// ==========================================

apiRouter.get('/items', async (req: Request, res: Response) => {
  try {
    const { 
      type, 
      category, 
      district, 
      q, 
      status, 
      sort, 
      page = '1', 
      limit = '20' 
    } = req.query;

    const result = await getPublicItemsFromDb({
      type: type as string,
      category: category as string,
      district: district as string,
      q: q as string,
      status: status as string,
      sort: sort as string,
      page: parseInt(page as string, 10) || 1,
      limit: parseInt(limit as string, 10) || 20
    });

    res.json(result);
  } catch (err: any) {
    handleDbError(res, err, 'GET /items');
  }
});

apiRouter.get('/items/:id', async (req: Request, res: Response) => {
  try {
    const item = await getItemByIdFromDb(req.params.id);
    if (!item || !item.isPublished || item.visibility !== 'public') {
      return res.status(404).json({ error: 'Item not found or not published' });
    }

    // Redact strictly private details from public item view
    const sanitized: PublishedItem = {
      ...item,
      contactPersonPhone: undefined,
      contactPersonEmail: undefined,
      internalNotes: undefined,
      exactLocationInternal: undefined
    };

    res.json(sanitized);
  } catch (err: any) {
    handleDbError(res, err, `GET /items/${req.params.id}`);
  }
});

// ==========================================
// 2. CONTACT RANGA (Citizen Intake -> Case)
// ==========================================

apiRouter.post('/cases', async (req: Request, res: Response) => {
  try {
    const { personName, phone, itemName } = req.body || {};
    if (!personName || !phone || !itemName) {
      return res.status(400).json({ error: 'Name, phone number, and item information are required.' });
    }

    const caseNumber = await getNextSequenceNumber('case', 'RNG-CASE-2026', 6);
    const newCase: ContactCase = {
      id: `case-${Date.now()}`,
      caseNumber,
      personName: req.body.personName || 'Citizen User',
      phone: req.body.phone || '',
      whatsapp: req.body.whatsapp,
      email: req.body.email,
      type: req.body.type || 'lost',
      itemName: req.body.itemName,
      categoryId: req.body.categoryId || 'other',
      categoryName: req.body.categoryName || 'Other Items',
      description: req.body.description || '',
      location: req.body.location || { province: 'Kigali City', district: 'Gasabo' },
      date: req.body.date || new Date().toISOString().split('T')[0],
      approximateTime: req.body.approximateTime,
      photos: req.body.photos && req.body.photos.length > 0 ? req.body.photos : [
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'
      ],
      brand: req.body.brand,
      model: req.body.model,
      color: req.body.color,
      serialNumber: req.body.serialNumber,
      additionalInfo: req.body.additionalInfo,
      rewardInfo: req.body.rewardInfo,
      status: 'NEW',
      adminAnalysis: {
        verificationStatus: 'Pending',
        adminNotes: '',
        riskLevel: 'Low',
        authenticity: 'Uncertain',
        decision: 'Request More Information'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveCaseToDb(newCase);
    await saveAuditLogToDb({
      actorId: 'usr-intake',
      actorName: newCase.personName,
      actorRole: 'user',
      action: 'NEW_CONTACT_CASE',
      targetId: newCase.id,
      targetType: 'case',
      newStatus: 'NEW',
      details: `Citizen created contact case ${newCase.caseNumber} for ${newCase.type} ${newCase.itemName}`
    });

    res.status(201).json({
      success: true,
      caseNumber: newCase.caseNumber,
      message: 'Amakuru yawe yakiriwe n\'ubuyobozi bwa Rangisha.com. Abakozi bacu baraza kuyasuzuma mbere yo kuyashyira ku rubuga.',
      case: newCase
    });
  } catch (err: any) {
    handleDbError(res, err, 'POST /cases');
  }
});

// Citizen submits Lost Item Report Form
apiRouter.post('/lost-items', async (req: Request, res: Response) => {
  try {
    const { itemName, categoryId, categoryName, description, personName, phone } = req.body || {};
    if (!itemName || !phone) {
      return res.status(400).json({ error: 'Item name and contact phone number are required.' });
    }

    const reportId = await getNextSequenceNumber('lostReport', 'RNG-LOST-2026', 6);
    const caseNumber = await getNextSequenceNumber('case', 'RNG-CASE-2026', 6);

    const newCase: ContactCase = {
      id: `case-${Date.now()}`,
      caseNumber,
      personName: personName || 'Citizen User',
      phone,
      whatsapp: req.body.whatsapp || phone,
      email: req.body.email,
      type: 'lost',
      itemName,
      categoryId: categoryId || 'other',
      categoryName: categoryName || 'Other Items',
      description: description || '',
      location: req.body.location || { province: 'Kigali City', district: 'Gasabo' },
      date: req.body.date || new Date().toISOString().split('T')[0],
      approximateTime: req.body.approximateTime,
      photos: req.body.photos || [],
      brand: req.body.brand,
      model: req.body.model,
      color: req.body.color,
      serialNumber: req.body.serialNumber,
      additionalInfo: `Report ID: ${reportId}. ${req.body.additionalInfo || ''}`,
      rewardInfo: req.body.rewardInfo,
      status: 'NEW',
      adminAnalysis: {
        verificationStatus: 'Pending',
        adminNotes: '',
        riskLevel: 'Low',
        authenticity: 'Uncertain',
        decision: 'Request More Information'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveCaseToDb(newCase);
    await saveAuditLogToDb({
      actorId: 'usr-intake',
      actorName: newCase.personName,
      actorRole: 'user',
      action: 'NEW_LOST_REPORT',
      targetId: newCase.id,
      targetType: 'case',
      newStatus: 'NEW',
      details: `Citizen submitted lost report ${reportId} (Case ${caseNumber}): ${itemName}`
    });

    res.status(201).json({
      success: true,
      reportId,
      caseNumber: newCase.caseNumber,
      message: `Raporo yawe yakiriwe neza kuri Rangisha.com! Nimero ya raporo ni ${reportId}. Abakozi bacu baragenzura amakuru mbere yo kuyashyira ku rubuga.`,
      case: newCase
    });
  } catch (err: any) {
    handleDbError(res, err, 'POST /lost-items');
  }
});

// Citizen submits Found Item Report Form
apiRouter.post('/found-items', async (req: Request, res: Response) => {
  try {
    const { itemName, categoryId, categoryName, description, finderName, finderPhone, phone } = req.body || {};
    const contactPhone = finderPhone || phone;
    if (!itemName || !contactPhone) {
      return res.status(400).json({ error: 'Item name and finder contact phone are required.' });
    }

    const reportId = await getNextSequenceNumber('foundReport', 'RNG-FOUND-2026', 6);
    const caseNumber = await getNextSequenceNumber('case', 'RNG-CASE-2026', 6);

    const newCase: ContactCase = {
      id: `case-${Date.now()}`,
      caseNumber,
      personName: finderName || req.body.personName || 'Finder User',
      phone: contactPhone,
      whatsapp: req.body.whatsapp || contactPhone,
      email: req.body.email,
      type: 'found',
      itemName,
      categoryId: categoryId || 'other',
      categoryName: categoryName || 'Other Items',
      description: description || '',
      location: req.body.location || { province: 'Kigali City', district: 'Gasabo' },
      date: req.body.date || new Date().toISOString().split('T')[0],
      approximateTime: req.body.approximateTime,
      photos: req.body.photos || [],
      brand: req.body.brand,
      model: req.body.model,
      color: req.body.color,
      serialNumber: req.body.serialNumber,
      additionalInfo: `Report ID: ${reportId}. ${req.body.additionalInfo || ''}`,
      rewardInfo: req.body.rewardInfo,
      status: 'NEW',
      adminAnalysis: {
        verificationStatus: 'Pending',
        adminNotes: '',
        riskLevel: 'Low',
        authenticity: 'Uncertain',
        decision: 'Request More Information'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveCaseToDb(newCase);
    await saveAuditLogToDb({
      actorId: 'usr-intake',
      actorName: newCase.personName,
      actorRole: 'user',
      action: 'NEW_FOUND_REPORT',
      targetId: newCase.id,
      targetType: 'case',
      newStatus: 'NEW',
      details: `Citizen submitted found report ${reportId} (Case ${caseNumber}): ${itemName}`
    });

    res.status(201).json({
      success: true,
      reportId,
      caseNumber: newCase.caseNumber,
      message: `Murakoze cyane gutangaza icyatoraguwe! Nimero ya raporo ni ${reportId}. Rangisha igiye gufasha gushaka nyiracyo.`,
      case: newCase
    });
  } catch (err: any) {
    handleDbError(res, err, 'POST /found-items');
  }
});

// ==========================================
// 3. RECOVERY REQUESTS ("RANGA" Button)
// ==========================================

apiRouter.post('/recovery-requests', async (req: Request, res: Response) => {
  try {
    const { itemId, claimantName, claimantPhone, ownershipExplanation } = req.body || {};
    if (!itemId || !claimantName || !claimantPhone || !ownershipExplanation) {
      return res.status(400).json({
        error: 'Amazina, telefone n\'ibisobanuro by\'umutungo birakenewe (Name, phone and ownership explanation required).'
      });
    }

    const item = await getItemByIdFromDb(itemId);
    const requestId = await getNextSequenceNumber('recovery', 'RNG-REC-2026', 6);

    const newReq: RecoveryRequest = {
      id: `rec-${Date.now()}`,
      requestId,
      itemId,
      itemReportId: item?.reportId || itemId,
      itemTitle: item?.title || req.body.itemTitle || 'Item',
      claimantName,
      claimantPhone,
      claimantEmail: req.body.claimantEmail,
      ownershipExplanation,
      identifyingDetails: req.body.identifyingDetails || '',
      proofDocumentUrl: req.body.proofDocumentUrl,
      preferredContactMethod: req.body.preferredContactMethod || 'whatsapp',
      status: 'pending',
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveRecoveryRequestToDb(newReq);
    await saveAuditLogToDb({
      actorId: 'usr-citizen',
      actorName: claimantName,
      actorRole: 'user',
      action: 'SUBMIT_RECOVERY_CLAIM',
      targetId: newReq.id,
      targetType: 'case',
      details: `Citizen submitted recovery claim ${newReq.requestId} for item ${newReq.itemReportId}.`
    });

    res.status(201).json({
      success: true,
      requestId: newReq.requestId,
      message: `Icyifuzo cyawe cyo kugarura ikintu ${newReq.requestId} cyakiriwe. Ubuyobozi bwa Rangisha bugiye kugenzura ibimenyetso buhure nawe.`,
      recoveryRequest: newReq
    });
  } catch (err: any) {
    handleDbError(res, err, 'POST /recovery-requests');
  }
});

apiRouter.get('/recovery-requests', async (_req: Request, res: Response) => {
  try {
    const requests = await getRecoveryRequestsFromDb();
    res.json(requests);
  } catch (err: any) {
    handleDbError(res, err, 'GET /recovery-requests');
  }
});

apiRouter.patch('/recovery-requests/:id', async (req: Request, res: Response) => {
  try {
    const existing = await getRecoveryRequestByIdFromDb(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Recovery request not found' });

    const updated: RecoveryRequest = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await saveRecoveryRequestToDb(updated);
    res.json({ success: true, recoveryRequest: updated });
  } catch (err: any) {
    handleDbError(res, err, `PATCH /recovery-requests/${req.params.id}`);
  }
});

// ==========================================
// 4. TRANSACTIONS
// ==========================================

apiRouter.get('/transactions', async (_req: Request, res: Response) => {
  try {
    const txns = await getTransactionsFromDb();
    res.json(txns);
  } catch (err: any) {
    handleDbError(res, err, 'GET /transactions');
  }
});

apiRouter.post('/transactions', async (req: Request, res: Response) => {
  try {
    const ref = await getNextSequenceNumber('transaction', 'RNG-TXN-2026', 6);
    const txn: Transaction = {
      id: `txn-${Date.now()}`,
      transactionRef: ref,
      caseId: req.body.caseId,
      itemReportId: req.body.itemReportId || '',
      itemTitle: req.body.itemTitle || 'Item',
      totalAmount: req.body.totalAmount || 0,
      rangaCommission: req.body.rangaCommission || 0,
      finderPayout: req.body.finderPayout || 0,
      currency: req.body.currency || 'RWF',
      paymentMethod: req.body.paymentMethod || 'momo',
      status: req.body.status || 'pending',
      payerName: req.body.payerName || 'Citizen User',
      payerPhone: req.body.payerPhone,
      createdAt: new Date().toISOString()
    };

    await saveTransactionToDb(txn);
    res.status(201).json({ success: true, transaction: txn });
  } catch (err: any) {
    handleDbError(res, err, 'POST /transactions');
  }
});

// ==========================================
// 5. SETTINGS & REVIEWS (Public Access)
// ==========================================

apiRouter.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getSystemSettingsFromDb();
    res.json(settings);
  } catch (err: any) {
    handleDbError(res, err, 'GET /settings');
  }
});

apiRouter.get('/service-settings', async (_req: Request, res: Response) => {
  try {
    const service = await getServiceSettingsFromDb();
    res.json(service);
  } catch (err: any) {
    handleDbError(res, err, 'GET /service-settings');
  }
});

apiRouter.get('/reviews', async (_req: Request, res: Response) => {
  try {
    const reviews = await getReviewsFromDb();
    res.json(reviews);
  } catch (err: any) {
    handleDbError(res, err, 'GET /reviews');
  }
});

// Suspicious Listing Report
apiRouter.post('/reports', async (req: Request, res: Response) => {
  try {
    const report = await saveReportToDb(req.body);
    res.status(201).json({ success: true, report });
  } catch (err: any) {
    handleDbError(res, err, 'POST /reports');
  }
});

// Smart Matching (queries published items in Atlas)
apiRouter.get('/matches-all', async (_req: Request, res: Response) => {
  try {
    const itemsRes = await getPublicItemsFromDb({ limit: 100 });
    const published = itemsRes.items;
    const lostList = published.filter(i => i.type === 'lost' && i.status === 'searching');
    const foundList = published.filter(i => i.type === 'found' && i.status !== 'recovered');

    const allMatches = [];
    for (const lost of lostList) {
      const matches = findMatchesForLostItem(lost, foundList);
      if (matches.length > 0) {
        allMatches.push(...matches);
      }
    }

    allMatches.sort((a, b) => b.score - a.score);
    res.json(allMatches.slice(0, 20));
  } catch (err: any) {
    handleDbError(res, err, 'GET /matches-all');
  }
});

// ==========================================
// 6. AUTHENTICATION & SECURE ADMIN LOGIN
// ==========================================

// Dedicated Admin Login Endpoint
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email n\'ijambo ry\'ibanga birakenewe (Both email and password are required).' 
    });
  }

  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const configuredAdminPassword = process.env.ADMIN_PASSWORD || (!isProd ? 'admin123' : '');
  if (!configuredAdminPassword || !configuredAdminPassword.trim()) {
    console.error('[Security Warning] ADMIN_PASSWORD environment variable is not configured in Vercel settings.');
    return res.status(500).json({
      error: 'Admin authentication is not configured. Please set the ADMIN_PASSWORD environment variable in Vercel Project Settings.'
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const configuredEmail = (process.env.ADMIN_EMAIL || 'admin@ranga.rw').toLowerCase();

  // Allow admin login if password matches configured password and email is admin
  const isEmailAdmin = 
    cleanEmail === configuredEmail ||
    cleanEmail === 'admin@ranga.rw' ||
    cleanEmail === 'admin@rangisha.rw' ||
    cleanEmail.startsWith('admin@');

  if (!isEmailAdmin || password !== configuredAdminPassword) {
    return res.status(401).json({
      error: 'Ijambo ry\'ibanga cyangwa email ntabwo aribyo (Incorrect admin email or password). Please check credentials.'
    });
  }

  const adminName = process.env.ADMIN_NAME || 'Rangisha Administrator';
  const adminUser = {
    id: 'usr-admin-1',
    name: adminName,
    email: cleanEmail,
    role: 'super_admin' as const,
    preferredLanguage: 'rw' as const,
    isVerified: true,
    district: 'Nyarugenge',
    createdAt: new Date().toISOString()
  };

  const token = generateAdminToken(adminUser);

  return res.json({ 
    user: adminUser, 
    token 
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const configuredAdminPassword = process.env.ADMIN_PASSWORD || (!isProd ? 'admin123' : '');

  const isAdminEmail = 
    cleanEmail === (process.env.ADMIN_EMAIL || 'admin@ranga.rw').toLowerCase() ||
    cleanEmail === 'admin@rangisha.rw' || 
    cleanEmail.startsWith('admin@');

  // Check if admin login
  if (configuredAdminPassword && password === configuredAdminPassword && isAdminEmail) {
    const adminUser = {
      id: 'usr-admin-1',
      name: process.env.ADMIN_NAME || 'Rangisha Administrator',
      email: cleanEmail,
      role: 'super_admin' as const,
      preferredLanguage: 'rw' as const,
      isVerified: true,
      district: 'Nyarugenge',
      createdAt: new Date().toISOString()
    };

    const token = generateAdminToken(adminUser);
    return res.json({ user: adminUser, token });
  }

  if (isAdminEmail) {
    return res.status(401).json({
      error: 'Ijambo ry\'ibanga ntabwo ari ryo (Incorrect admin password).'
    });
  }

  // Citizen user session token
  const newUser = {
    id: `usr-${Date.now()}`,
    name: cleanEmail.split('@')[0],
    email: cleanEmail,
    role: 'user' as const,
    preferredLanguage: 'rw' as const,
    isVerified: false,
    createdAt: new Date().toISOString()
  };

  res.json({ user: newUser, token: `citizen-${Date.now()}` });
});

apiRouter.get('/auth/seed-users', async (_req: Request, res: Response) => {
  try {
    const users = await getUsersFromDb();
    res.json(users);
  } catch (err: any) {
    handleDbError(res, err, 'GET /auth/seed-users');
  }
});

// ==========================================
// 7. PROTECTED ADMIN CONTROL PANEL
// All routes below require valid Admin JWT Token
// ==========================================

// Dashboard analytics
apiRouter.get('/admin/dashboard', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const analytics = await getAnalyticsFromDb();
    res.json(analytics);
  } catch (err: any) {
    handleDbError(res, err, 'GET /admin/dashboard');
  }
});

// Contact Cases
apiRouter.get('/admin/cases', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;
    const cases = await getCasesFromDb({ 
      status: status as string, 
      type: type as string 
    });
    res.json(cases);
  } catch (err: any) {
    handleDbError(res, err, 'GET /admin/cases');
  }
});

apiRouter.get('/admin/cases/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const c = await getCaseByIdFromDb(req.params.id);
    if (!c) return res.status(404).json({ error: 'Case not found' });
    res.json(c);
  } catch (err: any) {
    handleDbError(res, err, `GET /admin/cases/${req.params.id}`);
  }
});

// Admin updates case analysis & status
apiRouter.patch('/admin/cases/:id/analysis', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      verificationStatus, 
      adminNotes, 
      riskLevel, 
      authenticity, 
      decision,
      status 
    } = req.body || {};

    const existing = await getCaseByIdFromDb(id);
    if (!existing) return res.status(404).json({ error: 'Case not found' });

    const updated: ContactCase = {
      ...existing,
      ...(status ? { status } : {}),
      adminAnalysis: {
        verificationStatus: verificationStatus || existing.adminAnalysis?.verificationStatus || 'Pending',
        adminNotes: adminNotes ?? existing.adminAnalysis?.adminNotes ?? '',
        riskLevel: riskLevel || existing.adminAnalysis?.riskLevel || 'Low',
        authenticity: authenticity || existing.adminAnalysis?.authenticity || 'Uncertain',
        decision: decision || existing.adminAnalysis?.decision || 'Request More Information',
        analyzedBy: (req as any).adminUser?.email || 'admin@rangisha.rw',
        analyzedAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    };

    await saveCaseToDb(updated);
    await saveAuditLogToDb({
      actorId: (req as any).adminUser?.sub || 'usr-admin-1',
      actorName: (req as any).adminUser?.name || 'Administrator',
      actorEmail: (req as any).adminUser?.email || 'admin@rangisha.rw',
      actorRole: 'admin',
      action: 'UPDATE_CASE_STATUS',
      targetId: id,
      targetType: 'case',
      previousStatus: existing.status,
      newStatus: status || existing.status,
      details: `Admin updated case ${existing.caseNumber} analysis and status.`
    });

    res.json({ success: true, case: updated });
  } catch (err: any) {
    handleDbError(res, err, `PATCH /admin/cases/${req.params.id}/analysis`);
  }
});

// Admin PUBLISH TO WEBSITE (from Case)
apiRouter.post('/admin/cases/:id/publish', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const caseObj = await getCaseByIdFromDb(id);
    if (!caseObj) return res.status(404).json({ error: 'Case not found' });

    const custom = req.body.customItemData || {};
    const reportId = caseObj.type === 'found' 
      ? await getNextSequenceNumber('foundReport', 'RNG-FOUND-2026', 6)
      : await getNextSequenceNumber('lostReport', 'RNG-LOST-2026', 6);

    const newItem: PublishedItem = {
      id: `item-${Date.now()}`,
      reportId,
      caseId: caseObj.id,
      type: caseObj.type,
      title: custom.title || caseObj.itemName,
      categoryId: caseObj.categoryId,
      categoryName: caseObj.categoryName,
      description: custom.description || caseObj.description,
      brand: caseObj.brand,
      model: caseObj.model,
      color: caseObj.color,
      serialNumberMasked: caseObj.serialNumber ? `${caseObj.serialNumber.slice(0, 4)}****` : undefined,
      location: {
        province: caseObj.location.province,
        district: caseObj.location.district,
        sector: caseObj.location.sector,
        landmark: caseObj.location.landmark
      },
      exactLocationInternal: `${caseObj.location.cell || ''}, ${caseObj.location.village || ''}`,
      images: caseObj.photos && caseObj.photos.length > 0 ? caseObj.photos : [
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'
      ],
      date: caseObj.date,
      rewardText: caseObj.rewardInfo?.amount ? `${caseObj.rewardInfo.amount.toLocaleString()} RWF` : 'Contact Rangisha for details',
      rewardAmount: caseObj.rewardInfo?.amount || 0,
      isPublished: true,
      visibility: 'public',
      status: caseObj.type === 'found' ? 'found' : 'searching',
      contactPersonName: caseObj.personName,
      contactPersonPhone: caseObj.phone,
      contactPersonEmail: caseObj.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveItemToDb(newItem);

    // Update case to PUBLISHED
    caseObj.status = 'PUBLISHED';
    caseObj.publishedItemId = newItem.id;
    caseObj.updatedAt = new Date().toISOString();
    await saveCaseToDb(caseObj);

    await saveAuditLogToDb({
      actorId: (req as any).adminUser?.sub || 'usr-admin-1',
      actorName: (req as any).adminUser?.name || 'Administrator',
      actorEmail: (req as any).adminUser?.email || 'admin@rangisha.rw',
      actorRole: 'admin',
      action: 'PUBLISH_CASE_TO_ITEM',
      targetId: newItem.id,
      targetType: 'item',
      previousStatus: 'NEW',
      newStatus: 'PUBLISHED',
      details: `Published case ${caseObj.caseNumber} as public listing ${newItem.reportId}`
    });

    res.status(201).json({ success: true, item: newItem });
  } catch (err: any) {
    handleDbError(res, err, `POST /admin/cases/${req.params.id}/publish`);
  }
});

// Admin All Items (Draft, Published, Archived)
apiRouter.get('/admin/items', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const items = await getAllItemsFromDb();
    res.json(items);
  } catch (err: any) {
    handleDbError(res, err, 'GET /admin/items');
  }
});

// Admin creates and immediately publishes an item (Add Item)
apiRouter.post('/admin/items', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { name, title } = req.body || {};
    const itemTitle = (name || title || '').trim();
    if (!itemTitle) {
      return res.status(400).json({ error: 'Item name is required.' });
    }

    const itemType = req.body.type || 'lost';
    let reportId: string;
    if (itemType === 'missing_person') {
      reportId = await getNextSequenceNumber('missingPerson', 'RNG-MIS-2026', 6);
    } else if (itemType === 'found_person') {
      reportId = await getNextSequenceNumber('foundPerson', 'RNG-PER-2026', 6);
    } else if (itemType === 'found') {
      reportId = await getNextSequenceNumber('foundReport', 'RNG-FOUND-2026', 6);
    } else {
      reportId = await getNextSequenceNumber('lostReport', 'RNG-LOST-2026', 6);
    }

    let locationObj: RwandaLocation;
    if (typeof req.body.location === 'string') {
      locationObj = {
        province: 'Rwanda',
        district: req.body.location.trim() || 'Kigali'
      };
    } else if (req.body.location && typeof req.body.location === 'object') {
      locationObj = req.body.location as RwandaLocation;
    } else {
      locationObj = { province: 'Kigali City', district: 'Kigali' };
    }

    let imagesList: string[] = [];
    if (Array.isArray(req.body.images) && req.body.images.length > 0) {
      imagesList = req.body.images.filter(Boolean);
    } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim()) {
      imagesList = [req.body.image.trim()];
    }

    const defaultCatId = (itemType === 'missing_person' || itemType === 'found_person') 
      ? 'people' 
      : (req.body.categoryId || 'other');
    const defaultCatName = (itemType === 'missing_person' || itemType === 'found_person') 
      ? 'Abantu (People)' 
      : (req.body.categoryName || 'General');

    const newItem: PublishedItem = {
      id: `item-${Date.now()}`,
      reportId,
      type: itemType,
      title: itemTitle,
      categoryId: defaultCatId,
      categoryName: defaultCatName,
      description: req.body.description || '',
      location: locationObj,
      images: imagesList,
      date: req.body.date || new Date().toISOString().split('T')[0],
      rewardText: req.body.rewardText || 'Contact Rangisha.com for details',
      rewardAmount: req.body.rewardAmount || 0,
      isPublished: true,
      visibility: 'public',
      status: itemType === 'found' || itemType === 'found_person' ? 'found' : 'searching',
      personDetails: req.body.personDetails,
      isUrgent: itemType === 'missing_person',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveItemToDb(newItem);
    await saveAuditLogToDb({
      actorId: (req as any).adminUser?.sub || 'usr-admin-1',
      actorName: (req as any).adminUser?.name || 'Administrator',
      actorEmail: (req as any).adminUser?.email || 'admin@rangisha.rw',
      actorRole: 'admin',
      action: 'PUBLISH_ITEM',
      targetId: newItem.id,
      targetType: 'item',
      newStatus: 'PUBLISHED',
      details: `Admin created and immediately published item ${newItem.reportId}: ${newItem.title}`
    });

    res.status(201).json({ success: true, item: newItem });
  } catch (err: any) {
    handleDbError(res, err, 'POST /admin/items');
  }
});

// Admin creates Draft Item
apiRouter.post('/admin/items/draft', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const reportId = req.body.type === 'found' 
      ? await getNextSequenceNumber('foundReport', 'RNG-FOUND-2026', 6)
      : await getNextSequenceNumber('lostReport', 'RNG-LOST-2026', 6);

    const draftItem: PublishedItem = {
      id: `item-${Date.now()}`,
      reportId,
      caseId: req.body.caseId,
      type: req.body.type || 'lost',
      title: req.body.title || 'Untitled Item',
      categoryId: req.body.categoryId || 'other',
      categoryName: req.body.categoryName || 'Other',
      description: req.body.description || '',
      brand: req.body.brand,
      model: req.body.model,
      color: req.body.color,
      serialNumberMasked: req.body.serialNumberMasked,
      location: req.body.location || { province: 'Kigali City', district: 'Gasabo' },
      exactLocationInternal: req.body.exactLocationInternal,
      images: req.body.images && req.body.images.length > 0 ? req.body.images : [],
      date: req.body.date || new Date().toISOString().split('T')[0],
      rewardText: req.body.rewardText || 'Contact Rangisha for details',
      rewardAmount: req.body.rewardAmount || 0,
      isPublished: false,
      visibility: 'draft',
      status: req.body.type === 'found' ? 'found' : 'searching',
      internalNotes: req.body.internalNotes,
      contactPersonName: req.body.contactPersonName,
      contactPersonPhone: req.body.contactPersonPhone,
      contactPersonEmail: req.body.contactPersonEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveItemToDb(draftItem);
    res.status(201).json(draftItem);
  } catch (err: any) {
    handleDbError(res, err, 'POST /admin/items/draft');
  }
});

// Admin publishes item
apiRouter.patch('/admin/items/:id/publish', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const item = await getItemByIdFromDb(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.isPublished = true;
    item.visibility = 'public';
    item.updatedAt = new Date().toISOString();

    await saveItemToDb(item);

    if (item.caseId) {
      const caseObj = await getCaseByIdFromDb(item.caseId);
      if (caseObj) {
        caseObj.status = 'PUBLISHED';
        caseObj.publishedItemId = item.id;
        await saveCaseToDb(caseObj);
      }
    }

    await saveAuditLogToDb({
      actorId: (req as any).adminUser?.sub || 'usr-admin-1',
      actorName: (req as any).adminUser?.name || 'Administrator',
      actorRole: 'admin',
      action: 'PUBLISH_ITEM',
      targetId: item.id,
      targetType: 'item',
      newStatus: 'PUBLISHED',
      details: `Published item ${item.reportId} to website.`
    });

    res.json({ success: true, item });
  } catch (err: any) {
    handleDbError(res, err, `PATCH /admin/items/${req.params.id}/publish`);
  }
});

// Admin unpublishes item
apiRouter.patch('/admin/items/:id/unpublish', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const item = await getItemByIdFromDb(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.isPublished = false;
    item.visibility = 'draft';
    item.updatedAt = new Date().toISOString();

    await saveItemToDb(item);

    res.json({ success: true, item });
  } catch (err: any) {
    handleDbError(res, err, `PATCH /admin/items/${req.params.id}/unpublish`);
  }
});

// Admin updates item
apiRouter.patch('/admin/items/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const item = await getItemByIdFromDb(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    let locationVal = item.location;
    if (typeof req.body.location === 'string') {
      const locStr = req.body.location;
      const parts = locStr.split(',').map((s: string) => s.trim());
      locationVal = {
        province: 'Rwanda',
        district: parts[0] || locStr,
        sector: parts[1] || ''
      };
    } else if (req.body.location) {
      locationVal = req.body.location;
    }

    const titleVal = req.body.title || req.body.name || item.title;

    const updated: PublishedItem = {
      ...item,
      ...req.body,
      title: titleVal,
      location: locationVal,
      updatedAt: new Date().toISOString()
    };

    await saveItemToDb(updated);

    await saveAuditLogToDb({
      actorId: (req as any).adminUser?.sub || 'usr-admin-1',
      actorName: (req as any).adminUser?.name || 'Administrator',
      actorRole: 'admin',
      action: 'UPDATE_ITEM',
      targetId: item.id,
      targetType: 'item',
      details: `Updated details for item ${item.reportId}`
    });

    res.json({ success: true, item: updated });
  } catch (err: any) {
    handleDbError(res, err, `PATCH /admin/items/${req.params.id}`);
  }
});

// Admin deletes item
apiRouter.delete('/admin/items/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const ok = await deleteItemFromDb(req.params.id);
    await saveAuditLogToDb({
      actorId: (req as any).adminUser?.sub || 'usr-admin-1',
      actorName: (req as any).adminUser?.name || 'Administrator',
      actorRole: 'admin',
      action: 'DELETE_ITEM',
      targetId: req.params.id,
      targetType: 'item',
      details: `Deleted listing ${req.params.id}`
    });
    res.json({ success: ok });
  } catch (err: any) {
    handleDbError(res, err, `DELETE /admin/items/${req.params.id}`);
  }
});

// Admin Settings
apiRouter.patch('/admin/settings', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const updated = await saveSystemSettingsToDb(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    handleDbError(res, err, 'PATCH /admin/settings');
  }
});

// Admin Service Availability Control
apiRouter.patch('/admin/service-settings', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const updated = await saveServiceSettingsToDb(req.body);
    res.json({ success: true, service: updated });
  } catch (err: any) {
    handleDbError(res, err, 'PATCH /admin/service-settings');
  }
});

// Admin MongoDB Atlas Status (Safe diagnostic without credentials)
apiRouter.get('/admin/mongodb/status', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const summary = await getMongoCollectionsSummary();
    res.json(summary);
  } catch (err: any) {
    res.json({ connected: false, message: 'Database diagnostic query failed', collections: [] });
  }
});

// Admin MongoDB Atlas Manual Sync Trigger
apiRouter.post('/admin/mongodb/sync', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const testResult = await testMongoConnection();
    const summary = await getMongoCollectionsSummary();
    res.json({
      success: testResult.connected,
      message: testResult.message,
      summary
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Sync failed' });
  }
});

// Audit Logs
apiRouter.get('/admin/audit-logs', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const logs = await getAuditLogsFromDb();
    res.json(logs);
  } catch (err: any) {
    handleDbError(res, err, 'GET /admin/audit-logs');
  }
});

// Reports
apiRouter.get('/admin/reports', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    const reports = await getReportsFromDb();
    res.json(reports);
  } catch (err: any) {
    handleDbError(res, err, 'GET /admin/reports');
  }
});

apiRouter.patch('/admin/reports/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const ok = await updateReportStatusInDb(req.params.id, req.body.status);
    res.json({ success: ok });
  } catch (err: any) {
    handleDbError(res, err, `PATCH /admin/reports/${req.params.id}`);
  }
});
