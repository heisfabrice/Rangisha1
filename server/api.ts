import { Router, Request, Response } from 'express';
import { db } from './db';
import { findMatchesForLostItem } from './matching';
import { calculateCommissionBreakdown } from './commission';
import { PublishedItem, ContactCase } from '../src/types/index';
import { getServiceSettingsFromDb, testMongoConnection, getMongoCollectionsSummary } from './mongodb';

export const apiRouter = Router();

// ==========================================
// 1. PUBLIC ITEMS (Approved & Published Only)
// ==========================================

apiRouter.get('/items', (req: Request, res: Response) => {
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

    // Public search strictly returns published items with public visibility
    let all = db.getPublicItems();

    // Filter by type (lost / found)
    if (type && type !== 'all') {
      all = all.filter(i => i.type === type);
    }

    // Filter by category
    if (category && category !== 'all') {
      all = all.filter(i => i.categoryId === category);
    }

    // Filter by district
    if (district && district !== 'all') {
      all = all.filter(i => i.location?.district?.toLowerCase() === (district as string).toLowerCase());
    }

    // Filter by public status
    if (status && status !== 'all') {
      all = all.filter(i => i.status === status);
    }

    // Keyword search
    if (q && typeof q === 'string' && q.trim().length > 0) {
      const term = q.trim().toLowerCase();
      all = all.filter(i => 
        i.title.toLowerCase().includes(term) ||
        i.description.toLowerCase().includes(term) ||
        i.reportId.toLowerCase().includes(term) ||
        (i.brand && i.brand.toLowerCase().includes(term)) ||
        (i.location?.district && i.location.district.toLowerCase().includes(term)) ||
        (i.location?.sector && i.location.sector.toLowerCase().includes(term))
      );
    }

    // Sorting
    if (sort === 'oldest') {
      all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'rewardHigh') {
      all.sort((a, b) => (b.rewardAmount || 0) - (a.rewardAmount || 0));
    } else {
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = all.length;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const startIdx = (pageNum - 1) * limitNum;
    const paginated = all.slice(startIdx, startIdx + limitNum);

    res.json({
      items: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/items/:id', (req: Request, res: Response) => {
  const item = db.getItemById(req.params.id);
  if (!item || !item.isPublished || item.visibility !== 'public') {
    return res.status(404).json({ error: 'Item not found or not published' });
  }

  // Redact strictly private details
  const sanitized: PublishedItem = {
    ...item,
    contactPersonPhone: undefined,
    contactPersonEmail: undefined,
    internalNotes: undefined,
    exactLocationInternal: undefined
  };

  res.json(sanitized);
});

// ==========================================
// 2. CONTACT RANGA (Citizen Intake -> Case)
// ==========================================
// When normal users contact Ranga via the Contact Admin page or form,
// this creates a PRIVATE case in Admin Dashboard (RNG-CASE-2026-XXXXXX).
// IT DOES NOT PUBLISH DIRECTLY TO THE PUBLIC WEBSITE!
apiRouter.post('/cases', (req: Request, res: Response) => {
  try {
    const { personName, phone, itemName, description, type } = req.body;
    if (!personName || !phone || !itemName) {
      return res.status(400).json({ error: 'Name, phone number, and item information are required.' });
    }

    const createdCase = db.createCase(req.body);
    res.status(201).json({
      success: true,
      caseNumber: createdCase.caseNumber,
      message: 'Amakuru yawe yakiriwe n\'ubuyobozi bwa Ranga.com. Abakozi bacu baraza kuyasuzuma no kuyemeza mbere yo kuyashyira ku rubuga.',
      case: createdCase
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User submits Lost Item Report Form (Requirement #6)
apiRouter.post('/lost-items', (req: Request, res: Response) => {
  try {
    const { itemName, categoryId, categoryName, description, personName, phone } = req.body;
    if (!itemName || !phone) {
      return res.status(400).json({ error: 'Item name and contact phone number are required.' });
    }

    const reportId = db.getNextLostReportId();
    const createdCase = db.createCase({
      ...req.body,
      type: 'lost',
      itemName,
      categoryId: categoryId || 'other',
      categoryName: categoryName || 'Other Items',
      personName: personName || 'Citizen User',
      phone,
      status: 'NEW',
      additionalInfo: `Report ID: ${reportId}. ${req.body.additionalInfo || ''}`
    });

    res.status(201).json({
      success: true,
      reportId,
      caseNumber: createdCase.caseNumber,
      message: `Raporo yawe yakiriwe neza kuri Ranga.com! Nimero ya raporo ni ${reportId}. Abakozi bacu baragenzura amakuru mbere yo kuyashyira ku rubuga.`,
      case: createdCase
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User submits Found Item Report Form (Requirement #7)
apiRouter.post('/found-items', (req: Request, res: Response) => {
  try {
    const { itemName, categoryId, categoryName, description, finderName, finderPhone, phone } = req.body;
    const contactPhone = finderPhone || phone;
    if (!itemName || !contactPhone) {
      return res.status(400).json({ error: 'Item name and finder contact phone are required.' });
    }

    const reportId = db.getNextFoundReportId();
    const createdCase = db.createCase({
      ...req.body,
      type: 'found',
      itemName,
      categoryId: categoryId || 'other',
      categoryName: categoryName || 'Other Items',
      personName: finderName || req.body.personName || 'Finder',
      phone: contactPhone,
      status: 'NEW',
      additionalInfo: `Report ID: ${reportId}. ${req.body.additionalInfo || ''}`
    });

    res.status(201).json({
      success: true,
      reportId,
      caseNumber: createdCase.caseNumber,
      message: `Murakoze cyane gutangaza icyatoraguwe! Nimero ya raporo ni ${reportId}. Ranga igiye gufasha gushaka nyiracyo.`,
      case: createdCase
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. RECOVERY REQUESTS ("RANGA" Button)
// ==========================================
apiRouter.post('/recovery-requests', (req: Request, res: Response) => {
  try {
    const { itemId, claimantName, claimantPhone, ownershipExplanation } = req.body;
    if (!itemId || !claimantName || !claimantPhone || !ownershipExplanation) {
      return res.status(400).json({
        error: 'Amazina, telefone n\'ibisobanuro by\'umutungo birakenewe (Name, phone and ownership explanation required).'
      });
    }

    const item = db.getItemById(itemId);
    const rec = db.createRecoveryRequest({
      itemId,
      itemReportId: item?.reportId || itemId,
      itemTitle: item?.title || req.body.itemTitle || 'Item',
      claimantName,
      claimantPhone,
      claimantEmail: req.body.claimantEmail,
      ownershipExplanation,
      identifyingDetails: req.body.identifyingDetails || '',
      proofDocumentUrl: req.body.proofDocumentUrl,
      preferredContactMethod: req.body.preferredContactMethod || 'whatsapp'
    });

    res.status(201).json({
      success: true,
      requestId: rec.requestId,
      message: `Icyifuzo cyawe cyo kugarura ikintu ${rec.requestId} cyakiriwe. Ubuyobozi bwa Ranga bugiye kugenzura ibimenyetso buhure nawe.`,
      recoveryRequest: rec
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/recovery-requests', (_req: Request, res: Response) => {
  res.json(db.getRecoveryRequests());
});

apiRouter.patch('/recovery-requests/:id', (req: Request, res: Response) => {
  const updated = db.updateRecoveryRequest(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Recovery request not found' });
  res.json({ success: true, recoveryRequest: updated });
});

// ==========================================
// 4. TRANSACTIONS & COMMISSIONS
// ==========================================
apiRouter.get('/transactions', (_req: Request, res: Response) => {
  res.json(db.getTransactions());
});

apiRouter.post('/transactions', (req: Request, res: Response) => {
  try {
    const txn = db.createTransaction(req.body);
    res.status(201).json({ success: true, transaction: txn });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// 3. SETTINGS & REVIEWS (Public Access)
// ==========================================
apiRouter.get('/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

apiRouter.get('/service-settings', async (_req: Request, res: Response) => {
  try {
    const remote = await getServiceSettingsFromDb().catch(() => null);
    if (remote) {
      return res.json(remote);
    }
    res.json(db.getServiceSettings());
  } catch (err) {
    console.error('[API Error] /service-settings:', err);
    res.json(db.getServiceSettings());
  }
});

apiRouter.get('/reviews', (_req: Request, res: Response) => {
  res.json(db.getReviews());
});

// Suspicious Listing Report
apiRouter.post('/reports', (req: Request, res: Response) => {
  try {
    const { itemId, reason, description, reporterName, reporterPhone } = req.body;
    const item = db.getItemById(itemId);
    const report = db.createReport({
      itemId,
      itemReportId: item ? item.reportId : itemId,
      itemTitle: item ? item.title : 'Listing',
      reason,
      description,
      reporterName,
      reporterPhone
    });
    res.status(201).json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Smart Matching (queries published items)
apiRouter.get('/matches-all', (_req: Request, res: Response) => {
  try {
    const published = db.getPublicItems();
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
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. AUTHENTICATION (RBAC & Admin Protection)
// ==========================================

// Dedicated Admin Login Endpoint
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email n\'ijambo ry\'ibanga birakenewe (Both email and password are required).' 
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const configuredAdminPassword = process.env.ADMIN_PASSWORD || '07802127041Hmm@';

  if (password !== configuredAdminPassword) {
    return res.status(401).json({
      error: "Ijambo ry'ibanga ntabwo ari ryo (Incorrect admin password). Please enter the correct admin password."
    });
  }

  const adminName = cleanEmail.includes('ishimwe') || cleanEmail.includes('fabrice')
    ? 'Fabrice Ishimwe (Admin)'
    : 'Rangisha Admin Operations';

  const adminUser = {
    id: 'usr-admin-1',
    name: adminName,
    email: cleanEmail,
    phone: '0794473504',
    role: 'super_admin' as const,
    preferredLanguage: 'rw' as const,
    isVerified: true,
    district: 'Nyarugenge',
    createdAt: new Date().toISOString()
  };

  return res.json({ user: adminUser, token: 'admin-jwt-token' });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const configuredAdminPassword = process.env.ADMIN_PASSWORD || '07802127041Hmm@';

  const isAdminEmail = 
    cleanEmail === 'admin@rangisha.rw' || 
    cleanEmail === 'admin@ranga.rw' || 
    cleanEmail.includes('admin') || 
    cleanEmail === 'ishimwefabrice856@gmail.com' ||
    cleanEmail === 'heisfabrice1@gmail.com' ||
    cleanEmail === 'rangisha';

  // Check if admin login by matching admin password OR admin email
  if (password === configuredAdminPassword) {
    const adminName = cleanEmail.includes('ishimwe') || cleanEmail.includes('fabrice')
      ? 'Fabrice Ishimwe (Admin)'
      : 'Rangisha Admin Operations';

    const admin = {
      id: 'usr-admin-1',
      name: adminName,
      email: cleanEmail,
      phone: '0794473504',
      role: 'super_admin' as const,
      preferredLanguage: 'rw' as const,
      isVerified: true,
      district: 'Nyarugenge',
      createdAt: new Date().toISOString()
    };

    return res.json({ user: admin, token: 'admin-jwt-token' });
  }

  if (isAdminEmail) {
    // Attempting to access admin without the correct admin password
    return res.status(401).json({
      error: "Ijambo ry'ibanga ntabwo ari ryo (Incorrect admin password). Please enter the correct admin password."
    });
  }

  const user = db.getUserByEmail(cleanEmail);
  if (user) {
    return res.json({ user, token: 'jwt-auth-token' });
  }

  // Create citizen user
  const newUser = {
    id: `usr-${Date.now()}`,
    name: cleanEmail.split('@')[0],
    email: cleanEmail,
    phone: '+250788000000',
    role: 'user' as const,
    preferredLanguage: 'rw' as const,
    isVerified: false,
    createdAt: new Date().toISOString()
  };
  res.json({ user: newUser, token: 'user-jwt-token' });
});

apiRouter.get('/auth/seed-users', (_req: Request, res: Response) => {
  res.json(db.getUsers());
});

// ==========================================
// 5. ADMIN CONTROL PANEL
// ==========================================

// Dashboard analytics
apiRouter.get('/admin/dashboard', (_req: Request, res: Response) => {
  res.json(db.getAnalytics());
});

// Contact Cases
apiRouter.get('/admin/cases', (req: Request, res: Response) => {
  const { status, type } = req.query;
  let cases = db.getCases();
  if (status && status !== 'all') {
    cases = cases.filter(c => c.status === status);
  }
  if (type && type !== 'all') {
    cases = cases.filter(c => c.type === type);
  }
  res.json(cases);
});

apiRouter.get('/admin/cases/:id', (req: Request, res: Response) => {
  const c = db.getCaseById(req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  res.json(c);
});

// Admin updates case analysis & status
apiRouter.patch('/admin/cases/:id/analysis', (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    verificationStatus, 
    adminNotes, 
    riskLevel, 
    authenticity, 
    decision,
    status 
  } = req.body;

  const existing = db.getCaseById(id);
  if (!existing) return res.status(404).json({ error: 'Case not found' });

  const updated = db.updateCase(id, {
    ...(status ? { status } : {}),
    adminAnalysis: {
      verificationStatus: verificationStatus || existing.adminAnalysis?.verificationStatus || 'Pending',
      adminNotes: adminNotes ?? existing.adminAnalysis?.adminNotes ?? '',
      riskLevel: riskLevel || existing.adminAnalysis?.riskLevel || 'Low',
      authenticity: authenticity || existing.adminAnalysis?.authenticity || 'Uncertain',
      decision: decision || existing.adminAnalysis?.decision || 'Request More Information',
      analyzedBy: 'admin@ranga.rw',
      analyzedAt: new Date().toISOString()
    }
  });

  res.json({ success: true, case: updated });
});

// Admin PUBLISH TO WEBSITE (from Case)
apiRouter.post('/admin/cases/:id/publish', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = db.publishCaseToItem(id, req.body.customItemData);
  if (!item) return res.status(400).json({ error: 'Failed to publish case' });
  res.status(201).json({ success: true, item });
});

// Admin All Items (Draft, Published, Archived)
apiRouter.get('/admin/items', (_req: Request, res: Response) => {
  res.json(db.getAllItems());
});

// Admin creates and immediately publishes an item (Add Item)
apiRouter.post('/admin/items', (req: Request, res: Response) => {
  try {
    const { name, title } = req.body;
    if (!name && !title) {
      return res.status(400).json({ error: 'Item name is required.' });
    }
    const item = db.createDirectPublishedItem(req.body);
    res.status(201).json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin creates Draft Item
apiRouter.post('/admin/items/draft', (req: Request, res: Response) => {
  try {
    const draft = db.createDraftItem(req.body);
    res.status(201).json(draft);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin publishes item
apiRouter.patch('/admin/items/:id/publish', (req: Request, res: Response) => {
  const published = db.publishItem(req.params.id);
  if (!published) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true, item: published });
});

// Admin unpublishes item
apiRouter.patch('/admin/items/:id/unpublish', (req: Request, res: Response) => {
  const unpublished = db.unpublishItem(req.params.id);
  if (!unpublished) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true, item: unpublished });
});

// Admin updates item
apiRouter.patch('/admin/items/:id', (req: Request, res: Response) => {
  const updated = db.updateItem(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json({ success: true, item: updated });
});

// Admin deletes item
apiRouter.delete('/admin/items/:id', (req: Request, res: Response) => {
  const ok = db.deleteItem(req.params.id);
  res.json({ success: ok });
});

// Admin Settings
apiRouter.patch('/admin/settings', (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Service Availability Control
apiRouter.patch('/admin/service-settings', async (req: Request, res: Response) => {
  try {
    const updated = db.updateServiceSettings(req.body);
    res.json({ success: true, service: updated });
  } catch (err: any) {
    console.error('[Admin API Error] /admin/service-settings:', err);
    res.status(500).json({ error: 'Failed to update service availability settings.' });
  }
});

// Admin MongoDB Atlas Status (Safe diagnostic without credentials)
apiRouter.get('/admin/mongodb/status', async (_req: Request, res: Response) => {
  try {
    const summary = await getMongoCollectionsSummary();
    res.json(summary);
  } catch (err: any) {
    res.json({ connected: false, message: 'Database fallback active', collections: [] });
  }
});

// Admin MongoDB Atlas Manual Sync Trigger
apiRouter.post('/admin/mongodb/sync', async (_req: Request, res: Response) => {
  try {
    const result = await db.syncAllToMongo();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Sync failed' });
  }
});

// Audit Logs
apiRouter.get('/admin/audit-logs', (_req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});

// Reports
apiRouter.get('/admin/reports', (_req: Request, res: Response) => {
  res.json(db.getReports());
});

apiRouter.patch('/admin/reports/:id', (req: Request, res: Response) => {
  const ok = db.updateReportStatus(req.params.id, req.body.status);
  res.json({ success: ok });
});
