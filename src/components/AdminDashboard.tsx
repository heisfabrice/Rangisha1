import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Trash2, 
  Settings, 
  Search, 
  MapPin, 
  Calendar, 
  Image as ImageIcon, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Phone,
  Mail,
  Share2,
  Package,
  ArrowRight,
  Eye,
  Camera,
  Users,
  Clock,
  Database,
  LogOut
} from 'lucide-react';
import { api } from '../lib/api';
import { PublishedItem, SystemSettings } from '../types';
import { INITIAL_CATEGORIES } from '../lib/categories';
import { useAuth } from '../lib/auth';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { logout } = useAuth();
  // Navigation tabs: Dashboard, Add Item, Remove, Settings
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'remove' | 'settings'>('dashboard');

  // Core Data
  const [items, setItems] = useState<PublishedItem[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Global Notification Banner / Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // MongoDB Atlas collections status & sync state
  const [mongoStatus, setMongoStatus] = useState<{
    connected: boolean;
    database?: string;
    message: string;
    collections?: { name: string; count: number }[];
  } | null>(null);
  const [syncingMongo, setSyncingMongo] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // -------------------------------------------------------------
  // Load Items & Settings
  // -------------------------------------------------------------
  const loadData = async () => {
    try {
      setLoading(true);
      const [itemList, setRes, mongoRes] = await Promise.all([
        api.getAdminItems().catch(() => []),
        api.getSettings().catch(() => null),
        api.getMongoStatus().catch(() => null)
      ]);
      setItems(itemList);
      if (setRes) {
        setSettings(setRes);
        populateSettingsForm(setRes);
      }
      if (mongoRes) {
        setMongoStatus(mongoRes);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      showNotification('Failed to load data from server', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSyncMongo = async () => {
    try {
      setSyncingMongo(true);
      const res = await api.triggerMongoSync();
      if (res.success && res.summary) {
        setMongoStatus({
          connected: res.summary.connected,
          database: res.summary.database,
          message: res.message || 'Synchronized with MongoDB Atlas',
          collections: res.summary.collections
        });
        showNotification('Successfully synchronized all products, cases, and settings to MongoDB Atlas!', 'success');
      } else {
        showNotification(res.message || 'Database synchronization completed', 'success');
      }
      const updatedItems = await api.getAdminItems();
      setItems(updatedItems);
    } catch (err: any) {
      showNotification('Failed to synchronize with MongoDB Atlas: ' + (err?.message || ''), 'error');
    } finally {
      setSyncingMongo(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------------------------------------
  // 1. ADD ITEM STATE & LOGIC
  // Fields required:
  // 1. Item Name
  // 2. Location
  // 3. Description
  // 4. Date
  // 5. Photo (Optional)
  // -------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const [itemType, setItemType] = useState<'lost' | 'found' | 'missing_person' | 'found_person'>('lost');
  const [itemCategory, setItemCategory] = useState<string>('id_docs');
  const [itemName, setItemName] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemDate, setItemDate] = useState(todayStr);
  const [itemPhotos, setItemPhotos] = useState<string[]>([]);
  const [personAge, setPersonAge] = useState<string>('');
  const [personGender, setPersonGender] = useState<'male' | 'female' | 'other'>('male');
  const [policeCaseNumber, setPoliceCaseNumber] = useState<string>('');
  const [shelterLocation, setShelterLocation] = useState<string>('');
  const [submittingItem, setSubmittingItem] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo Selection (FileReader)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setItemPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input value so same file can be re-selected if removed
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setItemPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllPhotos = () => {
    setItemPhotos([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Immediate publication on "ADD ITEM" click:
  // 1. Validate
  // 2. Save directly to database
  // 3. Item immediately appears on website
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      showNotification('Please enter the Item Name or Person Name.', 'error');
      return;
    }
    if (!itemLocation.trim()) {
      showNotification('Please enter the Location.', 'error');
      return;
    }
    if (!itemDescription.trim()) {
      showNotification('Please enter the Description.', 'error');
      return;
    }
    if (!itemDate) {
      showNotification('Please choose the Date.', 'error');
      return;
    }

    try {
      setSubmittingItem(true);
      const isPerson = itemType === 'missing_person' || itemType === 'found_person';
      const catObj = INITIAL_CATEGORIES.find(c => c.id === itemCategory);
      
      const res = await api.addAdminItem({
        name: itemName.trim(),
        type: itemType,
        categoryId: isPerson ? 'people' : itemCategory,
        categoryName: isPerson ? 'Abantu (People)' : (catObj?.nameRw || 'General'),
        location: itemLocation.trim(),
        description: itemDescription.trim(),
        date: itemDate,
        images: itemPhotos,
        personDetails: isPerson ? {
          fullName: itemName.trim(),
          age: personAge ? parseInt(personAge, 10) : undefined,
          gender: personGender,
          policeCaseNumber: policeCaseNumber.trim() || undefined,
          currentLocationOrShelter: shelterLocation.trim() || undefined,
          emergencyContactHotline: '+250788450120'
        } : undefined
      });

      if (res && res.item) {
        setItems(prev => [res.item, ...prev]);
        showNotification(`"${res.item.title}" was published immediately to Rangisha.com!`, 'success');
        
        // Reset form
        setItemName('');
        setItemLocation('');
        setItemDescription('');
        setItemDate(todayStr);
        setItemPhotos([]);
        setPersonAge('');
        setPoliceCaseNumber('');
        setShelterLocation('');

        // Automatically switch to Remove Item tab or Dashboard so Admin sees it live
        setActiveTab('remove');
      }
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Failed to add item.', 'error');
    } finally {
      setSubmittingItem(false);
    }
  };

  // -------------------------------------------------------------
  // 2. REMOVE ITEM STATE & LOGIC
  // Displays all published items with confirmation modal
  // -------------------------------------------------------------
  const [removeSearch, setRemoveSearch] = useState('');
  const [itemToDelete, setItemToDelete] = useState<PublishedItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirmRemoveItem = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      const res = await api.deleteAdminItem(itemToDelete.id);
      if (res && res.success) {
        setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
        showNotification('Item removed successfully.', 'success');
        setItemToDelete(null);
      } else {
        showNotification('Failed to remove item.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Error removing item.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Filter items for remove view
  const filteredRemoveItems = items.filter(item => {
    const q = removeSearch.toLowerCase();
    const title = (item.title || (item as any).name || '').toLowerCase();
    const loc = (typeof item.location === 'string' ? item.location : `${item.location?.district || ''} ${item.location?.sector || ''}`).toLowerCase();
    const desc = (item.description || '').toLowerCase();
    return title.includes(q) || loc.includes(q) || desc.includes(q);
  });



  // -------------------------------------------------------------
  // 3. SERVICE AVAILABILITY (MONGODB ATLAS) STATE & LOGIC
  // Requirement #5: Enable, Disable, Coming Soon, Message, Expected
  // -------------------------------------------------------------
  const [serviceStatus, setServiceStatus] = useState<'available' | 'coming_soon' | 'unavailable'>('coming_soon');
  const [serviceMessage, setServiceMessage] = useState('This service is currently unavailable and will be available in the coming days.');
  const [serviceExpectedAvailability, setServiceExpectedAvailability] = useState('Coming days');
  const [savingService, setSavingService] = useState(false);

  // -------------------------------------------------------------
  // 4. SOCIAL MEDIA & CONTACT SETTINGS STATE & LOGIC
  // Controls WhatsApp, Phone, Instagram, Facebook, Email, X (Twitter)
  // -------------------------------------------------------------
  const [settingsForm, setSettingsForm] = useState({
    whatsapp: '',
    phone: '',
    instagram: '',
    facebook: '',
    email: '',
    twitter: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const populateSettingsForm = (currentSettings: SystemSettings) => {
    const c = currentSettings.contact || ({} as any);
    setSettingsForm({
      whatsapp: c.whatsapp || '',
      phone: c.phone || '',
      instagram: c.instagram || '',
      facebook: c.facebook || '',
      email: c.email || '',
      twitter: c.twitter || ''
    });

    if (currentSettings.service) {
      setServiceStatus(currentSettings.service.status || (currentSettings.service.available ? 'available' : 'coming_soon'));
      setServiceMessage(currentSettings.service.message || '');
      setServiceExpectedAvailability(currentSettings.service.expectedAvailability || '');
    }
  };

  const handleSaveServiceSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingService(true);
      const isAvailable = serviceStatus === 'available';
      const res = await api.updateAdminServiceSettings({
        serviceName: 'Office Service',
        status: serviceStatus,
        available: isAvailable,
        message: serviceMessage.trim(),
        expectedAvailability: serviceExpectedAvailability.trim()
      });

      if (res && res.service) {
        if (settings) {
          setSettings({ ...settings, service: res.service });
        }
        showNotification('Service Availability settings saved to MongoDB Atlas!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Failed to update service availability settings.', 'error');
    } finally {
      setSavingService(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.updateSettings({
        contact: {
          ...(settings?.contact || {} as any),
          whatsapp: settingsForm.whatsapp.trim(),
          phone: settingsForm.phone.trim(),
          instagram: settingsForm.instagram.trim(),
          facebook: settingsForm.facebook.trim(),
          email: settingsForm.email.trim(),
          twitter: settingsForm.twitter.trim()
        }
      });

      if (res && res.settings) {
        setSettings(res.settings);
        showNotification('Social Media & Contact Settings updated successfully! Changes are live on Rangisha.com.', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showNotification('Failed to save settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8] dark:bg-[#0F1720] text-[#1E2933] dark:text-[#E6EDF3] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Toast Notification */}
      {notification && (
        <div 
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
            notification.type === 'success' 
              ? 'bg-white dark:bg-[#182432] text-[#1E2933] dark:text-[#E6EDF3] border-[#16A085]/40' 
              : 'bg-white dark:bg-[#182432] text-[#1E2933] dark:text-[#E6EDF3] border-[#C75C5C]/40'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#3BA982] shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#C75C5C] shrink-0" />
          )}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ======================================================== */}
        {/* HEADER: Rangisha.com Administrator Console              */}
        {/* Subtitle: Manage the items displayed on Rangisha.com    */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-[#182432] p-4 sm:p-6 md:p-8 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] border border-[#168F7D]/25 dark:border-[#2CBFAE]/30">
              <span className="w-2 h-2 rounded-full bg-[#16A085] dark:bg-[#2CBFAE] animate-pulse" />
              Official Administration
            </div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#1E2933] dark:text-[#F1F5F9] tracking-tight break-words">
              Rangisha.com Administrator Console
            </h1>
            <p className="text-xs sm:text-base text-[#607080] dark:text-[#AAB7C4] font-medium">
              Manage the items displayed on Rangisha.com
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0 pt-1 md:pt-0">
            <button
              onClick={() => {
                setRefreshing(true);
                loadData();
              }}
              disabled={refreshing}
              className="p-2 sm:p-2.5 rounded-xl border border-[#D5DEE3] dark:border-[#2A3948] hover:bg-[#EAF0F2] dark:hover:bg-[#1D2A38] text-[#607080] dark:text-[#CBD5E1] transition-colors"
              title="Refresh Items"
              aria-label="Refresh items"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#2CBFAE]' : ''}`} />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#EAF0F2] dark:bg-[#1D2A38] hover:bg-[#D5DEE3] dark:hover:bg-[#233344] text-[#1E2933] dark:text-[#D7E0E8] text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-[#D5DEE3] dark:border-[#2A3948] transition-colors"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => {
                logout();
                if (onLogout) onLogout();
              }}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#C75C5C]/10 hover:bg-[#C75C5C]/20 active:bg-[#C75C5C]/30 text-[#C75C5C] text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-[#C75C5C]/30 transition-colors shadow-sm"
              title="Logout from Admin Console"
              aria-label="Logout from Admin Console"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Gusohoka (Logout)</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ADMIN PANEL NAVIGATION                                    */}
        {/* 1. Dashboard                                             */}
        {/* 2. Add Item                                              */}
        {/* 3. Remove Item                                           */}
        {/* 4. Social Media / Contact Settings                       */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-[#111B26] p-2 rounded-[16px] border border-[#D5DEE3] dark:border-[#253443] shadow-sm grid grid-cols-2 lg:flex lg:flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full lg:flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#168F7D]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] border border-[#168F7D]/30 dark:border-[#2CBFAE]/40 shadow-sm'
                : 'text-[#607080] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432] border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#16A085] dark:text-[#2CBFAE] shrink-0" />
            <span className="truncate">1. Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`w-full lg:flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
              activeTab === 'add'
                ? 'bg-[#16A085] text-[#F1F5F9] shadow-md shadow-[#16A085]/25'
                : 'text-[#607080] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432] border border-transparent'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Add Item</span>
          </button>

          <button
            onClick={() => setActiveTab('remove')}
            className={`w-full lg:flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
              activeTab === 'remove'
                ? 'bg-[#C75C5C] text-[#F1F5F9] shadow-md shadow-[#C75C5C]/25'
                : 'text-[#607080] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432] border border-transparent'
            }`}
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span className="truncate">3. Remove</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full lg:flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-[#168F7D]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] border border-[#168F7D]/30 dark:border-[#2CBFAE]/40 shadow-sm'
                : 'text-[#607080] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432] border border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 text-[#16A085] dark:text-[#2CBFAE] shrink-0" />
            <span className="truncate">4. Settings</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ADMIN DASHBOARD                                   */}
        {/* Shows ONLY useful information: Total Items & Quick Actions*/}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Useful KPI Cards: Total Items only */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-[#182432] p-6 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#16A085]/15 text-[#168F7D] dark:text-[#2CBFAE] flex items-center justify-center shrink-0">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#607080] dark:text-[#7F8C99]">Total Items</span>
                  <div className="text-3xl font-black text-[#1E2933] dark:text-[#F1F5F9] mt-0.5">
                    {items.length}
                  </div>
                  <span className="text-xs text-[#168F7D] dark:text-[#2CBFAE] font-semibold">Currently published on Rangisha.com</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#182432] p-6 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#2CBFAE]/15 text-[#168F7D] dark:text-[#2CBFAE] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#607080] dark:text-[#7F8C99]">WhatsApp Intake</span>
                  <div className="text-base font-extrabold text-[#1E2933] dark:text-[#F1F5F9] mt-0.5">
                    {settings?.contact?.whatsapp || '+250 788 450 120'}
                  </div>
                  <span className="text-xs text-[#168F7D] dark:text-[#2CBFAE] font-semibold">Live contact channel for citizens</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#182432] p-6 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#3BA982]/15 text-[#3BA982] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#607080] dark:text-[#7F8C99]">Publishing Mode</span>
                  <div className="text-base font-extrabold text-[#1E2933] dark:text-[#F1F5F9] mt-0.5">
                    Direct & Immediate
                  </div>
                  <span className="text-xs text-[#3BA982] font-semibold">Zero review workflow • Trusted Admin</span>
                </div>
              </div>

            </div>

            {/* QUICK ACTION BUTTONS */}
            <div className="space-y-4">
              <h2 className="text-lg font-black text-[#1E2933] dark:text-[#F1F5F9] flex items-center gap-2">
                <span>Quick Actions</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                {/* 1. + Add Item Card */}
                <div 
                  onClick={() => setActiveTab('add')}
                  className="group cursor-pointer bg-gradient-to-br from-[#16A085] to-[#14232C] text-[#F1F5F9] p-6 rounded-[16px] shadow-[0_4px_20px_rgba(22,160,133,0.25)] hover:border-[#36C9B7] border border-[#2CBFAE]/30 transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between h-56"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
                      <PlusCircle className="w-6 h-6 text-[#F1F5F9]" />
                    </div>
                    <span className="text-[10px] font-bold bg-white/20 text-[#F1F5F9] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Add New
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black tracking-tight mb-1 text-[#F1F5F9]">
                      + Add Item
                    </h3>
                    <p className="text-xs text-[#E6EDF3]/85 leading-relaxed line-clamp-2">
                      Publish a new item immediately to Rangisha.com. No review required.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#F1F5F9] group-hover:translate-x-1 transition-transform">
                    <span>Open Add Form</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* 2. Remove Item Card */}
                <div 
                  onClick={() => setActiveTab('remove')}
                  className="group cursor-pointer bg-white dark:bg-[#182432] p-6 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#C75C5C] shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between h-56"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#C75C5C]/15 text-[#C75C5C] flex items-center justify-center">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#C75C5C] bg-[#C75C5C]/10 px-2.5 py-1 rounded-full border border-[#C75C5C]/25">
                      Delete
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#1E2933] dark:text-[#F1F5F9] tracking-tight mb-1">
                      Remove Item
                    </h3>
                    <p className="text-xs text-[#607080] dark:text-[#AAB7C4] leading-relaxed line-clamp-2">
                      Permanently remove recovered, claimed, or outdated products from website.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#C75C5C] group-hover:translate-x-1 transition-transform">
                    <span>Remove Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* 3. Social Media / Contact Settings Card */}
                <div 
                  onClick={() => setActiveTab('settings')}
                  className="group cursor-pointer bg-white dark:bg-[#182432] p-6 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#2CBFAE] shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col justify-between h-56"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#2CBFAE]/15 text-[#168F7D] dark:text-[#2CBFAE] flex items-center justify-center">
                      <Settings className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#168F7D] dark:text-[#2CBFAE] bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] px-2.5 py-1 rounded-full border border-[#168F7D]/25 dark:border-[#2CBFAE]/30">
                      Settings
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-[#1E2933] dark:text-[#F1F5F9] tracking-tight mb-1">
                      Social & Settings
                    </h3>
                    <p className="text-xs text-[#607080] dark:text-[#AAB7C4] leading-relaxed line-clamp-2">
                      Edit WhatsApp, Hotline, Instagram, Facebook, and Office Service settings.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#168F7D] dark:text-[#2CBFAE] group-hover:translate-x-1 transition-transform">
                    <span>Configure Settings</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

              </div>
            </div>

            {/* Currently Published Items Preview */}
            <div className="bg-white dark:bg-[#182432] p-6 sm:p-8 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#1E2933] dark:text-[#F1F5F9]">
                    Currently Displayed Items ({items.length})
                  </h3>
                  <p className="text-xs text-[#607080] dark:text-[#AAB7C4]">
                    Live items visible to Rwandan citizens on the public homepage and search.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('remove')}
                  className="text-xs font-bold text-[#168F7D] dark:text-[#2CBFAE] hover:underline flex items-center gap-1"
                >
                  <span>Manage All Items</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-[#D5DEE3] dark:border-[#2A3948] rounded-2xl text-[#7F8C99]">
                  <Package className="w-10 h-10 mx-auto mb-2 text-[#7F8C99]" />
                  <p className="text-sm font-bold text-[#1E2933] dark:text-[#E6EDF3]">No items published yet</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-bold text-xs shadow-md transition-colors"
                  >
                    + Add Your First Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.slice(0, 6).map(item => {
                    const hasImg = item.images && item.images.length > 0 && item.images[0];
                    const loc = typeof item.location === 'string' ? item.location : item.location?.district;
                    return (
                      <div 
                        key={item.id}
                        className="p-4 rounded-[14px] bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] flex gap-4 items-center hover:border-[#168F7D] dark:hover:border-[#2CBFAE] transition-colors"
                      >
                        <div className="w-16 h-16 rounded-xl bg-[#EAF0F2] dark:bg-[#111B26] border border-[#D5DEE3] dark:border-[#2A3948] shrink-0 overflow-hidden flex items-center justify-center">
                          {hasImg ? (
                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-6 h-6 text-[#7F8C99]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-[#1E2933] dark:text-[#E6EDF3] truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#607080] dark:text-[#AAB7C4] truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#168F7D] dark:text-[#2CBFAE]" />
                            <span>{loc || 'Rwanda'}</span>
                          </p>
                          <span className="text-[10px] font-mono text-[#7F8C99] block mt-1">
                            {item.date}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ADD ITEM (MOST IMPORTANT FEATURE)                  */}
        {/* Form contains ONLY required fields:                      */}
        {/* 1. Item Name                                             */}
        {/* 2. Location                                              */}
        {/* 3. Description                                           */}
        {/* 4. Date                                                  */}
        {/* 5. Photo (Optional)                                      */}
        {/* Immediate publication to website upon clicking Add Item   */}
        {/* ======================================================== */}
        {activeTab === 'add' && (
          <div className="bg-white dark:bg-[#182432] p-6 sm:p-10 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
            
            <div className="border-b border-[#D5DEE3] dark:border-[#2A3948] pb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] border border-[#168F7D]/25 dark:border-[#2CBFAE]/30 mb-2">
                <PlusCircle className="w-3.5 h-3.5" />
                Direct Website Publication
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
                ADD ITEM / PERSON
              </h2>
              <p className="text-xs sm:text-sm text-[#607080] dark:text-[#AAB7C4] mt-1">
                Enter the information below. When you click <strong>+ Add Item</strong>, it immediately appears live on Rangisha.com in the appropriate section.
              </p>
            </div>

            <form onSubmit={handleAddItem} className="space-y-6">
              
              {/* Type Selector (4 Types) */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  Icyiciro cy'Icyo Wemeje (Type) <span className="text-[#C75C5C]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setItemType('lost')}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                      itemType === 'lost'
                        ? 'bg-[#C75C5C] text-white border-[#C75C5C] shadow-sm'
                        : 'bg-[#F4F7F8] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#CBD5E1] border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#C75C5C]'
                    }`}
                  >
                    Icyatakaye (Lost Item)
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemType('found')}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                      itemType === 'found'
                        ? 'bg-[#16A085] text-white border-[#16A085] shadow-sm'
                        : 'bg-[#F4F7F8] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#CBD5E1] border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#16A085]'
                    }`}
                  >
                    Icyatoraguwe (Found Item)
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemType('missing_person')}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                      itemType === 'missing_person'
                        ? 'bg-[#C75C5C] text-white border-[#C75C5C] shadow-sm'
                        : 'bg-[#F4F7F8] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#CBD5E1] border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#C75C5C]'
                    }`}
                  >
                    🚨 Uwatakaye (Missing Person)
                  </button>

                  <button
                    type="button"
                    onClick={() => setItemType('found_person')}
                    className={`py-3 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                      itemType === 'found_person'
                        ? 'bg-[#16A085] text-white border-[#16A085] shadow-sm'
                        : 'bg-[#F4F7F8] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#CBD5E1] border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#16A085]'
                    }`}
                  >
                    Uwatoraguwe (Found Person)
                  </button>
                </div>
              </div>

              {/* Category Selector (For Lost / Found items) */}
              {itemType !== 'missing_person' && itemType !== 'found_person' && (
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                    Ubwoko bw'Ikintu (Category)
                  </label>
                  <select
                    value={itemCategory}
                    onChange={e => setItemCategory(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all cursor-pointer"
                  >
                    {INITIAL_CATEGORIES.filter(c => c.id !== 'people').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nameRw} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 1. Item Name or Person Name */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  {itemType === 'missing_person' || itemType === 'found_person' 
                    ? "Amazina y'Umuntu (Full Name) " 
                    : "Item Name "}
                  <span className="text-[#C75C5C]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder={
                    itemType === 'missing_person' || itemType === 'found_person'
                      ? "Example: Mugisha David (Imyaka 7) cyangwa Mukecuru (Amazina ntariboneka)"
                      : "Example: Indangamuntu ya Mukamana Alice cyangwa Black Samsung Phone"
                  }
                  className="w-full px-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all"
                />
              </div>

              {/* Person-Specific Details */}
              {(itemType === 'missing_person' || itemType === 'found_person') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#EAF0F2]/60 dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948]">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#607080] dark:text-[#AAB7C4]">
                      Imyaka (Age)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={personAge}
                      onChange={e => setPersonAge(e.target.value)}
                      placeholder="e.g. 7"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#607080] dark:text-[#AAB7C4]">
                      Igitsina (Gender)
                    </label>
                    <select
                      value={personGender}
                      onChange={e => setPersonGender(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] outline-none cursor-pointer"
                    >
                      <option value="male">Gabo (Male)</option>
                      <option value="female">Gore (Female)</option>
                      <option value="other">Ikindi (Other)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#607080] dark:text-[#AAB7C4]">
                      Nimero ya RIB / Polisi (Police Case No.)
                    </label>
                    <input
                      type="text"
                      value={policeCaseNumber}
                      onChange={e => setPoliceCaseNumber(e.target.value)}
                      placeholder="e.g. RIB/KGL/2026/04-012"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#607080] dark:text-[#AAB7C4]">
                      {itemType === 'found_person' ? 'Aho ari ubu (Shelter / Hospital)' : 'Aho aheruka kubonwa'}
                    </label>
                    <input
                      type="text"
                      value={shelterLocation}
                      onChange={e => setShelterLocation(e.target.value)}
                      placeholder={itemType === 'found_person' ? "Isange One Stop Center / Ibitaro" : "Hafi y'ishuri cyangwa isoko"}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 2. Location */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  Location <span className="text-[#C75C5C]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-4 top-4 text-[#168F7D] dark:text-[#2CBFAE]" />
                  <input
                    type="text"
                    required
                    value={itemLocation}
                    onChange={e => setItemLocation(e.target.value)}
                    placeholder="Example: Kicukiro, Kigali"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all"
                  />
                </div>
              </div>

              {/* 3. Description */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  Description <span className="text-[#C75C5C]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={itemDescription}
                  onChange={e => setItemDescription(e.target.value)}
                  placeholder={
                    itemType === 'missing_person' || itemType === 'found_person'
                      ? "Sobanura imyenda yari yambaye, ibimenyetso by'umubiri, indimi avuga, n'uko yabuze..."
                      : "Example: Black Samsung phone lost near Kicukiro Centre with a cracked screen protector."
                  }
                  className="w-full px-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all resize-y"
                />
              </div>

              {/* 4. Date */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  Date <span className="text-[#C75C5C]">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-4 top-4 text-[#7F8C99]" />
                  <input
                    type="date"
                    required
                    value={itemDate}
                    onChange={e => setItemDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all"
                  />
                </div>
              </div>

              {/* 5. Photo (Optional) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                    Photo y'ikintu (Optional)
                  </label>
                  <span className="text-xs text-[#607080] dark:text-[#7F8C99]">
                    Photo is optional. You can upload one, multiple, or continue without photo.
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {/* IMAGE PREVIEW CONTAINER */}
                {itemPhotos.length > 0 ? (
                  <div className="space-y-3">
                    <div className="border border-[#16A085]/40 rounded-2xl p-4 bg-[#F4F7F8] dark:bg-[#141E2A]">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {itemPhotos.map((photo, idx) => (
                          <div key={idx} className="relative group rounded-xl overflow-hidden h-36 border border-[#D5DEE3] dark:border-[#2A3948] bg-[#EAF0F2] dark:bg-[#111B26]">
                            <img
                              src={photo}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#0F1720]/80 hover:bg-[#C75C5C] text-white transition-colors"
                              title="Remove this photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-[#EAF0F2] hover:bg-[#D5DEE3] dark:bg-[#1D2A38] dark:hover:bg-[#233344] text-[#1E2933] dark:text-[#D7E0E8] border border-[#D5DEE3] dark:border-[#2A3948] text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#168F7D] dark:text-[#2CBFAE]" />
                        <span>Change / Add More Photos</span>
                      </button>

                      <button
                        type="button"
                        onClick={clearAllPhotos}
                        className="px-4 py-2.5 rounded-xl text-[#C75C5C] hover:bg-[#C75C5C]/10 text-xs font-bold transition-colors"
                      >
                        Remove All Photos
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#2CBFAE] rounded-2xl p-8 text-center transition-all bg-[#F4F7F8] dark:bg-[#141E2A] flex flex-col items-center justify-center space-y-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#182432] shadow-sm flex items-center justify-center text-[#7F8C99] group-hover:text-[#2CBFAE] transition-colors border border-[#D5DEE3] dark:border-[#2A3948]">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#1E2933] dark:text-[#E6EDF3] block">
                        Choose Photo
                      </span>
                      <span className="text-xs text-[#607080] dark:text-[#7F8C99]">
                        Click here to upload photo(s) from your computer or phone
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#168F7D] dark:text-[#2CBFAE] bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] px-3 py-1 rounded-full border border-[#168F7D]/25 dark:border-[#2CBFAE]/30">
                      Optional — You may continue without a photo
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button: Clearly Visible + Add Item */}
              <div className="pt-4 border-t border-[#D5DEE3] dark:border-[#2A3948]">
                <button
                  type="submit"
                  disabled={submittingItem}
                  className="w-full py-4 px-6 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] active:scale-[0.99] text-[#F1F5F9] font-black text-base shadow-[0_4px_20px_rgba(22,160,133,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submittingItem ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Saving & Publishing Immediately...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      <span>+ Add Item</span>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-[#607080] dark:text-[#7F8C99] mt-2 font-medium">
                  The item will immediately be displayed publicly on Rangisha.com.
                </p>
              </div>

            </form>

          </div>
        )}



        {/* ======================================================== */}
        {/* TAB 4: REMOVE ITEM                                       */}
        {/* Displays all currently published items with Photo,       */}
        {/* Name, Location, Date, Description, and Remove button.    */}
        {/* Requires confirmation dialog before deletion.            */}
        {/* ======================================================== */}
        {activeTab === 'remove' && (
          <div className="bg-white dark:bg-[#182432] p-6 sm:p-8 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5DEE3] dark:border-[#2A3948] pb-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
                  REMOVE ITEM
                </h2>
                <p className="text-xs sm:text-sm text-[#607080] dark:text-[#AAB7C4] mt-1">
                  Manage all currently published items on Rangisha.com. Click <strong>Remove</strong> to permanently remove an item.
                </p>
              </div>

              {/* Search filter within published items */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#7F8C99]" />
                <input
                  type="text"
                  value={removeSearch}
                  onChange={e => setRemoveSearch(e.target.value)}
                  placeholder="Search item to remove..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-xs font-semibold text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20"
                />
              </div>
            </div>

            {/* Item List */}
            {filteredRemoveItems.length === 0 ? (
              <div className="p-12 text-center text-[#7F8C99] border border-[#D5DEE3] dark:border-[#2A3948] rounded-2xl bg-[#F4F7F8]/50 dark:bg-[#141E2A]/50">
                <Package className="w-10 h-10 mx-auto mb-2 text-[#7F8C99]" />
                <p className="text-sm font-bold text-[#1E2933] dark:text-[#E6EDF3]">No matching items found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRemoveItems.map(item => {
                  const hasPhoto = item.images && item.images.length > 0 && item.images[0];
                  const loc = typeof item.location === 'string' ? item.location : `${item.location?.district || ''}${item.location?.sector ? `, ${item.location.sector}` : ''}`;
                  const itemName = item.title || (item as any).name;

                  return (
                    <div 
                      key={item.id}
                      className="p-4 sm:p-5 rounded-[16px] bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-[#168F7D] dark:hover:border-[#2CBFAE] transition-all"
                    >
                      {/* Photo + Details */}
                      <div className="flex items-start sm:items-center gap-4 min-w-0">
                        
                        {/* Photo or Clean Placeholder */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[14px] bg-[#EAF0F2] dark:bg-[#111B26] shrink-0 overflow-hidden border border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-center">
                          {hasPhoto ? (
                            <img
                              src={item.images[0]}
                              alt={itemName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-2 text-[#7F8C99]">
                              <Camera className="w-6 h-6 mx-auto mb-1 opacity-60 text-[#7F8C99]" />
                              <span className="text-[9px] font-bold block leading-tight">No photo</span>
                            </div>
                          )}
                        </div>

                        {/* Text Information */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] bg-[#EAF0F2] dark:bg-[#1D2A38] px-2 py-0.5 rounded font-bold text-[#607080] dark:text-[#AAB7C4] border border-[#D5DEE3] dark:border-[#2A3948]">
                              {item.reportId}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-[#3BA982] bg-[#3BA982]/15 px-2 py-0.5 rounded border border-[#3BA982]/30">
                              Live on Website
                            </span>
                          </div>

                          <h3 className="font-black text-base text-[#1E2933] dark:text-[#F1F5F9] truncate">
                            {itemName}
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#607080] dark:text-[#AAB7C4] font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#168F7D] dark:text-[#2CBFAE] shrink-0" />
                              <span>{loc || 'Rwanda'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#7F8C99] shrink-0" />
                              <span>{item.date}</span>
                            </span>
                          </div>

                          <p className="text-xs text-[#607080] dark:text-[#AAB7C4] line-clamp-2 max-w-2xl leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="px-4 py-2.5 rounded-xl bg-[#C75C5C] hover:bg-[#b54f4f] text-[#F1F5F9] font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-[#C75C5C]/25 transition-all hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SETTINGS (SERVICE AVAILABILITY & CONTACTS)        */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
            
            {/* 0. MONGODB ATLAS SYNCHRONIZATION & STORAGE STATUS */}
            <div className="bg-white dark:bg-[#182432] p-6 sm:p-8 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D5DEE3] dark:border-[#2A3948] pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] border border-[#168F7D]/25 dark:border-[#2CBFAE]/30 mb-2">
                    <Database className="w-3.5 h-3.5" />
                    MongoDB Atlas Database
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
                    DATABASE COLLECTIONS & STORAGE
                  </h2>
                  <p className="text-xs sm:text-sm text-[#607080] dark:text-[#AAB7C4] mt-1">
                    Database: <span className="font-mono font-bold text-[#168F7D] dark:text-[#2CBFAE]">rangisha</span> &bull; All reported products, cases, and settings are stored in your MongoDB Atlas cluster.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#16A085]/15 text-[#168F7D] dark:text-[#2CBFAE] border border-[#16A085]/30">
                    <span className="w-2 h-2 rounded-full bg-[#16A085] animate-pulse"></span>
                    <span>{mongoStatus?.connected ? 'Atlas Connected' : 'Connecting...'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncMongo}
                    disabled={syncingMongo}
                    className="px-3.5 py-2 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] active:scale-95 text-white text-xs font-black transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingMongo ? 'animate-spin' : ''}`} />
                    <span>{syncingMongo ? 'Syncing...' : 'Sync to Atlas Now'}</span>
                  </button>
                </div>
              </div>

              {/* Collections Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {mongoStatus?.collections && mongoStatus.collections.length > 0 ? (
                  mongoStatus.collections.map((col) => (
                    <div 
                      key={col.name}
                      className="p-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-bold text-[#607080] dark:text-[#7F8C99] uppercase tracking-wider block font-mono">
                        {col.name}
                      </span>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="text-xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
                          {col.count}
                        </span>
                        <span className="text-[10px] text-[#8A99A8] dark:text-[#7F8C99]">
                          {col.name === 'items' ? 'products' : 'docs'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 py-3 text-center text-xs text-[#8A99A8]">
                    Loading MongoDB Atlas collection status...
                  </div>
                )}
              </div>

              <div className="bg-[#EAF0F2]/60 dark:bg-[#111B26] p-3.5 rounded-xl border border-[#D5DEE3] dark:border-[#2A3948] text-xs text-[#607080] dark:text-[#AAB7C4] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#168F7D] dark:text-[#2CBFAE] shrink-0" />
                <span>
                  Every product / item added (Ababuze & Ababonetse) is immediately synchronized to the <strong className="text-[#1E2933] dark:text-[#F1F5F9]">items</strong> collection in your MongoDB Atlas database.
                </span>
              </div>
            </div>

            {/* 1. SERVICE AVAILABILITY / COMING SOON MANAGEMENT (Requirement #5) */}
            <div className="bg-white dark:bg-[#182432] p-6 sm:p-10 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-6">
              <div className="border-b border-[#D5DEE3] dark:border-[#2A3948] pb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] border border-[#168F7D]/25 dark:border-[#2CBFAE]/30 mb-2">
                  <Database className="w-3.5 h-3.5" />
                  MongoDB Atlas Service Control
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
                  SERVICE AVAILABILITY CONTROL
                </h2>
                <p className="text-xs sm:text-sm text-[#607080] dark:text-[#AAB7C4] mt-1">
                  Manage the public status of in-person office service ("Ushobora no Kugana Ibiro Byawe mu Mujyi wa Kigali"). Controls whether the service is Available, Coming Soon, or Unavailable.
                </p>
              </div>

              <form onSubmit={handleSaveServiceSettings} className="space-y-6">
                
                {/* SERVICE STATUS */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                    SERVICE STATUS: <span className="text-[#C75C5C]">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceStatus('available')}
                      className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all text-center border flex items-center justify-center gap-1.5 ${
                        serviceStatus === 'available'
                          ? 'bg-[#16A085] text-white border-[#16A085] shadow-md ring-2 ring-[#16A085]/30'
                          : 'bg-[#F4F7F8] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#CBD5E1] border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#16A085]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>[ Available ]</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceStatus('coming_soon')}
                      className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all text-center border flex items-center justify-center gap-1.5 ${
                        serviceStatus === 'coming_soon'
                          ? 'bg-[#C99A4A] text-white border-[#C99A4A] shadow-md ring-2 ring-[#C99A4A]/30'
                          : 'bg-[#F4F7F8] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#CBD5E1] border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#C99A4A]'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>[ Coming Soon ]</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceStatus('unavailable')}
                      className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all text-center border flex items-center justify-center gap-1.5 ${
                        serviceStatus === 'unavailable'
                          ? 'bg-[#C75C5C] text-white border-[#C75C5C] shadow-md ring-2 ring-[#C75C5C]/30'
                          : 'bg-[#F4F7F8] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#CBD5E1] border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#C75C5C]'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>[ Unavailable ]</span>
                    </button>
                  </div>
                </div>

                {/* MESSAGE */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                    MESSAGE: <span className="text-[#C75C5C]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={serviceMessage}
                    onChange={e => setServiceMessage(e.target.value)}
                    placeholder="This service is currently unavailable and will be available in the coming days."
                    className="w-full px-4 py-3 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm text-[#1E2933] dark:text-[#E6EDF3] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all resize-y"
                  />
                  <p className="text-[11px] text-[#607080] dark:text-[#7F8C99]">
                    Public notification explaining the service status to visitors in English & Kinyarwanda.
                  </p>
                </div>

                {/* EXPECTED AVAILABILITY */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                    EXPECTED AVAILABILITY: <span className="text-[#C75C5C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceExpectedAvailability}
                    onChange={e => setServiceExpectedAvailability(e.target.value)}
                    placeholder="Coming days (e.g. Mu minsi iri imbere / Coming days)"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all"
                  />
                </div>

                {/* SAVE CHANGES */}
                <button
                  type="submit"
                  disabled={savingService}
                  className="w-full py-4 px-6 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] active:scale-[0.99] text-[#F1F5F9] font-black text-base shadow-[0_4px_20px_rgba(22,160,133,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingService ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Saving Service Status to MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>[ SAVE CHANGES ]</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 2. SOCIAL MEDIA & CONTACT SETTINGS */}
            <div className="bg-white dark:bg-[#182432] p-6 sm:p-10 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-8">
              
              <div className="border-b border-[#D5DEE3] dark:border-[#2A3948] pb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] border border-[#168F7D]/25 dark:border-[#2CBFAE]/30 mb-2">
                  <Share2 className="w-3.5 h-3.5" />
                  Live Contact Channels
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
                  SOCIAL MEDIA & CONTACT SETTINGS
                </h2>
                <p className="text-xs sm:text-sm text-[#607080] dark:text-[#AAB7C4] mt-1">
                  This section controls the contact information shown when users click <strong>Rangisha Ikintu Cyatakaye</strong> or <strong>Natoraguye</strong>. When you click <strong>Save Changes</strong>, the new information immediately takes effect across Rangisha.com.
                </p>
              </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* 1. WhatsApp */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  WhatsApp
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 absolute left-4 top-4 text-[#168F7D] dark:text-[#2CBFAE]" />
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={e => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    placeholder="Example: +250 788 450 120"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#607080] dark:text-[#7F8C99]">
                  Used for instant direct WhatsApp chat links (<code className="font-mono text-[#168F7D] dark:text-[#2CBFAE]">wa.me</code>) when users click "Twandikire Rangisha".
                </p>
              </div>

              {/* 2. Phone Number */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-4 top-4 text-[#168F7D] dark:text-[#2CBFAE]" />
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    placeholder="Example: +250 788 450 120"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all"
                  />
                </div>
              </div>

              {/* 3. Instagram */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  Instagram
                </label>
                <div className="relative">
                  <Share2 className="w-4 h-4 absolute left-4 top-4 text-[#168F7D] dark:text-[#2CBFAE]" />
                  <input
                    type="text"
                    value={settingsForm.instagram}
                    onChange={e => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                    placeholder="Example: @rangisha_rwanda or instagram.com/rangisha_rwanda"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all"
                  />
                </div>
              </div>

              {/* 4. Facebook */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  Facebook
                </label>
                <div className="relative">
                  <Share2 className="w-4 h-4 absolute left-4 top-4 text-[#168F7D] dark:text-[#2CBFAE]" />
                  <input
                    type="text"
                    value={settingsForm.facebook}
                    onChange={e => setSettingsForm({ ...settingsForm, facebook: e.target.value })}
                    placeholder="Example: Rangisha Rwanda Official"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all"
                  />
                </div>
              </div>

              {/* 5. Email */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-4 text-[#168F7D] dark:text-[#2CBFAE]" />
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    placeholder="Example: ishimwefabrice856@gmail.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all"
                  />
                </div>
              </div>

              {/* 6. X / Twitter */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3]">
                  X (Twitter)
                </label>
                <div className="relative">
                  <Share2 className="w-4 h-4 absolute left-4 top-4 text-[#7F8C99]" />
                  <input
                    type="text"
                    value={settingsForm.twitter}
                    onChange={e => setSettingsForm({ ...settingsForm, twitter: e.target.value })}
                    placeholder="Example: heisfabrice1.2"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] text-sm font-semibold text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 transition-all"
                  />
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="pt-4 border-t border-[#D5DEE3] dark:border-[#2A3948]">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-4 px-6 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] active:scale-[0.99] text-[#F1F5F9] font-black text-base shadow-[0_4px_20px_rgba(22,160,133,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {savingSettings ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-[#607080] dark:text-[#7F8C99] mt-2 font-medium">
                  When saved, these channels are immediately updated for all users on Rangisha.com.
                </p>
              </div>

            </form>

            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* REMOVE CONFIRMATION DIALOG MODAL (Requirement #13)       */}
      {/* "Remove this item?"                                      */}
      {/* "Are you sure you want to remove this item from Rangisha.com?"*/}
      {/* Buttons: Cancel | Remove Item                            */}
      {/* ======================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0F1720]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-[#182432] rounded-[16px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-[#D5DEE3] dark:border-[#2A3948] space-y-6">
            
            <div className="w-14 h-14 rounded-2xl bg-[#C75C5C]/15 text-[#C75C5C] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
                Remove this item?
              </h3>
              <p className="text-xs sm:text-sm text-[#607080] dark:text-[#AAB7C4] leading-relaxed">
                Are you sure you want to remove this item from Rangisha.com?
              </p>
            </div>

            {/* Item Preview */}
            <div className="p-4 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-[#EAF0F2] dark:bg-[#111B26] border border-[#D5DEE3] dark:border-[#2A3948] shrink-0 overflow-hidden flex items-center justify-center">
                {itemToDelete.images && itemToDelete.images.length > 0 ? (
                  <img src={itemToDelete.images[0]} alt={itemToDelete.title} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-5 h-5 text-[#7F8C99]" />
                )}
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-sm text-[#1E2933] dark:text-[#F1F5F9] block truncate">
                  {itemToDelete.title}
                </span>
                <span className="text-xs text-[#607080] dark:text-[#AAB7C4] block truncate">
                  {typeof itemToDelete.location === 'string' ? itemToDelete.location : itemToDelete.location?.district}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setItemToDelete(null)}
                className="py-3 px-4 rounded-xl border border-[#D5DEE3] dark:border-[#2A3948] bg-[#EAF0F2] dark:bg-[#1D2A38] hover:bg-[#D5DEE3] dark:hover:bg-[#233344] text-[#1E2933] dark:text-[#D7E0E8] font-bold text-xs sm:text-sm transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmRemoveItem}
                className="py-3 px-4 rounded-xl bg-[#C75C5C] hover:bg-[#b54f4f] text-[#F1F5F9] font-black text-xs sm:text-sm shadow-md shadow-[#C75C5C]/25 flex items-center justify-center gap-2 transition-all"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Item</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}



    </div>
  );
};
