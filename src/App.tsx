import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './lib/theme';
import { I18nProvider, useTranslation } from './lib/i18n';
import { AuthProvider, useAuth } from './lib/auth';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { ContactAdminView } from './components/ContactAdminView';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { SafetyView } from './components/SafetyView';
import { AboutView } from './components/AboutView';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ReportSuspiciousModal } from './components/ReportSuspiciousModal';
import { RecoveryModal } from './components/RecoveryModal';
import { ReportLostModal } from './components/ReportLostModal';
import { ReportFoundModal } from './components/ReportFoundModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminLoginView } from './components/AdminLoginView';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PublishedItem, SystemSettings } from './types';
import { api } from './lib/api';
import { CheckCircle2 } from 'lucide-react';

function MainApp() {
  const { isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [settings, setSettings] = useState<SystemSettings | undefined>();

  // Contact Admin Mode & Prefilled info
  const [contactMode, setContactMode] = useState<'lost' | 'found' | 'missing_person' | 'found_person'>('lost');
  const [contactPrefilledItem, setContactPrefilledItem] = useState<{ title?: string; reportId?: string }>({});

  // Search view parameters
  const [searchParams, setSearchParams] = useState<{
    type?: 'all' | 'lost' | 'found' | 'missing_person' | 'found_person';
    category?: string;
    district?: string;
    q?: string;
  }>({ type: 'all', category: 'all', district: 'all', q: '' });

  // Modals state
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<PublishedItem | null>(null);
  const [itemForSuspiciousReport, setItemForSuspiciousReport] = useState<PublishedItem | null>(null);
  const [recoveryModalItem, setRecoveryModalItem] = useState<PublishedItem | null>(null);
  const [reportLostOpen, setReportLostOpen] = useState(false);
  const [reportFoundOpen, setReportFoundOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadSettings = () => {
    api.getSettings().then(setSettings).catch(console.error);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleNavigateContact = (mode: 'lost' | 'found' | 'missing_person' | 'found_person', prefilled?: { title?: string; reportId?: string }) => {
    setContactMode(mode);
    setContactPrefilledItem(prefilled || {});
    setActiveTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSearch = (params?: { category?: string; district?: string; q?: string; type?: 'all' | 'lost' | 'found' | 'missing_person' | 'found_person' }) => {
    if (params) {
      setSearchParams(prev => ({ ...prev, ...params }));
    }
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHaveInformation = (item: PublishedItem) => {
    setSelectedItemForDetail(null);
    handleNavigateContact(item.type, { title: item.title, reportId: item.reportId });
  };

  const handleReportSuspicious = (item: PublishedItem) => {
    setSelectedItemForDetail(null);
    setItemForSuspiciousReport(item);
  };

  const handleOpenRecoveryClaim = (item: PublishedItem) => {
    setSelectedItemForDetail(null);
    setRecoveryModalItem(item);
  };

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-[#F4F7F8] dark:bg-[#0F1720] text-[#1E2933] dark:text-[#E6EDF3] selection:bg-[#16A085] selection:text-[#F1F5F9] transition-colors duration-200 font-sans">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#182432] text-[#1E2933] dark:text-[#F1F5F9] px-5 py-3.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-[#D5DEE3] dark:border-[#2A3948] flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-[#3BA982] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateContact={handleNavigateContact}
        onOpenReportLost={() => setReportLostOpen(true)}
        onOpenReportFound={() => setReportFoundOpen(true)}
        onOpenAdminLogin={() => setAdminLoginOpen(true)}
        settings={settings}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            settings={settings}
            onNavigateContact={handleNavigateContact}
            onNavigateSearch={handleNavigateSearch}
            onViewDetails={setSelectedItemForDetail}
            onHaveInformation={handleHaveInformation}
            onOpenReportLost={() => setReportLostOpen(true)}
            onOpenReportFound={() => setReportFoundOpen(true)}
          />
        )}

        {activeTab === 'contact' && (
          <ContactAdminView
            settings={settings}
            prefilledItemTitle={contactPrefilledItem.title}
            prefilledReportId={contactPrefilledItem.reportId}
          />
        )}

        {activeTab === 'lost' && (
          <SearchView
            key="lost"
            initialType="lost"
            initialCategory="all"
            initialDistrict="all"
            initialQuery=""
            onViewDetails={setSelectedItemForDetail}
            onHaveInformation={handleHaveInformation}
            onNavigateContact={handleNavigateContact}
          />
        )}

        {activeTab === 'found' && (
          <SearchView
            key="found"
            initialType="found"
            initialCategory="all"
            initialDistrict="all"
            initialQuery=""
            onViewDetails={setSelectedItemForDetail}
            onHaveInformation={handleHaveInformation}
            onNavigateContact={handleNavigateContact}
          />
        )}

        {activeTab === 'missing_people' && (
          <SearchView
            key="missing_people"
            initialType="missing_person"
            initialCategory="all"
            initialDistrict="all"
            initialQuery=""
            onViewDetails={setSelectedItemForDetail}
            onHaveInformation={handleHaveInformation}
            onNavigateContact={handleNavigateContact}
          />
        )}

        {activeTab === 'found_people' && (
          <SearchView
            key="found_people"
            initialType="found_person"
            initialCategory="all"
            initialDistrict="all"
            initialQuery=""
            onViewDetails={setSelectedItemForDetail}
            onHaveInformation={handleHaveInformation}
            onNavigateContact={handleNavigateContact}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            key="search"
            initialType={searchParams.type}
            initialCategory={searchParams.category}
            initialDistrict={searchParams.district}
            initialQuery={searchParams.q}
            onViewDetails={setSelectedItemForDetail}
            onHaveInformation={handleHaveInformation}
            onNavigateContact={handleNavigateContact}
          />
        )}

        {activeTab === 'dashboard' && (
          <UserDashboard
            onNavigateContact={handleNavigateContact}
            onViewDetails={setSelectedItemForDetail}
            onOpenReportLost={() => setReportLostOpen(true)}
            onOpenReportFound={() => setReportFoundOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard onLogout={() => { logout(); setActiveTab('home'); }} />
          ) : (
            <AdminLoginView
              onLoginSuccess={() => {
                setActiveTab('admin');
                showToast('Winjiye muri Admin Console mu mutekano!');
              }}
              onBackToHome={() => setActiveTab('home')}
            />
          )
        )}

        {activeTab === 'safety' && <SafetyView />}

        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        setActiveTab={tab => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReportLost={() => setReportLostOpen(true)}
        onOpenReportFound={() => setReportFoundOpen(true)}
        onOpenAdminLogin={() => setAdminLoginOpen(true)}
      />

      {/* ================================== */}
      {/* GLOBAL MODALS */}
      {/* ================================== */}

      {/* 1. Item Detail Modal */}
      {selectedItemForDetail && (
        <ItemDetailModal
          item={selectedItemForDetail}
          settings={settings}
          onClose={() => setSelectedItemForDetail(null)}
          onHaveInformation={handleHaveInformation}
          onReportSuspicious={handleReportSuspicious}
          onOpenRecovery={handleOpenRecoveryClaim}
        />
      )}

      {/* 2. Report Suspicious Listing Modal */}
      {itemForSuspiciousReport && (
        <ReportSuspiciousModal
          item={itemForSuspiciousReport as any}
          onClose={() => setItemForSuspiciousReport(null)}
        />
      )}

      {/* 3. "RANGISHA" / "Iyi ni iyanjye" Recovery Claim Modal */}
      {recoveryModalItem && (
        <RecoveryModal
          item={recoveryModalItem}
          onClose={() => setRecoveryModalItem(null)}
          onSuccess={reqId => {
            showToast(`Icyifuzo cyo kugarura (${reqId}) cyakiriwe n'ubuyobozi bwa Rangisha.com!`);
          }}
        />
      )}

      {/* 4. Report Lost Item Modal */}
      <ReportLostModal
        isOpen={reportLostOpen}
        onClose={() => setReportLostOpen(false)}
        onSuccess={reportId => {
          showToast(`Raporo y'icyatakaye ${reportId} yakiriwe neza kuri Rangisha.com!`);
        }}
      />

      {/* 5. Report Found Item Modal */}
      <ReportFoundModal
        isOpen={reportFoundOpen}
        onClose={() => setReportFoundOpen(false)}
        onSuccess={reportId => {
          showToast(`Raporo y'icyatoraguwe ${reportId} yakiriwe neza kuri Rangisha.com!`);
        }}
      />

      {/* 6. Admin Login Modal (/admin/login) */}
      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setActiveTab('admin');
          showToast('Winjiye muri Admin Console mu mutekano!');
        }}
      />

      {/* 7. Floating WhatsApp Contact Button (Req #9) */}
      <FloatingWhatsApp phone={settings?.contact?.whatsapp || '0736138312'} />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
