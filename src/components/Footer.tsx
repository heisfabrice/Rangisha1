import React from 'react';
import { 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Clock, 
  ExternalLink,
  ChevronRight,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { SystemSettings } from '../types';

interface FooterProps {
  settings?: SystemSettings;
  setActiveTab: (tab: string) => void;
  onOpenReportLost: () => void;
  onOpenReportFound: () => void;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  setActiveTab,
  onOpenReportLost,
  onOpenReportFound,
  onOpenAdminLogin
}) => {
  const { t } = useTranslation();

  const phone = settings?.contact?.phone || '0794473504';
  const whatsappNum = settings?.contact?.whatsapp || '0736138312';
  const email = settings?.contact?.email || 'ishimwefabrice856@gmail.com';
  const facebookUrl = settings?.contact?.facebook || 'https://www.facebook.com/search/top?q=Heis%20Fabrice';
  const instagramUrl = settings?.contact?.instagram || 'https://instagram.com/dollar.rw';
  const xUrl = settings?.contact?.twitter || 'https://x.com/heisfabrice1.2';
  const office = settings?.contact?.officeAddress || 'KN 3 Rd, CHIC Complex, 3rd Floor, Kigali, Rwanda';
  const hours = settings?.contact?.officeHours || 'Mon - Sat: 8:00 AM - 6:00 PM CAT';

  const cleanWaNumber = whatsappNum.replace(/[^\d]/g, '');
  const intlWa = cleanWaNumber.startsWith('0') ? '25' + cleanWaNumber : (cleanWaNumber.startsWith('250') ? cleanWaNumber : '250' + cleanWaNumber);
  const waLink = `https://wa.me/${intlWa}?text=${encodeURIComponent('Hello Rangisha.com, I would like to get more information about your services.')}`;

  return (
    <footer className="bg-[#111B26] text-[#AAB7C4] border-t border-[#253443] transition-colors">
      {/* Contact Quick Action Bar */}
      <div className="bg-gradient-to-r from-[#0F1720] via-[#141E2A] to-[#0F1720] border-b border-[#253443] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#16A085]/15 text-[#2CBFAE] rounded-xl border border-[#2CBFAE]/30">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[#F1F5F9] font-bold text-base sm:text-lg">
                Ukeneye ubufasha bw'ubuyobozi bwa Rangisha.com?
              </h4>
              <p className="text-[#AAB7C4] text-xs sm:text-sm">
                Ikipe yacu yiteguye kugufasha kugarura ibintu byawe cyangwa kwakira icyatoraguwe.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto">
            {/* Dynamic WhatsApp Button */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>WhatsApp wa.me</span>
            </a>

            {/* Direct Phone Call */}
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#182432] hover:bg-[#1D2A38] text-[#D7E0E8] font-semibold text-xs sm:text-sm border border-[#2A3948] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#2CBFAE] shrink-0" />
              <span>{phone}</span>
            </a>

            {/* Direct Email */}
            <a
              href={`mailto:${email}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#182432] hover:bg-[#1D2A38] text-[#D7E0E8] font-semibold text-xs sm:text-sm border border-[#2A3948] transition-colors"
            >
              <Mail className="w-4 h-4 text-[#2CBFAE] shrink-0" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          
          {/* 1. Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#14232C] flex items-center justify-center text-white overflow-hidden border border-[#2CBFAE]/30 shrink-0 shadow-md">
                <img src="/rangisha-logo.jpg" alt="Rangisha.com Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-2xl text-[#F1F5F9] tracking-tight">
                Rangisha<span className="text-[#2CBFAE]">.com</span>
              </span>
            </div>

            <p className="text-[#AAB7C4] text-xs sm:text-sm leading-relaxed">
              {t('footer.desc')}
            </p>

            <div className="space-y-2 text-xs text-[#AAB7C4]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#2CBFAE] shrink-0 mt-0.5" />
                <span>{office}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2CBFAE] shrink-0" />
                <span>{hours}</span>
              </div>
            </div>
          </div>

          {/* 2. Quick Navigation */}
          <div className="space-y-3">
            <h5 className="text-[#F1F5F9] font-bold text-sm tracking-wider uppercase">
              Imirongo y'Urubuga
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => setActiveTab('home')} className="text-[#AAB7C4] hover:text-[#2CBFAE] flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>HOME (Ahabanza)</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('lost')} className="text-[#AAB7C4] hover:text-[#C75C5C] flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>IBYATAKAYE</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('found')} className="text-[#AAB7C4] hover:text-[#2CBFAE] flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>IBYATORAGUWE</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('missing_people')} className="text-[#AAB7C4] hover:text-[#C75C5C] flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#C75C5C]" />
                  <span>ABABUZE</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('found_people')} className="text-[#AAB7C4] hover:text-[#2CBFAE] flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#2CBFAE]" />
                  <span>ABABONENSE</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('contact')} className="text-[#2CBFAE] hover:underline flex items-center gap-1.5 transition-colors font-bold">
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>Twandikire (Contact Us)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* 3. Categories */}
          <div className="space-y-3">
            <h5 className="text-[#F1F5F9] font-bold text-sm tracking-wider uppercase">
              Ibyiciro By'Ingenzi
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-[#AAB7C4]">
              <li className="hover:text-[#2CBFAE] cursor-pointer" onClick={() => setActiveTab('search')}>
                Indangamuntu (National IDs)
              </li>
              <li className="hover:text-[#2CBFAE] cursor-pointer" onClick={() => setActiveTab('search')}>
                Permis de Conduire (Licenses)
              </li>
              <li className="hover:text-[#2CBFAE] cursor-pointer" onClick={() => setActiveTab('search')}>
                Telefone & Mudasobwa
              </li>
              <li className="hover:text-[#2CBFAE] cursor-pointer" onClick={() => setActiveTab('search')}>
                Amakarita ya Banki (Visa/BK)
              </li>
              <li className="hover:text-[#2CBFAE] cursor-pointer" onClick={() => setActiveTab('search')}>
                Imfunguzo z'Imodoka n'Inzu
              </li>
            </ul>
          </div>

          {/* 4. Trust & Legal */}
          <div className="space-y-3">
            <h5 className="text-[#F1F5F9] font-bold text-sm tracking-wider uppercase">
              {t('footer.legal')}
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => setActiveTab('safety')} className="text-[#AAB7C4] hover:text-[#2CBFAE] flex items-center gap-1.5 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2CBFAE]" />
                  <span>{t('nav.safety')}</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="text-[#AAB7C4] hover:text-[#2CBFAE] flex items-center gap-1.5 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2CBFAE]" />
                  <span>{t('nav.about')}</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('safety')} className="text-[#AAB7C4] hover:text-[#2CBFAE] flex items-center gap-1.5 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2CBFAE]" />
                  <span>{t('footer.terms')}</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('safety')} className="text-[#AAB7C4] hover:text-[#2CBFAE] flex items-center gap-1.5 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2CBFAE]" />
                  <span>{t('footer.privacy')}</span>
                </button>
              </li>
              <li className="pt-2">
                <button 
                  onClick={() => onOpenAdminLogin ? onOpenAdminLogin() : setActiveTab('admin')}
                  className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[#16A085]/10 hover:bg-[#16A085]/20 text-[#2CBFAE] border border-[#2CBFAE]/30 transition-colors"
                >
                  Admin Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* 5. Contact Us (Requirement #1 & #8) */}
          <div className="space-y-3">
            <h5 className="text-[#F1F5F9] font-bold text-sm tracking-wider uppercase">
              Contact Us (Tuvugishe)
            </h5>
            <div className="space-y-2.5 text-xs sm:text-sm">
              
              {/* Hotline */}
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F8C99] block">
                  Hotline
                </span>
                <a 
                  href={`tel:${phone}`} 
                  className="text-[#F1F5F9] hover:text-[#2CBFAE] font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#2CBFAE] shrink-0" />
                  <span>{phone}</span>
                </a>
              </div>

              {/* WhatsApp */}
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F8C99] block">
                  WhatsApp
                </span>
                <a 
                  href={waLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#F1F5F9] hover:text-[#25D366] font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                  <span>{whatsappNum}</span>
                </a>
              </div>

              {/* Email */}
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F8C99] block">
                  Email
                </span>
                <a 
                  href={`mailto:${email}`} 
                  className="text-[#AAB7C4] hover:text-[#2CBFAE] break-all flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#2CBFAE] shrink-0" />
                  <span className="text-xs">{email}</span>
                </a>
              </div>

              {/* Social Media Links */}
              <div className="pt-2 border-t border-[#253443] space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F8C99] block">
                  Social Media
                </span>
                <div className="flex flex-col gap-1 text-xs">
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#CBD5E1] hover:text-[#2CBFAE] flex items-center gap-2 transition-colors py-0.5"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#182432] border border-[#2A3948] text-[#2CBFAE] font-bold text-center leading-5 text-[11px]">f</span>
                    <span>Facebook — <strong>Heis Fabrice</strong></span>
                  </a>

                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#CBD5E1] hover:text-[#2CBFAE] flex items-center gap-2 transition-colors py-0.5"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#182432] border border-[#2A3948] text-[#2CBFAE] font-bold text-center leading-5 text-[11px]">📸</span>
                    <span>Instagram — <strong>dollar.rw</strong></span>
                  </a>

                  <a
                    href={xUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#CBD5E1] hover:text-[#2CBFAE] flex items-center gap-2 transition-colors py-0.5"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#182432] border border-[#2A3948] text-[#2CBFAE] font-bold text-center leading-5 text-[11px]">𝕏</span>
                    <span>X — <strong>heisfabrice1.2</strong></span>
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-[#253443] text-center sm:flex sm:justify-between sm:text-left text-xs text-[#7F8C99]">
          <p>© {new Date().getFullYear()} Rangisha.com Rwanda. {t('footer.rights')}</p>
          <p className="mt-2 sm:mt-0">Designed for Rwanda • Admin Verified Recovery Network</p>
        </div>
      </div>
    </footer>
  );
};
