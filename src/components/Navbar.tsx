import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  PlusCircle, 
  Moon, 
  Sun, 
  Monitor,
  Check,
  Menu, 
  X, 
  PhoneCall,
  LayoutDashboard,
  MessageSquare,
  FileCheck,
  Lock,
  LogOut
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { useAuth } from '../lib/auth';
import { SystemSettings } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigateContact: (mode: 'lost' | 'found') => void;
  onOpenReportLost?: () => void;
  onOpenReportFound?: () => void;
  onOpenAdminLogin?: () => void;
  settings?: SystemSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNavigateContact,
  onOpenReportLost,
  onOpenReportFound,
  onOpenAdminLogin,
  settings
}) => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme, isDark } = useTheme();
  const { currentUser, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const hotlineNum = settings?.contact?.phone || '0794473504';
  const whatsappNum = settings?.contact?.whatsapp || '0736138312';
  const cleanWaNumber = whatsappNum.replace(/[^\d]/g, '');
  const waIntlNum = cleanWaNumber.startsWith('0') 
    ? '25' + cleanWaNumber 
    : (cleanWaNumber.startsWith('250') ? cleanWaNumber : '250' + cleanWaNumber);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111B26] backdrop-blur-md border-b border-[#D5DEE3] dark:border-[#253443] transition-colors">
      
      {/* Top Banner */}
      <div className="bg-[#EAF0F2] dark:bg-[#0F1720] text-[#607080] dark:text-[#AAB7C4] text-[11px] sm:text-xs py-1 px-2.5 sm:px-4 text-center font-medium border-b border-[#D5DEE3] dark:border-[#253443] flex items-center justify-center sm:justify-between overflow-x-hidden">
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 flex-wrap max-w-full">
          <span className="hidden md:inline">{t('brand.slogan')}</span>
          <span className="text-[#AAB7C4] hidden md:inline">|</span>
          <a href={`tel:${hotlineNum.replace(/[^\d+]/g, '')}`} className="hover:text-[#168F7D] dark:hover:text-[#2CBFAE] hover:underline flex items-center gap-1 font-bold">
            <PhoneCall className="w-3 h-3 text-[#16A085] dark:text-[#2CBFAE] shrink-0" />
            <span className="whitespace-nowrap">Hotline: {hotlineNum}</span>
          </a>
          <span className="text-[#AAB7C4]">|</span>
          <a 
            href={`https://wa.me/${waIntlNum}?text=${encodeURIComponent('Hello Rangisha.com, I would like to get more information about your services.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#168F7D] dark:hover:text-[#2CBFAE] hover:underline flex items-center gap-1 font-bold text-[#168F7D] dark:text-[#2CBFAE]"
          >
            <MessageSquare className="w-3 h-3 shrink-0" />
            <span className="whitespace-nowrap">WhatsApp: {whatsappNum}</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-1.5 sm:gap-2">
          
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#14232C] flex items-center justify-center text-white shadow-md shadow-[#16A085]/20 overflow-hidden border border-[#2CBFAE]/30 shrink-0">
              <img 
                src="/rangisha-logo.jpg" 
                alt="Rangisha.com Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-base sm:text-2xl tracking-tight text-[#1E2933] dark:text-[#F1F5F9] whitespace-nowrap">
                  Rangisha<span className="text-[#168F7D] dark:text-[#2CBFAE]">.com</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-black px-1 sm:px-1.5 py-0.5 rounded bg-[#16A085]/15 text-[#168F7D] dark:bg-[#2CBFAE]/15 dark:text-[#2CBFAE] border border-[#168F7D]/30 dark:border-[#2CBFAE]/30">
                  RW
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#607080] dark:text-[#AAB7C4] font-medium hidden md:block">
                Admin-Controlled & Verified
              </p>
            </div>
          </div>

          {/* Nav links (The 5 Public Structure Tabs) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'text-[#168F7D] dark:text-[#2CBFAE] bg-[#168F7D]/10 dark:bg-[rgba(44,191,174,0.12)] border border-[#168F7D]/20 dark:border-[#2CBFAE]/30'
                  : 'text-[#607080] dark:text-[#CBD5E1] hover:text-[#168F7D] dark:hover:text-[#2CBFAE] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              HOME
            </button>

            <button
              onClick={() => setActiveTab('lost')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                activeTab === 'lost'
                  ? 'text-[#C75C5C] bg-[#C75C5C]/10 border border-[#C75C5C]/30'
                  : 'text-[#607080] dark:text-[#CBD5E1] hover:text-[#C75C5C] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              IBYATAKAYE
            </button>

            <button
              onClick={() => setActiveTab('found')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                activeTab === 'found'
                  ? 'text-[#168F7D] dark:text-[#2CBFAE] bg-[#168F7D]/10 dark:bg-[rgba(44,191,174,0.12)] border border-[#168F7D]/20 dark:border-[#2CBFAE]/30'
                  : 'text-[#607080] dark:text-[#CBD5E1] hover:text-[#168F7D] dark:hover:text-[#2CBFAE] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              IBYATORAGUWE
            </button>

            <button
              onClick={() => setActiveTab('missing_people')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'missing_people'
                  ? 'text-[#C75C5C] bg-[#C75C5C]/10 border border-[#C75C5C]/30 font-bold'
                  : 'text-[#607080] dark:text-[#CBD5E1] hover:text-[#C75C5C] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#C75C5C] animate-pulse" />
              <span>ABABUZE</span>
            </button>

            <button
              onClick={() => setActiveTab('found_people')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                activeTab === 'found_people'
                  ? 'text-[#168F7D] dark:text-[#2CBFAE] bg-[#168F7D]/10 dark:bg-[rgba(44,191,174,0.12)] border border-[#168F7D]/20 dark:border-[#2CBFAE]/30'
                  : 'text-[#607080] dark:text-[#CBD5E1] hover:text-[#168F7D] dark:hover:text-[#2CBFAE] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              ABABONENSE
            </button>

            <button
              onClick={() => onNavigateContact('lost')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all ${
                activeTab === 'contact'
                  ? 'text-[#168F7D] dark:text-[#2CBFAE] bg-[#168F7D]/10 dark:bg-[rgba(44,191,174,0.12)] border border-[#168F7D]/20 dark:border-[#2CBFAE]/30'
                  : 'text-[#607080] dark:text-[#CBD5E1] hover:text-[#168F7D] dark:hover:text-[#2CBFAE] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#16A085] dark:text-[#2CBFAE]" />
                Twandikire
              </span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Language toggle */}
            <div className="flex items-center bg-[#EAF0F2] dark:bg-[#182432] rounded-lg p-0.5 border border-[#D5DEE3] dark:border-[#2A3948]">
              <button
                onClick={() => setLanguage('rw')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-md transition-colors ${
                  language === 'rw' ? 'bg-[#16A085] text-[#F1F5F9] shadow-sm' : 'text-[#607080] dark:text-[#AAB7C4]'
                }`}
              >
                RW
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-md transition-colors ${
                  language === 'en' ? 'bg-[#16A085] text-[#F1F5F9] shadow-sm' : 'text-[#607080] dark:text-[#AAB7C4]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Selector (Requirement #18: Dark Mode, Light Mode, System Mode) */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="p-1 sm:p-2 text-[#607080] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432] rounded-lg border border-[#D5DEE3] dark:border-[#2A3948] transition-colors flex items-center gap-1"
                title={`Theme: ${theme === 'dark' ? 'Dark Mode' : theme === 'light' ? 'Light Mode' : 'System Mode'}`}
                aria-label="Toggle theme menu"
              >
                {theme === 'system' ? (
                  <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#168F7D] dark:text-[#2CBFAE]" />
                ) : isDark ? (
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2CBFAE]" />
                ) : (
                  <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C99A4A]" />
                )}
                <span className="text-[11px] font-bold capitalize hidden md:inline text-[#1E2933] dark:text-[#E6EDF3]">
                  {theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}
                </span>
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-[#182432] shadow-xl border border-[#D5DEE3] dark:border-[#2A3948] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7F8C99]">
                    Inyandiko (Theme)
                  </div>
                  <button
                    onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#EAF0F2] dark:hover:bg-[#1D2A38] flex items-center justify-between transition-colors ${
                      theme === 'dark' ? 'text-[#16A085] dark:text-[#2CBFAE] bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)]' : 'text-[#1E2933] dark:text-[#E6EDF3]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark Mode (Default)</span>
                    </span>
                    {theme === 'dark' && <Check className="w-3.5 h-3.5 text-[#2CBFAE]" />}
                  </button>
                  <button
                    onClick={() => { setTheme('light'); setThemeMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#EAF0F2] dark:hover:bg-[#1D2A38] flex items-center justify-between transition-colors ${
                      theme === 'light' ? 'text-[#16A085] dark:text-[#2CBFAE] bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)]' : 'text-[#1E2933] dark:text-[#E6EDF3]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Sun className="w-3.5 h-3.5 text-[#C99A4A]" />
                      <span>Light Mode</span>
                    </span>
                    {theme === 'light' && <Check className="w-3.5 h-3.5 text-[#2CBFAE]" />}
                  </button>
                  <button
                    onClick={() => { setTheme('system'); setThemeMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#EAF0F2] dark:hover:bg-[#1D2A38] flex items-center justify-between transition-colors ${
                      theme === 'system' ? 'text-[#16A085] dark:text-[#2CBFAE] bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)]' : 'text-[#1E2933] dark:text-[#E6EDF3]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Monitor className="w-3.5 h-3.5 text-[#7F8C99]" />
                      <span>System Mode</span>
                    </span>
                    {theme === 'system' && <Check className="w-3.5 h-3.5 text-[#2CBFAE]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Admin Console / Admin Login Button */}
            {isAdmin ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-black shadow-sm transition-all ${
                    activeTab === 'admin'
                      ? 'bg-[#2CBFAE] text-[#0F1720]'
                      : 'bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9]'
                  }`}
                  title="Admin Console"
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Admin Console</span>
                  <span className="sm:hidden text-[11px]">Admin</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setActiveTab('home');
                  }}
                  className="px-2 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold text-[#C75C5C] hover:bg-[#C75C5C]/10 border border-[#C75C5C]/30 transition-colors flex items-center gap-1"
                  title="Logout from Admin Console"
                  aria-label="Logout from Admin Console"
                >
                  <LogOut className="w-3 h-3 shrink-0" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAdminLogin ? onOpenAdminLogin() : setActiveTab('admin')}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-lg bg-[#EAF0F2] dark:bg-[#182432] text-[#1E2933] dark:text-[#CBD5E1] hover:text-[#168F7D] dark:hover:text-[#2CBFAE] border border-[#D5DEE3] dark:border-[#2A3948] transition-colors"
                title="Admin Console"
              >
                <Lock className="w-3.5 h-3.5 text-[#16A085] dark:text-[#2CBFAE] shrink-0" />
                <span className="hidden sm:inline">Admin Console</span>
                <span className="sm:hidden text-[11px]">Admin</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 sm:p-2 rounded-lg text-[#607080] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D5DEE3] dark:border-[#253443] bg-white dark:bg-[#111B26] px-4 pt-3 pb-6 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
          
          {/* Direct Hotline & WhatsApp Mobile Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${hotlineNum.replace(/[^\d+]/g, '')}`}
              className="py-2.5 px-3 text-center text-xs font-bold rounded-xl bg-[#EAF0F2] dark:bg-[#182432] text-[#1E2933] dark:text-[#E6EDF3] border border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#16A085] dark:text-[#2CBFAE]" />
              <span>Hotline: {hotlineNum}</span>
            </a>
            <a
              href={`https://wa.me/${waIntlNum}?text=${encodeURIComponent('Hello Rangisha.com, I would like to get more information about your services.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 text-center text-xs font-bold rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#D5DEE3] dark:border-[#253443]">
            <button
              onClick={() => { onNavigateContact('lost'); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 text-center text-xs font-black rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] shadow-sm transition-colors"
            >
              Twandikire Admin
            </button>
            <button
              onClick={() => { setActiveTab('search'); setMobileMenuOpen(false); }}
              className="py-2.5 px-3 text-center text-xs font-black rounded-xl bg-[#EAF0F2] dark:bg-[#182432] text-[#1E2933] dark:text-[#E6EDF3] border border-[#D5DEE3] dark:border-[#2A3948] transition-colors"
            >
              Shakisha Ibintu
            </button>
          </div>

          <div className="flex flex-col space-y-1 text-sm font-semibold">
            <button
              onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
              className={`text-left px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'home' ? 'bg-[#16A085]/15 text-[#168F7D] dark:text-[#2CBFAE] font-bold' : 'text-[#1E2933] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              HOME (Ahabanza)
            </button>
            <button
              onClick={() => { setActiveTab('lost'); setMobileMenuOpen(false); }}
              className={`text-left px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'lost' ? 'bg-[#C75C5C]/15 text-[#C75C5C] font-bold' : 'text-[#1E2933] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              IBYATAKAYE (Lost Items)
            </button>
            <button
              onClick={() => { setActiveTab('found'); setMobileMenuOpen(false); }}
              className={`text-left px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'found' ? 'bg-[#16A085]/15 text-[#168F7D] dark:text-[#2CBFAE] font-bold' : 'text-[#1E2933] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              IBYATORAGUWE (Found Items)
            </button>
            <button
              onClick={() => { setActiveTab('missing_people'); setMobileMenuOpen(false); }}
              className={`text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
                activeTab === 'missing_people' ? 'bg-[#C75C5C]/15 text-[#C75C5C] font-bold' : 'text-[#1E2933] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              <span>ABABUZE</span>
              <span className="w-2 h-2 rounded-full bg-[#C75C5C] animate-pulse" />
            </button>
            <button
              onClick={() => { setActiveTab('found_people'); setMobileMenuOpen(false); }}
              className={`text-left px-3 py-2 rounded-xl transition-colors ${
                activeTab === 'found_people' ? 'bg-[#16A085]/15 text-[#168F7D] dark:text-[#2CBFAE] font-bold' : 'text-[#1E2933] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]'
              }`}
            >
              ABABONENSE (Found People)
            </button>
            <button
              onClick={() => { onNavigateContact('lost'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-xl text-[#168F7D] dark:text-[#2CBFAE] font-bold hover:bg-[#EAF0F2] dark:hover:bg-[#182432]"
            >
              Twandikire (Contact Admin)
            </button>
            
            {isAdmin ? (
              <div className="pt-2 border-t border-[#D5DEE3] dark:border-[#253443] space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[#168F7D] dark:text-[#2CBFAE] font-bold hover:bg-[#EAF0F2] dark:hover:bg-[#182432] flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Ibiro by'Ubuyobozi (Admin Console)</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setActiveTab('home');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[#C75C5C] font-bold hover:bg-[#C75C5C]/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sohoka mu buyobozi (Logout Admin)</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAdminLogin) onOpenAdminLogin();
                  else setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-xl text-[#168F7D] dark:text-[#2CBFAE] font-bold hover:bg-[#EAF0F2] dark:hover:bg-[#182432] flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Admin Console (Injira)</span>
              </button>
            )}

            <button
              onClick={() => { setActiveTab('safety'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2 rounded-xl text-[#1E2933] dark:text-[#CBD5E1] hover:bg-[#EAF0F2] dark:hover:bg-[#182432]"
            >
              Umutekano (Safety)
            </button>
          </div>

          {/* Mobile Theme Selector */}
          <div className="pt-3 border-t border-[#D5DEE3] dark:border-[#253443] space-y-1.5">
            <div className="text-[11px] font-bold text-[#7F8C99] uppercase tracking-wider px-1">
              Inyandiko (Theme)
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#EAF0F2] dark:bg-[#141E2A] rounded-xl border border-[#D5DEE3] dark:border-[#2A3948]">
              <button
                onClick={() => setTheme('dark')}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'dark'
                    ? 'bg-[#16A085] text-white shadow-sm'
                    : 'text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'light'
                    ? 'bg-[#16A085] text-white shadow-sm'
                    : 'text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'system'
                    ? 'bg-[#16A085] text-white shadow-sm'
                    : 'text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Auto</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
