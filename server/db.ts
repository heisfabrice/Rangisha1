import fs from 'fs';
import path from 'path';
import { 
  ContactCase,
  PublishedItem,
  User, 
  SystemSettings, 
  Transaction, 
  AuditLog, 
  ReportListing, 
  Review, 
  Notification,
  ItemCategory,
  CaseStatus,
  PublicItemStatus,
  RecoveryRequest,
  RwandaLocation,
  ServiceSettings
} from '../src/types/index';
import { INITIAL_CATEGORIES } from '../src/lib/categories';

export interface DatabaseState {
  users: User[];
  cases: ContactCase[];
  items: PublishedItem[];
  recoveryRequests: RecoveryRequest[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  reports: ReportListing[];
  reviews: Review[];
  notifications: Notification[];
  categories: ItemCategory[];
  settings: SystemSettings;
  counters: {
    case: number;
    lostReport: number;
    foundReport: number;
    recovery: number;
    transaction: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'ranga_store.json');

const DEFAULT_SETTINGS: SystemSettings = {
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
  contact: {
    phone: '0794473504',
    whatsapp: '0736138312',
    email: 'contact@rangisha.rw',
    officeAddress: 'KN 3 Rd, CHIC Complex, 2nd Floor, Kigali, Rwanda',
    officeHours: 'Kuwa Mbere - Kuwa Gatandatu: 8:00 AM - 6:00 PM CAT',
    instagram: 'https://instagram.com/rangisha_rw',
    facebook: 'https://facebook.com/rangisharw',
    twitter: 'https://x.com/rangisharw'
  },
  service: {
    serviceName: 'Office Service',
    available: true,
    status: 'available',
    message: 'Our physical service center is open for collection and drop-offs.',
    messageRw: 'Ibiro bya Rangisha.com bifunguye kwakira no gutanga ibyatakaye.',
    expectedAvailability: 'Monday to Saturday (8:00 AM - 6:00 PM)',
    expectedAvailabilityRw: 'Kuwa Mbere kugeza Kuwa Gatandatu (8:00 AM - 6:00 PM)',
    updatedAt: new Date().toISOString()
  },
  requireAdminApprovalBeforePublish: true,
  maintenanceMode: false
};

const SEED_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Rangisha Admin Operations',
    email: 'admin@ranga.rw',
    phone: '+250780000001',
    role: 'super_admin',
    preferredLanguage: 'rw',
    isVerified: true,
    district: 'Nyarugenge',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 'usr-citizen-1',
    name: 'Citizen Demo',
    email: 'citizen.demo@example.com',
    phone: '+250780000002',
    role: 'user',
    preferredLanguage: 'rw',
    isVerified: true,
    district: 'Gasabo',
    createdAt: '2026-02-14T09:30:00.000Z'
  },
  {
    id: 'usr-finder-1',
    name: 'Finder Demo',
    email: 'finder.demo@example.com',
    phone: '+250780000003',
    role: 'user',
    preferredLanguage: 'rw',
    isVerified: true,
    district: 'Kicukiro',
    createdAt: '2026-02-15T11:20:00.000Z'
  }
];

const SEED_CASES: ContactCase[] = [
  {
    id: 'case-1',
    caseNumber: 'RNG-CASE-2026-000001',
    personName: 'Alice Uwase',
    phone: '+250788556677',
    whatsapp: '250788556677',
    email: 'alice.uwase@gmail.com',
    type: 'lost',
    itemName: 'Indangamuntu ya Mugisha Jean Claude & Carte Jaune ya Moto',
    categoryId: 'id_docs',
    categoryName: 'National ID Documents',
    description: 'Nabuze ikofi y\'umukara irimo Indangamuntu nimero 1199580012345678 na Carte Jaune ya moto TVS hafi ya Stade Amahoro.',
    location: {
      province: 'Kigali City',
      district: 'Gasabo',
      sector: 'Remera',
      landmark: 'Kuri Stade Amahoro hafi ya Petit Stade'
    },
    date: '2026-03-28',
    approximateTime: '14:30',
    photos: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'],
    brand: 'N/A',
    model: 'Document',
    color: 'Umukara (Black)',
    serialNumber: '1199580012345678',
    additionalInfo: 'Ikofi ifite akamenyetso k\'urufunguzo ruto.',
    rewardInfo: { offeredOrExpected: true, amount: 25000 },
    status: 'PUBLISHED',
    publishedItemId: 'item-lost-1',
    adminAnalysis: {
      verificationStatus: 'Verified',
      adminNotes: 'Contacted claimant via WhatsApp. Phone and NIDA match. Approved for public listing.',
      riskLevel: 'Low',
      authenticity: 'Confirmed',
      decision: 'Publish',
      analyzedBy: 'admin@ranga.rw',
      analyzedAt: '2026-03-28T16:00:00.000Z'
    },
    createdAt: '2026-03-28T15:00:00.000Z',
    updatedAt: '2026-03-28T16:30:00.000Z'
  },
  {
    id: 'case-2',
    caseNumber: 'RNG-CASE-2026-000002',
    personName: 'Patrick Nshimiyimana',
    phone: '+250789998877',
    whatsapp: '250789998877',
    email: 'patrick.nshimiye@gmail.com',
    type: 'lost',
    itemName: 'Apple MacBook Pro 14" Space Gray',
    categoryId: 'laptops',
    categoryName: 'Laptops',
    description: 'Nsize mudasobwa mu gikapu cy\'umukara muri taxi voiture iva Kacyiru igana Kigali Heights.',
    location: {
      province: 'Kigali City',
      district: 'Gasabo',
      sector: 'Kacyiru',
      landmark: 'Ku Isomero ry\'Igihugu'
    },
    date: '2026-03-29',
    photos: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
    brand: 'Apple',
    model: 'MacBook Pro 14',
    color: 'Space Gray',
    serialNumber: 'C02G45T0MD6R',
    rewardInfo: { offeredOrExpected: true, amount: 100000 },
    status: 'PUBLISHED',
    publishedItemId: 'item-lost-2',
    adminAnalysis: {
      verificationStatus: 'Verified',
      adminNotes: 'Serial number verified against original purchase invoice. Safe to publish.',
      riskLevel: 'Low',
      authenticity: 'Confirmed',
      decision: 'Publish',
      analyzedBy: 'admin@ranga.rw',
      analyzedAt: '2026-03-29T20:00:00.000Z'
    },
    createdAt: '2026-03-29T19:30:00.000Z',
    updatedAt: '2026-03-29T20:15:00.000Z'
  },
  {
    id: 'case-3',
    caseNumber: 'RNG-CASE-2026-000003',
    personName: 'Jean de Dieu Mugisha',
    phone: '+250783112233',
    whatsapp: '250783112233',
    email: 'mugisha.jean@yahoo.com',
    type: 'found',
    itemName: 'Samsung Galaxy A54 ifite cover y\'umutuku',
    categoryId: 'phones',
    categoryName: 'Phones',
    description: 'Natoraguye telefone mu modoka ya KBS yerekezaga i Kanombe ku mugoroba.',
    location: {
      province: 'Kigali City',
      district: 'Kicukiro',
      sector: 'Kanombe',
      landmark: 'Ku kibuga cy\'indege cya Kigali'
    },
    date: '2026-03-30',
    photos: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80'],
    brand: 'Samsung',
    model: 'Galaxy A54',
    color: 'Black / Red Case',
    rewardInfo: { offeredOrExpected: true },
    status: 'PUBLISHED',
    publishedItemId: 'item-found-1',
    adminAnalysis: {
      verificationStatus: 'Verified',
      adminNotes: 'Finder phone verified. Sensitive finder contact hidden as required. Approved public listing.',
      riskLevel: 'Low',
      authenticity: 'Confirmed',
      decision: 'Publish',
      analyzedBy: 'admin@ranga.rw',
      analyzedAt: '2026-03-30T19:30:00.000Z'
    },
    createdAt: '2026-03-30T18:45:00.000Z',
    updatedAt: '2026-03-30T19:40:00.000Z'
  },
  {
    id: 'case-4',
    caseNumber: 'RNG-CASE-2026-000004',
    personName: 'Eric Manzi',
    phone: '+250782001122',
    type: 'found',
    itemName: 'Permis de Conduire ya Uwimana Solange',
    categoryId: 'driving_license',
    categoryName: 'Driving Licenses',
    description: 'Natoraguye uruhushya rwo gutwara ibinyabiziga kuri SP Nyabugogo.',
    location: {
      province: 'Kigali City',
      district: 'Nyarugenge',
      sector: 'Muhima',
      landmark: 'Kuri SP Nyabugogo hafi ya Gare'
    },
    date: '2026-03-31',
    photos: ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'],
    status: 'UNDER_REVIEW',
    adminAnalysis: {
      verificationStatus: 'Pending',
      adminNotes: 'Calling traffic police liaison to cross-check record.',
      riskLevel: 'Low',
      authenticity: 'Uncertain',
      decision: 'Request More Information'
    },
    createdAt: '2026-03-31T09:00:00.000Z',
    updatedAt: '2026-03-31T09:30:00.000Z'
  }
];

const SEED_PUBLISHED_ITEMS: PublishedItem[] = [
  {
    id: 'item-lost-1',
    reportId: 'RNG-LOST-2026-000023',
    caseId: 'case-1',
    type: 'lost',
    title: 'Indangamuntu ya Mugisha Jean Claude & Carte Jaune',
    categoryId: 'id_docs',
    categoryName: 'National ID Documents',
    description: 'Nabuze ikofi y\'umukara irimo Indangamuntu na Carte Jaune ya moto TVS hafi ya Stade Amahoro.',
    brand: 'N/A',
    model: 'Document',
    color: 'Umukara (Black)',
    serialNumberMasked: '11995800****',
    location: {
      province: 'Kigali City',
      district: 'Gasabo',
      sector: 'Remera',
      landmark: 'Kuri Stade Amahoro'
    },
    exactLocationInternal: 'Petit Stade entrance, row 4',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'],
    date: '2026-03-28',
    rewardText: '25,000 RWF (Contact Ranga for details)',
    rewardAmount: 25000,
    isPublished: true,
    visibility: 'public',
    status: 'searching',
    contactPersonName: 'Alice Uwase',
    contactPersonPhone: '+250788556677',
    contactPersonEmail: 'alice.uwase@gmail.com',
    createdAt: '2026-03-28T16:00:00.000Z',
    updatedAt: '2026-03-28T16:00:00.000Z'
  },
  {
    id: 'item-lost-2',
    reportId: 'RNG-LOST-2026-000024',
    caseId: 'case-2',
    type: 'lost',
    title: 'Apple MacBook Pro 14" Space Gray',
    categoryId: 'laptops',
    categoryName: 'Laptops',
    description: 'Mudasobwa yasizwe mu modoka y\'abagenzi yanyuze Kacyiru na Kimihurura.',
    brand: 'Apple',
    model: 'MacBook Pro 14',
    color: 'Space Gray',
    serialNumberMasked: 'C02G45T0****',
    location: {
      province: 'Kigali City',
      district: 'Gasabo',
      sector: 'Kacyiru',
      landmark: 'Ku Isomero ry\'Igihugu'
    },
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
    date: '2026-03-29',
    rewardText: '100,000 RWF (Contact Ranga for details)',
    rewardAmount: 100000,
    isPublished: true,
    visibility: 'public',
    status: 'possible_match',
    contactPersonName: 'Patrick Nshimiyimana',
    contactPersonPhone: '+250789998877',
    contactPersonEmail: 'patrick.nshimiye@gmail.com',
    createdAt: '2026-03-29T20:00:00.000Z',
    updatedAt: '2026-03-29T20:00:00.000Z'
  },
  {
    id: 'item-found-1',
    reportId: 'RNG-FOUND-2026-000034',
    caseId: 'case-3',
    type: 'found',
    title: 'Samsung Galaxy A54 ifite cover y\'umutuku',
    categoryId: 'phones',
    categoryName: 'Phones',
    description: 'Yatoraguwe mu modoka ya KBS yerekezaga i Kanombe ku mugoroba.',
    brand: 'Samsung',
    model: 'Galaxy A54',
    color: 'Black / Red Case',
    location: {
      province: 'Kigali City',
      district: 'Kicukiro',
      sector: 'Kanombe',
      landmark: 'Ku kibuga cy\'indege cya Kigali'
    },
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80'],
    date: '2026-03-30',
    rewardText: 'Contact Ranga Admin for recovery',
    isPublished: true,
    visibility: 'public',
    status: 'found',
    contactPersonName: 'Jean de Dieu Mugisha',
    contactPersonPhone: '+250783112233',
    contactPersonEmail: 'mugisha.jean@yahoo.com',
    createdAt: '2026-03-30T19:30:00.000Z',
    updatedAt: '2026-03-30T19:30:00.000Z'
  },
  {
    id: 'item-found-draft-1',
    reportId: 'RNG-FOUND-2026-000035',
    type: 'found',
    title: 'Imfunguzo za Toyota RAV4 Smart Key',
    categoryId: 'keys',
    categoryName: 'Keys',
    description: 'Imfunguzo z\'imodoka zifite akuma ka remote n\'urufunguzo rwo mu nzu.',
    brand: 'Toyota',
    model: 'Smart Key',
    color: 'Black / Silver',
    location: {
      province: 'Northern Province',
      district: 'Musanze',
      sector: 'Muhoza'
    },
    images: ['https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80'],
    date: '2026-03-31',
    isPublished: false,
    visibility: 'draft',
    status: 'searching',
    createdAt: '2026-03-31T11:00:00.000Z',
    updatedAt: '2026-03-31T11:00:00.000Z'
  },
  {
    id: 'item-missing-1',
    reportId: 'RNG-MIS-2026-000001',
    type: 'missing_person',
    title: 'Mugisha David (Imyaka 7) — Yaburiye i Kanombe',
    categoryId: 'people',
    categoryName: 'Abantu Babuze (Missing People)',
    description: 'Umwana witwa Mugisha David w\'imyaka 7 yabuze tariki ya 01/04/2026 avuye ku ishuri EP Saint Vincent i Kanombe. Yari yambaye umupira w\'umuhondo n\'ipantaro y\'ubururu. Nta rurimi rundi avuga uretse Ikinyarwanda. Turasaba uwaba yamubona guhita ahamagara numero ya Ranga.com cyangwa Polisi.',
    location: {
      province: 'Kigali City',
      district: 'Kicukiro',
      sector: 'Kanombe',
      landmark: 'Hafi y\'Ishuri EP Saint Vincent'
    },
    images: ['https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=600&q=80'],
    date: '2026-04-01',
    isPublished: true,
    visibility: 'public',
    status: 'searching',
    isUrgent: true,
    personDetails: {
      fullName: 'Mugisha David',
      age: 7,
      ageGroup: 'child',
      gender: 'male',
      lastSeenLocation: 'Kanombe, Kicukiro, Kigali',
      lastSeenDate: '2026-04-01',
      clothingDescription: 'Umupira w\'umuhondo, ipantaro y\'ubururu y\'ishuri, inkweto z\'umukara',
      physicalDescription: 'Mugufi, uruhu rwirabura gato, afite akamenyetso k\'akabuto ku gutwi kw\'iburyo',
      policeCaseNumber: 'RIB/KGL/KCK/2026/04-012',
      emergencyContactHotline: '+250788450120',
      isUrgent: true,
      relationshipToReporter: 'Umubyeyi (Nyina)'
    },
    contactPersonName: 'Chantal Mukamana',
    contactPersonPhone: '+250788112233',
    createdAt: '2026-04-01T14:00:00.000Z',
    updatedAt: '2026-04-01T14:00:00.000Z'
  },
  {
    id: 'item-missing-2',
    reportId: 'RNG-MIS-2026-000002',
    type: 'missing_person',
    title: 'Gakuba Francois (Imyaka 72) — Yaburiye i Huye',
    categoryId: 'people',
    categoryName: 'Abantu Babuze (Missing People)',
    description: 'Umusaza witwa Gakuba Francois w\'imyaka 72 arwaye indwara yo kwibagirwa (Memory Loss / Dementia). Yabuze avuye mu rugo mu Murenge wa Ngoma, Akarere ka Huye. Ntiyibuka neza izina rye ryose cyangwa aho ataha. Akeneye ubufasha bwihutirwa.',
    location: {
      province: 'Southern Province',
      district: 'Huye',
      sector: 'Ngoma',
      landmark: 'Hafi ya Kaminuza y\'u Rwanda (UR Huye Campus)'
    },
    images: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80'],
    date: '2026-04-02',
    isPublished: true,
    visibility: 'public',
    status: 'searching',
    isUrgent: true,
    personDetails: {
      fullName: 'Gakuba Francois',
      age: 72,
      ageGroup: 'elderly',
      gender: 'male',
      lastSeenLocation: 'Ngoma, Huye, Southern Province',
      lastSeenDate: '2026-04-02',
      clothingDescription: 'Ikoti ry\'ikigina (brown jacket), ipantaro y\'umukara, ingofero y\'ubwoya',
      physicalDescription: 'Muremure, imvi nyinshi, agenda yicumba inkoni',
      healthConditions: 'Arwaye indwara yo kwibagirwa (Dementia), akeneye imiti ya buri munsi y\'umuvuduko w\'amaraso',
      policeCaseNumber: 'RIB/STH/HYE/2026/04-008',
      emergencyContactHotline: '+250788450120',
      isUrgent: true,
      relationshipToReporter: 'Umuhungu we (Emmanuel Gakuba)'
    },
    contactPersonName: 'Emmanuel Gakuba',
    contactPersonPhone: '+250788667788',
    createdAt: '2026-04-02T10:30:00.000Z',
    updatedAt: '2026-04-02T10:30:00.000Z'
  },
  {
    id: 'item-found-person-1',
    reportId: 'RNG-FNDP-2026-000001',
    type: 'found_person',
    title: 'Umwana w\'umukobwa (hafi imyaka 5) yatoraguwe muri Gare ya Nyabugogo',
    categoryId: 'people',
    categoryName: 'Abatoraguwe (Found People)',
    description: 'Umwana w\'umukobwa watoraguwe muri Gare ya Nyabugogo ari kurira avuga ko yitwa Keza ariko atazi umudugudu n\'amazina y\'ababyeyi. Ubu ari mu maboko meza ya Police Station ya Muhima / Isange One Stop Center.',
    location: {
      province: 'Kigali City',
      district: 'Nyarugenge',
      sector: 'Muhima',
      landmark: 'Gare ya Nyabugogo'
    },
    images: ['https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80'],
    date: '2026-04-03',
    isPublished: true,
    visibility: 'public',
    status: 'found',
    personDetails: {
      fullName: 'Keza (Amazina y\'ukuri ntarizwi)',
      age: 5,
      ageGroup: 'child',
      gender: 'female',
      foundAtLocation: 'Gare ya Nyabugogo, Kigali',
      currentLocationOrShelter: 'Isange One Stop Center / Police Station Muhima',
      clothingDescription: 'Ikanzu y\'iroza ifite amashusho y\'inyoni, inkweto z\'umweru',
      physicalDescription: 'Umukobwa muto, umusatsi usutse ibisate bito',
      emergencyContactHotline: '+250788450120'
    },
    createdAt: '2026-04-03T16:00:00.000Z',
    updatedAt: '2026-04-03T16:00:00.000Z'
  },
  {
    id: 'item-found-person-2',
    reportId: 'RNG-FNDP-2026-000002',
    type: 'found_person',
    title: 'Umukecuru utibuka umwirondoro watoraguwe i Remera',
    categoryId: 'people',
    categoryName: 'Abatoraguwe (Found People)',
    description: 'Umukecuru ufite hafi imyaka 68 watoraguwe i Remera hafi ya Prince House ayobye. Avuga ururimi rw\'Ikinyarwanda n\'Igiswahili gake ariko atibuka umuryango we. Ubu ari ku Biro by\'Umurenge wa Remera.',
    location: {
      province: 'Kigali City',
      district: 'Gasabo',
      sector: 'Remera',
      landmark: 'Hafi ya Prince House Remera'
    },
    images: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80'],
    date: '2026-04-03',
    isPublished: true,
    visibility: 'public',
    status: 'found',
    personDetails: {
      fullName: 'Mukecuru (Amazina ntariboneka)',
      age: 68,
      ageGroup: 'elderly',
      gender: 'female',
      foundAtLocation: 'Remera, Kigali',
      currentLocationOrShelter: 'Ibiro by\'Umurenge wa Remera / Urwego rw\'Umutekano',
      clothingDescription: 'Igitenge cy\'amabara y\'umuhondo n\'icyatsi, igitambaro mu mutwe cy\'umukara',
      emergencyContactHotline: '+250788450120'
    },
    createdAt: '2026-04-03T17:30:00.000Z',
    updatedAt: '2026-04-03T17:30:00.000Z'
  }
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    actorId: 'usr-admin-1',
    actorName: 'Ranga Admin Operations',
    actorEmail: 'admin@ranga.rw',
    actorRole: 'admin',
    action: 'PUBLISH_ITEM',
    targetId: 'item-lost-1',
    targetType: 'item',
    previousStatus: 'DRAFT',
    newStatus: 'PUBLISHED',
    details: 'Admin verified and published Lost ID RNG-LOST-2026-000023 to public website.',
    timestamp: '2026-03-28T16:00:00.000Z'
  },
  {
    id: 'log-2',
    actorId: 'usr-admin-1',
    actorName: 'Ranga Admin Operations',
    actorEmail: 'admin@ranga.rw',
    actorRole: 'admin',
    action: 'PUBLISH_ITEM',
    targetId: 'item-found-1',
    targetType: 'item',
    previousStatus: 'DRAFT',
    newStatus: 'PUBLISHED',
    details: 'Admin published Found Phone RNG-FOUND-2026-000034 to public website.',
    timestamp: '2026-03-30T19:30:00.000Z'
  }
];

const SEED_RECOVERY_REQUESTS: RecoveryRequest[] = [
  {
    id: 'rec-1',
    requestId: 'RNG-REC-2026-000001',
    itemId: 'item-found-1',
    itemReportId: 'RNG-FOUND-2026-000034',
    itemTitle: 'Samsung Galaxy A54 5G (Awesome Black)',
    claimantName: 'Kagina Patrick',
    claimantPhone: '+250788998877',
    claimantEmail: 'patrick.kagina@gmail.com',
    ownershipExplanation: 'Niyo telefone yanjye naguye muri Taxi Voiture i Remera. Ifite wallpaper y\'umuryango wanjye kandi PIN code ndayizi.',
    identifyingDetails: 'Aka cover k\'inyuma kanditseho "P.K", ifite akantu k\'ikirahure katarura ku ruhande rw\'ibumoso.',
    preferredContactMethod: 'whatsapp',
    status: 'pending',
    adminNotes: 'Contacted claimant; confirmed lock screen details match phone in office safe.',
    createdAt: '2026-04-01T10:15:00.000Z',
    updatedAt: '2026-04-01T10:30:00.000Z'
  }
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1',
    transactionRef: 'RNG-TXN-2026-000101',
    caseId: 'case-1',
    itemReportId: 'RNG-LOST-2026-000023',
    itemTitle: 'Indangamuntu & Carte Jaune',
    totalAmount: 25000,
    rangaCommission: 2500,
    finderPayout: 22500,
    currency: 'RWF',
    paymentMethod: 'momo',
    status: 'paid',
    payerName: 'Alice Uwase',
    payerPhone: '+250788556677',
    createdAt: '2026-03-29T14:00:00.000Z'
  }
];

class RangaDatabase {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadInitialState();
  }


  private loadInitialState(): DatabaseState {
    const initial: DatabaseState = {
      users: SEED_USERS,
      cases: SEED_CASES,
      items: SEED_PUBLISHED_ITEMS,
      recoveryRequests: SEED_RECOVERY_REQUESTS,
      transactions: SEED_TRANSACTIONS,
      auditLogs: SEED_AUDIT_LOGS,
      reports: [],
      reviews: [
        {
          id: 'rev-1',
          authorName: 'Jean Claude M.',
          location: 'Gasabo, Kigali',
          rating: 5,
          itemTitle: 'Indangamuntu & Carte Jaune',
          story: 'Ranga.com yamfashije kugarura ibyangombwa byanjye nta guhura n\'abashukanyi. Ubuyobozi bwa Ranga bwagenzuye byose mu mutekano!',
          date: '2026-03-29',
          verified: true
        },
        {
          id: 'rev-2',
          authorName: 'Keza Diane',
          location: 'Kicukiro, Kigali',
          rating: 5,
          itemTitle: 'iPhone 13 na Mudasobwa',
          story: 'Nandikiye admin kuri WhatsApp, asuzuma ikibazo cyanjye, mu masaha 4 gusa nari mbonye ibintu byanjye byose.',
          date: '2026-03-21',
          verified: true
        }
      ],
      notifications: [],
      categories: INITIAL_CATEGORIES,
      settings: DEFAULT_SETTINGS,
      counters: {
        case: 4,
        lostReport: 24,
        foundReport: 35,
        recovery: 1,
        transaction: 101
      }
    };

    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items) && Array.isArray(parsed.cases)) {
          const existingIds = new Set(parsed.items.map((i: any) => i.id));
          const mergedItems = [...parsed.items];
          for (const s of SEED_PUBLISHED_ITEMS) {
            if (!existingIds.has(s.id)) {
              mergedItems.push(s);
            }
          }
          const loadedState: DatabaseState = {
            ...initial,
            ...parsed,
            items: mergedItems,
            settings: { ...initial.settings, ...(parsed.settings || {}) }
          };
          this.persist(loadedState);
          return loadedState;
        }
      }
    } catch (err) {
      console.warn('Could not read state file, initializing fresh store:', err);
    }

    this.persist(initial);
    return initial;
  }

  private persist(state: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private save() {
    this.persist(this.state);
  }

  // --- Sequential IDs ---
  getNextCaseNumber(): string {
    this.state.counters.case++;
    this.save();
    return `RNG-CASE-2026-${String(this.state.counters.case).padStart(6, '0')}`;
  }

  getNextLostReportId(): string {
    this.state.counters.lostReport++;
    this.save();
    return `RNG-LOST-2026-${String(this.state.counters.lostReport).padStart(6, '0')}`;
  }

  getNextFoundReportId(): string {
    this.state.counters.foundReport++;
    this.save();
    return `RNG-FOUND-2026-${String(this.state.counters.foundReport).padStart(6, '0')}`;
  }

  getNextTransactionRef(): string {
    this.state.counters.transaction++;
    this.save();
    return `RNG-TXN-2026-${String(this.state.counters.transaction).padStart(6, '0')}`;
  }

  getNextRecoveryRequestId(): string {
    if (!this.state.counters.recovery) this.state.counters.recovery = 0;
    this.state.counters.recovery++;
    this.save();
    return `RNG-REC-2026-${String(this.state.counters.recovery).padStart(6, '0')}`;
  }

  // --- Recovery Requests ("RANGA" Button) ---
  getRecoveryRequests(): RecoveryRequest[] {
    return (this.state.recoveryRequests || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getRecoveryRequestById(id: string): RecoveryRequest | undefined {
    return (this.state.recoveryRequests || []).find(r => r.id === id || r.requestId === id);
  }

  createRecoveryRequest(data: Partial<RecoveryRequest>): RecoveryRequest {
    const requestId = this.getNextRecoveryRequestId();
    const newReq: RecoveryRequest = {
      id: `rec-${Date.now()}`,
      requestId,
      itemId: data.itemId || '',
      itemReportId: data.itemReportId || '',
      itemTitle: data.itemTitle || 'Item',
      claimantName: data.claimantName || 'Claimant',
      claimantPhone: data.claimantPhone || '',
      claimantEmail: data.claimantEmail,
      ownershipExplanation: data.ownershipExplanation || '',
      identifyingDetails: data.identifyingDetails || '',
      proofDocumentUrl: data.proofDocumentUrl,
      preferredContactMethod: data.preferredContactMethod || 'whatsapp',
      status: 'pending',
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.state.recoveryRequests) {
      this.state.recoveryRequests = [];
    }
    this.state.recoveryRequests.unshift(newReq);

    // Also record audit log
    this.addAuditLog({
      actorId: 'usr-citizen',
      actorName: newReq.claimantName,
      actorRole: 'user',
      action: 'SUBMIT_RECOVERY_CLAIM',
      targetId: newReq.id,
      targetType: 'case',
      details: `Citizen submitted recovery claim ${newReq.requestId} for item ${newReq.itemReportId}.`
    });

    this.save();
    return newReq;
  }

  updateRecoveryRequest(id: string, updates: Partial<RecoveryRequest>): RecoveryRequest | null {
    const req = (this.state.recoveryRequests || []).find(r => r.id === id || r.requestId === id);
    if (!req) return null;

    Object.assign(req, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return req;
  }

  // --- Transactions ---
  getTransactions(): Transaction[] {
    return (this.state.transactions || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createTransaction(data: Partial<Transaction>): Transaction {
    const ref = this.getNextTransactionRef();
    const txn: Transaction = {
      id: `txn-${Date.now()}`,
      transactionRef: ref,
      caseId: data.caseId,
      itemReportId: data.itemReportId || '',
      itemTitle: data.itemTitle || 'Item',
      totalAmount: data.totalAmount || 0,
      rangaCommission: data.rangaCommission || 0,
      finderPayout: data.finderPayout || 0,
      currency: data.currency || 'RWF',
      paymentMethod: data.paymentMethod || 'momo',
      status: data.status || 'pending',
      payerName: data.payerName || 'Citizen',
      payerPhone: data.payerPhone,
      createdAt: new Date().toISOString()
    };

    if (!this.state.transactions) {
      this.state.transactions = [];
    }
    this.state.transactions.unshift(txn);
    this.save();
    return txn;
  }

  // --- Users ---
  getUsers(): User[] {
    return this.state.users;
  }

  getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // --- Cases (Contact Requests) ---
  getCases(): ContactCase[] {
    return [...this.state.cases].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getCaseById(id: string): ContactCase | undefined {
    return this.state.cases.find(c => c.id === id || c.caseNumber === id);
  }

  createCase(caseData: Partial<ContactCase>): ContactCase {
    const caseNumber = this.getNextCaseNumber();
    const newCase: ContactCase = {
      id: `case-${Date.now()}`,
      caseNumber,
      personName: caseData.personName || 'Citizen User',
      phone: caseData.phone || '',
      whatsapp: caseData.whatsapp,
      email: caseData.email,
      type: caseData.type || 'lost',
      itemName: caseData.itemName || 'Item Description',
      categoryId: caseData.categoryId || 'other',
      categoryName: caseData.categoryName || 'Other Items',
      description: caseData.description || '',
      location: caseData.location || { province: 'Kigali City', district: 'Gasabo' },
      date: caseData.date || new Date().toISOString().split('T')[0],
      approximateTime: caseData.approximateTime,
      photos: caseData.photos && caseData.photos.length > 0 ? caseData.photos : [
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'
      ],
      brand: caseData.brand,
      model: caseData.model,
      color: caseData.color,
      serialNumber: caseData.serialNumber,
      additionalInfo: caseData.additionalInfo,
      rewardInfo: caseData.rewardInfo,
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

    this.state.cases.unshift(newCase);
    this.save();

    this.addAuditLog({
      actorId: 'usr-intake',
      actorName: newCase.personName,
      actorRole: 'user',
      action: 'NEW_CONTACT_CASE',
      targetId: newCase.id,
      targetType: 'case',
      newStatus: 'NEW',
      details: `Citizen created contact case ${newCase.caseNumber} for ${newCase.type} ${newCase.itemName}`
    });

    return newCase;
  }

  updateCase(id: string, updates: Partial<ContactCase>, actorName: string = 'Admin'): ContactCase | undefined {
    const idx = this.state.cases.findIndex(c => c.id === id || c.caseNumber === id);
    if (idx === -1) return undefined;
    
    const prevStatus = this.state.cases[idx].status;
    this.state.cases[idx] = {
      ...this.state.cases[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();

    if (updates.status && updates.status !== prevStatus) {
      this.addAuditLog({
        actorId: 'usr-admin-1',
        actorName,
        actorRole: 'admin',
        action: 'UPDATE_CASE_STATUS',
        targetId: id,
        targetType: 'case',
        previousStatus: prevStatus,
        newStatus: updates.status,
        details: `Updated case ${this.state.cases[idx].caseNumber} status from ${prevStatus} to ${updates.status}`
      });
    }

    return this.state.cases[idx];
  }

  // --- Published Items & Draft System (Requirement #9 & #10) ---
  
  // Public search only queries: isPublished = true and visibility = 'public'
  getPublicItems(): PublishedItem[] {
    return this.state.items
      .filter(i => i.isPublished === true && i.visibility === 'public')
      .map(item => ({
        ...item,
        // Strip sensitive internal fields completely from public responses
        contactPersonPhone: undefined,
        contactPersonEmail: undefined,
        internalNotes: undefined,
        exactLocationInternal: undefined
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Admin access to all items (drafts, published, archived)
  getAllItems(): PublishedItem[] {
    return [...this.state.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getItemById(id: string): PublishedItem | undefined {
    return this.state.items.find(i => i.id === id || i.reportId === id);
  }

  // Create Draft Item (Admin Only)
  createDraftItem(data: Partial<PublishedItem>, adminEmail: string = 'admin@ranga.rw'): PublishedItem {
    const reportId = data.type === 'found' ? this.getNextFoundReportId() : this.getNextLostReportId();
    
    const newItem: PublishedItem = {
      id: `item-${Date.now()}`,
      reportId,
      caseId: data.caseId,
      type: data.type || 'lost',
      title: data.title || 'Untitled Item',
      categoryId: data.categoryId || 'other',
      categoryName: data.categoryName || 'Other',
      description: data.description || '',
      brand: data.brand,
      model: data.model,
      color: data.color,
      serialNumberMasked: data.serialNumberMasked,
      location: data.location || { province: 'Kigali City', district: 'Gasabo' },
      exactLocationInternal: data.exactLocationInternal,
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'
      ],
      date: data.date || new Date().toISOString().split('T')[0],
      rewardText: data.rewardText || (data.rewardAmount ? `${data.rewardAmount.toLocaleString()} RWF` : 'Contact Ranga for details'),
      rewardAmount: data.rewardAmount || 0,
      isPublished: false,
      visibility: 'draft',
      status: data.type === 'found' ? 'found' : 'searching',
      internalNotes: data.internalNotes,
      contactPersonName: data.contactPersonName,
      contactPersonPhone: data.contactPersonPhone,
      contactPersonEmail: data.contactPersonEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.items.unshift(newItem);
    this.save();

    this.addAuditLog({
      actorId: 'usr-admin-1',
      actorName: 'Admin',
      actorEmail: adminEmail,
      actorRole: 'admin',
      action: 'CREATE_DRAFT_ITEM',
      targetId: newItem.id,
      targetType: 'item',
      newStatus: 'DRAFT',
      details: `Created draft item ${newItem.reportId} for ${newItem.title}`
    });

    return newItem;
  }

  // Create & Immediately Publish Item (Simplified Admin Panel)
  createDirectPublishedItem(data: {
    name?: string;
    title?: string;
    location?: string | { province: string; district: string; sector?: string; cell?: string };
    description?: string;
    date?: string;
    image?: string;
    images?: string[];
    type?: 'lost' | 'found' | 'missing_person' | 'found_person';
    categoryId?: string;
    categoryName?: string;
    personDetails?: any;
    rewardText?: string;
    rewardAmount?: number;
  }, adminEmail: string = 'admin@ranga.rw'): PublishedItem {
    const title = (data.name || data.title || '').trim() || 'Untitled Item';
    const itemType = data.type || 'lost';
    
    let reportId: string;
    if (itemType === 'missing_person') {
      this.state.counters.case++;
      reportId = `RNG-MIS-2026-${String(this.state.counters.case + 100).padStart(6, '0')}`;
    } else if (itemType === 'found_person') {
      this.state.counters.case++;
      reportId = `RNG-PER-2026-${String(this.state.counters.case + 200).padStart(6, '0')}`;
    } else if (itemType === 'found') {
      reportId = this.getNextFoundReportId();
    } else {
      reportId = this.getNextLostReportId();
    }
    
    let locationObj: RwandaLocation;
    if (typeof data.location === 'string') {
      locationObj = {
        province: 'Rwanda',
        district: data.location.trim() || 'Kigali'
      };
    } else if (data.location && typeof data.location === 'object') {
      locationObj = data.location as RwandaLocation;
    } else {
      locationObj = { province: 'Kigali City', district: 'Kicukiro, Kigali' };
    }

    let imagesList: string[] = [];
    if (Array.isArray(data.images) && data.images.length > 0) {
      imagesList = data.images.filter(Boolean);
    } else if (data.image && typeof data.image === 'string' && data.image.trim()) {
      imagesList = [data.image.trim()];
    }

    const defaultCatId = (itemType === 'missing_person' || itemType === 'found_person') ? 'people' : (data.categoryId || 'other');
    const defaultCatName = (itemType === 'missing_person' || itemType === 'found_person') ? 'Abantu (People)' : (data.categoryName || 'General');

    const newItem: PublishedItem = {
      id: `item-${Date.now()}`,
      reportId,
      type: itemType,
      title,
      categoryId: defaultCatId,
      categoryName: defaultCatName,
      description: data.description || '',
      location: locationObj,
      images: imagesList,
      date: data.date || new Date().toISOString().split('T')[0],
      rewardText: data.rewardText || 'Contact Ranga.com for details',
      rewardAmount: data.rewardAmount || 0,
      isPublished: true,
      visibility: 'public',
      status: itemType === 'found' || itemType === 'found_person' ? 'found' : 'searching',
      personDetails: data.personDetails,
      isUrgent: itemType === 'missing_person',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.items.unshift(newItem);
    this.save();

    this.addAuditLog({
      actorId: 'usr-admin-1',
      actorName: 'Admin',
      actorEmail: adminEmail,
      actorRole: 'admin',
      action: 'PUBLISH_ITEM',
      targetId: newItem.id,
      targetType: 'item',
      newStatus: 'PUBLISHED',
      details: `Admin created and immediately published item ${newItem.reportId}: ${newItem.title}`
    });

    return newItem;
  }

  // Publish to Website (Requirement #9)
  publishItem(id: string, adminEmail: string = 'admin@ranga.rw'): PublishedItem | undefined {
    const idx = this.state.items.findIndex(i => i.id === id || i.reportId === id);
    if (idx === -1) return undefined;

    const prevVis = this.state.items[idx].visibility;
    this.state.items[idx].isPublished = true;
    this.state.items[idx].visibility = 'public';
    this.state.items[idx].updatedAt = new Date().toISOString();

    // If linked to a case, update case status to PUBLISHED
    if (this.state.items[idx].caseId) {
      this.updateCase(this.state.items[idx].caseId!, { 
        status: 'PUBLISHED',
        publishedItemId: this.state.items[idx].id 
      });
    }

    this.save();

    this.addAuditLog({
      actorId: 'usr-admin-1',
      actorName: 'Admin',
      actorEmail: adminEmail,
      actorRole: 'admin',
      action: 'PUBLISH_ITEM',
      targetId: id,
      targetType: 'item',
      previousStatus: prevVis.toUpperCase(),
      newStatus: 'PUBLISHED',
      details: `Published item ${this.state.items[idx].reportId} to public website.`
    });

    return this.state.items[idx];
  }

  // Unpublish / Archive Item
  unpublishItem(id: string, adminEmail: string = 'admin@ranga.rw'): PublishedItem | undefined {
    const idx = this.state.items.findIndex(i => i.id === id || i.reportId === id);
    if (idx === -1) return undefined;

    this.state.items[idx].isPublished = false;
    this.state.items[idx].visibility = 'draft';
    this.state.items[idx].updatedAt = new Date().toISOString();
    this.save();

    this.addAuditLog({
      actorId: 'usr-admin-1',
      actorName: 'Admin',
      actorEmail: adminEmail,
      actorRole: 'admin',
      action: 'UNPUBLISH_ITEM',
      targetId: id,
      targetType: 'item',
      previousStatus: 'PUBLISHED',
      newStatus: 'DRAFT',
      details: `Unpublished item ${this.state.items[idx].reportId} from public website.`
    });

    return this.state.items[idx];
  }

  // Edit Item (Admin Only)
  updateItem(id: string, updates: Partial<PublishedItem> & { name?: string }, adminEmail: string = 'admin@ranga.rw'): PublishedItem | undefined {
    const idx = this.state.items.findIndex(i => i.id === id || i.reportId === id);
    if (idx === -1) return undefined;

    let locationVal = this.state.items[idx].location;
    if (typeof updates.location === 'string') {
      const locStr = updates.location as string;
      const parts = locStr.split(',').map(s => s.trim());
      locationVal = {
        province: 'Rwanda',
        district: parts[0] || locStr,
        sector: parts[1] || ''
      };
    } else if (updates.location) {
      locationVal = updates.location;
    }

    const titleVal = updates.title || updates.name || this.state.items[idx].title;

    this.state.items[idx] = {
      ...this.state.items[idx],
      ...updates,
      title: titleVal,
      location: locationVal,
      updatedAt: new Date().toISOString()
    };
    this.save();

    this.addAuditLog({
      actorId: 'usr-admin-1',
      actorName: 'Admin',
      actorEmail: adminEmail,
      actorRole: 'admin',
      action: 'UPDATE_ITEM',
      targetId: id,
      targetType: 'item',
      details: `Updated details for item ${this.state.items[idx].reportId}`
    });

    return this.state.items[idx];
  }

  deleteItem(id: string, adminEmail: string = 'admin@ranga.rw'): boolean {
    const item = this.state.items.find(i => i.id === id || i.reportId === id);
    if (!item) return false;

    this.state.items = this.state.items.filter(i => i.id !== id && i.reportId !== id);
    this.save();

    this.addAuditLog({
      actorId: 'usr-admin-1',
      actorName: 'Admin',
      actorEmail: adminEmail,
      actorRole: 'admin',
      action: 'DELETE_ITEM',
      targetId: id,
      targetType: 'item',
      details: `Deleted listing ${item.reportId}`
    });

    return true;
  }

  // Publish from Case directly
  publishCaseToItem(caseId: string, customItemData?: Partial<PublishedItem>): PublishedItem | undefined {
    const caseObj = this.getCaseById(caseId);
    if (!caseObj) return undefined;

    const reportId = caseObj.type === 'found' ? this.getNextFoundReportId() : this.getNextLostReportId();

    const newItem: PublishedItem = {
      id: `item-${Date.now()}`,
      reportId,
      caseId: caseObj.id,
      type: caseObj.type,
      title: customItemData?.title || caseObj.itemName,
      categoryId: caseObj.categoryId,
      categoryName: caseObj.categoryName,
      description: customItemData?.description || caseObj.description,
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
      rewardText: caseObj.rewardInfo?.amount ? `${caseObj.rewardInfo.amount.toLocaleString()} RWF` : 'Contact Ranga for details',
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

    this.state.items.unshift(newItem);
    this.updateCase(caseObj.id, { 
      status: 'PUBLISHED',
      publishedItemId: newItem.id,
      adminAnalysis: {
        ...(caseObj.adminAnalysis || {
          verificationStatus: 'Verified',
          adminNotes: 'Published by admin',
          riskLevel: 'Low',
          authenticity: 'Confirmed',
          decision: 'Publish'
        }),
        decision: 'Publish',
        verificationStatus: 'Verified'
      }
    });

    this.save();

    this.addAuditLog({
      actorId: 'usr-admin-1',
      actorName: 'Admin',
      actorRole: 'admin',
      action: 'PUBLISH_CASE_TO_ITEM',
      targetId: newItem.id,
      targetType: 'item',
      previousStatus: caseObj.status,
      newStatus: 'PUBLISHED',
      details: `Published case ${caseObj.caseNumber} as public listing ${newItem.reportId}`
    });

    return newItem;
  }

  // --- Settings ---
  getSettings(): SystemSettings {
    return this.state.settings;
  }

  getServiceSettings(): ServiceSettings {
    return this.state.settings.service || DEFAULT_SETTINGS.service!;
  }

  updateServiceSettings(updates: Partial<ServiceSettings>): ServiceSettings {
    const current = this.state.settings.service || DEFAULT_SETTINGS.service!;
    const updated: ServiceSettings = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.state.settings.service = updated;
    this.save();
    return updated;
  }

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.state.settings = {
      ...this.state.settings,
      ...updates,
      commission: {
        ...this.state.settings.commission,
        ...(updates.commission || {})
      },
      contact: {
        ...this.state.settings.contact,
        ...(updates.contact || {})
      },
      service: updates.service ? {
        ...(this.state.settings.service || DEFAULT_SETTINGS.service!),
        ...updates.service,
        updatedAt: new Date().toISOString()
      } : this.state.settings.service
    };
    this.save();
    return this.state.settings;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return [...this.state.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...log
    };
    this.state.auditLogs.unshift(newLog);
    if (this.state.auditLogs.length > 500) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 500);
    }
    this.save();
    return newLog;
  }

  // --- Reviews ---
  getReviews(): Review[] {
    return this.state.reviews;
  }

  // --- Reports ---
  getReports(): ReportListing[] {
    return [...this.state.reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createReport(report: Partial<ReportListing>): ReportListing {
    const newReport: ReportListing = {
      id: `rep-${Date.now()}`,
      itemId: report.itemId || '',
      itemReportId: report.itemReportId || '',
      itemTitle: report.itemTitle || '',
      reporterName: report.reporterName || 'Anonymous',
      reporterPhone: report.reporterPhone,
      reason: report.reason || 'scam',
      description: report.description || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.state.reports.unshift(newReport);
    this.save();
    return newReport;
  }

  updateReportStatus(id: string, status: ReportListing['status']): boolean {
    const rep = this.state.reports.find(r => r.id === id);
    if (rep) {
      rep.status = status;
      this.save();
      return true;
    }
    return false;
  }

  // --- Analytics ---
  getAnalytics() {
    const totalCases = this.state.cases.length;
    const pendingCases = this.state.cases.filter(c => c.status === 'NEW' || c.status === 'UNDER_REVIEW' || c.status === 'VERIFYING').length;
    const publishedItems = this.state.items.filter(i => i.isPublished && i.visibility === 'public').length;
    const draftItems = this.state.items.filter(i => i.visibility === 'draft').length;
    const recoveredCases = this.state.cases.filter(c => c.status === 'RECOVERED' || c.status === 'CLOSED').length;
    
    const totalLost = this.state.items.filter(i => i.type === 'lost' && i.isPublished).length;
    const totalFound = this.state.items.filter(i => i.type === 'found' && i.isPublished).length;

    // Categories
    const categoryCount: Record<string, number> = {};
    for (const item of this.state.items) {
      if (item.isPublished) {
        const cat = item.categoryName || item.categoryId;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }
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
}

export const db = new RangaDatabase();
