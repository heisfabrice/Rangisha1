import React from 'react';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Lock,
  ExternalLink,
  ChevronRight,
  Share2,
  CheckCircle2,
  Send,
  AlertCircle,
  Coins
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { SystemSettings } from '../types';
import { OfficeServiceNotice } from './OfficeServiceNotice';

interface ContactAdminViewProps {
  settings?: SystemSettings;
  prefilledItemTitle?: string;
  prefilledReportId?: string;
}

export const ContactAdminView: React.FC<ContactAdminViewProps> = ({
  settings,
  prefilledItemTitle,
  prefilledReportId
}) => {
  const { t, language } = useTranslation();

  // Dynamic Contact info from Admin Settings (controlled from Admin Dashboard, never hard-coded)
  const adminPhone = settings?.contact?.phone || '0794473504';
  const rawWaNum = settings?.contact?.whatsapp || '0736138312';
  const cleanWaNumber = rawWaNum.replace(/[^\d]/g, '');
  const adminEmail = settings?.contact?.email || 'ishimwefabrice856@gmail.com';
  const facebookUrl = settings?.contact?.facebook || 'https://www.facebook.com/search/top?q=Heis%20Fabrice';
  const instagramUrl = settings?.contact?.instagram || 'https://instagram.com/dollar.rw';
  const xUrl = settings?.contact?.twitter || 'https://x.com/heisfabrice1.2';
  const office = settings?.contact?.officeAddress || 'KN 3 Rd, CHIC Complex, 3rd Floor, Kigali, Rwanda';
  const hours = settings?.contact?.officeHours || 'Kuwa Mbere - Kuwa Gatandatu: 8:00 AM - 6:00 PM CAT';

  // Dynamic WhatsApp prefilled text
  const waMessageText = prefilledReportId
    ? `Hello Rangisha.com, I have information regarding item ${prefilledReportId}: ${prefilledItemTitle || ''}.`
    : `Hello Rangisha.com, I would like to get more information about your services.`;

  const intlWa = cleanWaNumber.startsWith('0') ? '25' + cleanWaNumber : (cleanWaNumber.startsWith('250') ? cleanWaNumber : '250' + cleanWaNumber);
  const waLink = `https://wa.me/${intlWa}?text=${encodeURIComponent(waMessageText)}`;

  const emailSubject = prefilledReportId 
    ? `Amakuru ku Kintu ${prefilledReportId} - Rangisha.com` 
    : 'Inquiry - Rangisha.com';

  const emailLink = `mailto:${adminEmail}?subject=${encodeURIComponent(emailSubject)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      {/* Title & Core Subtitle from Specification */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] text-xs font-black border border-[#168F7D]/25 dark:border-[#2CBFAE]/30 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#168F7D] dark:text-[#2CBFAE]" />
          <span>Ibiro by'Ubuyobozi bwa Rangisha.com • Official Admin Channels</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[#1E2933] dark:text-[#F1F5F9] tracking-tight">
          Twandikire kuri Rangisha.com
        </h1>

        <p className="text-sm sm:text-base text-[#607080] dark:text-[#AAB7C4] leading-relaxed font-medium">
          Sobanura icyo wabuze cyangwa icyo watoraguye. Abakozi bacu bazagufasha kugenzura amakuru no kuyashyira kuri Rangisha.com niba byemejwe.
        </p>

        <p className="text-xs text-[#7F8C99] italic">
          (Contact Rangisha.com Admin — Explain what you lost or found. Our officers will verify and publish your listing once approved.)
        </p>
      </div>

      {/* Admin Controlled Guarantee Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#C99A4A]/10 border border-[#C99A4A]/30 flex items-start gap-3 text-xs text-[#C99A4A]">
        <Lock className="w-5 h-5 text-[#C99A4A] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold text-sm block">Urubuga rugengwa 100% n'Ubuyobozi (Admin-Controlled Platform)</span>
          <p className="leading-relaxed text-[#607080] dark:text-[#AAB7C4]">
            Kuri Rangisha.com, nta muntu ushyira amakuru ku rubuga rweruye mu buryo bwigenga. Amakuru yose asuzumwa n'abakozi b'ubuyobozi bwa Rangisha, hakagenzurwa niba ari ukuri, bityo ibyemejwe bikaba aribyo bishyirwa ku mugaragaro.
          </p>
        </div>
      </div>

      {/* Service Fee Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border-2 border-amber-500/35 dark:border-amber-400/30 flex items-start sm:items-center gap-3.5 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Coins className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider">
            <span>Icyitonderwa cy'Ingenzi</span>
          </div>
          <p className="text-sm sm:text-base font-extrabold text-[#1E2933] dark:text-[#F1F5F9] leading-snug">
            "service hanto irishyurwa mugihe ukeneye ko tugufasha"
          </p>
          <p className="text-xs text-[#607080] dark:text-[#AAB7C4]">
            (Iyi serivisi yishyurwa ikiguzi gito cy'ubufasha mugihe ukeneye ko ubuyobozi bwa Rangisha bugufasha gushakisha cyangwa gutangaza.)
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* RANGISHA OFFICIAL SOCIAL MEDIAS & CONTACT CHANNELS */}
      {/* ================================================= */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
            Imbuga Nkoranyambaga n'Imirongo ya Rangisha.com (Social Media & Official Channels)
          </h2>
          <p className="text-xs sm:text-sm text-[#607080] dark:text-[#AAB7C4] mt-1 max-w-xl mx-auto">
            Kanda kuri rimwe mu mashami akurikira ngo uhite uvugana n'abakozi ba Rangisha.com ku mbuga nkoranyambaga no ku mirongo yemewe
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* 1. WhatsApp Button (Primary) */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-[16px] bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] shadow-[0_4px_20px_rgba(22,160,133,0.25)] transition-all hover:scale-[1.02] flex flex-col justify-between space-y-4 group border border-[#2CBFAE]/30"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white">
                <MessageSquare className="w-8 h-8 text-[#F1F5F9]" />
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-[#F1F5F9] text-[11px] font-bold tracking-wider uppercase">
                Yihuse Cyane
              </span>
            </div>

            <div>
              <h3 className="font-black text-xl text-[#F1F5F9]">Chat kuri WhatsApp</h3>
              <p className="text-xs text-[#E6EDF3]/85 mt-1">
                Ohereza ubutumwa, amafoto n'aho ikintu cyabereye ako kanya.
              </p>
            </div>

            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-bold text-[#F1F5F9]">
              <span>Fungura WhatsApp</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* 2. Direct Phone Call */}
          <a
            href={`tel:${adminPhone.replace(/[^\d+]/g, '')}`}
            className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#16A085] dark:hover:border-[#2CBFAE] shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.02] flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#16A085]/15 text-[#168F7D] dark:text-[#2CBFAE] flex items-center justify-center">
                <Phone className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] border border-[#168F7D]/20 text-[11px] font-bold uppercase">
                Hotline
              </span>
            </div>

            <div>
              <h3 className="font-black text-xl text-[#1E2933] dark:text-[#F1F5F9]">Hamagara Rangisha</h3>
              <p className="text-xs font-mono text-[#168F7D] dark:text-[#2CBFAE] font-bold mt-1 text-base">
                {adminPhone}
              </p>
            </div>

            <div className="pt-2 border-t border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-between text-xs font-bold text-[#607080] dark:text-[#AAB7C4] group-hover:text-[#168F7D] dark:group-hover:text-[#2CBFAE]">
              <span>Hamagara nonaha</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* 3. Official Email */}
          <a
            href={emailLink}
            className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#2CBFAE] shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.02] flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#2CBFAE]/15 text-[#168F7D] dark:text-[#2CBFAE] flex items-center justify-center">
                <Mail className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#2CBFAE]/15 text-[#168F7D] dark:text-[#2CBFAE] text-[11px] font-bold uppercase">
                Official Email
              </span>
            </div>

            <div>
              <h3 className="font-black text-xl text-[#1E2933] dark:text-[#F1F5F9]">Ohereza Email</h3>
              <p className="text-xs text-[#607080] dark:text-[#AAB7C4] mt-1 font-mono">
                {adminEmail}
              </p>
            </div>

            <div className="pt-2 border-t border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-between text-xs font-bold text-[#607080] dark:text-[#AAB7C4] group-hover:text-[#2CBFAE]">
              <span>Andikira Ubuyobozi</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* 4. Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#2CBFAE] shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.02] flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#16A085]/15 text-[#2CBFAE] flex items-center justify-center text-2xl font-black">
                f
              </div>
              <span className="px-3 py-1 rounded-full bg-[#16A085]/10 text-[#2CBFAE] text-[11px] font-bold uppercase">
                Facebook
              </span>
            </div>

            <div>
              <h3 className="font-black text-xl text-[#1E2933] dark:text-[#F1F5F9]">Facebook</h3>
              <p className="text-xs font-bold text-[#168F7D] dark:text-[#2CBFAE] mt-1 text-base">
                Heis Fabrice
              </p>
              <p className="text-xs text-[#607080] dark:text-[#AAB7C4] mt-0.5">
                Official Facebook Profile • Kanda hano ukurikirane
              </p>
            </div>

            <div className="pt-2 border-t border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-between text-xs font-bold text-[#607080] dark:text-[#AAB7C4] group-hover:text-[#2CBFAE]">
              <span>Fungura Facebook</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* 5. Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#2CBFAE] shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.02] flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#16A085]/15 text-[#2CBFAE] flex items-center justify-center text-2xl font-black">
                📸
              </div>
              <span className="px-3 py-1 rounded-full bg-[#16A085]/10 text-[#2CBFAE] text-[11px] font-bold uppercase">
                Instagram
              </span>
            </div>

            <div>
              <h3 className="font-black text-xl text-[#1E2933] dark:text-[#F1F5F9]">Instagram</h3>
              <p className="text-xs font-bold text-[#168F7D] dark:text-[#2CBFAE] mt-1 text-base">
                dollar.rw
              </p>
              <p className="text-xs text-[#607080] dark:text-[#AAB7C4] mt-0.5">
                Official Instagram Profile • Kanda hano ukurikirane
              </p>
            </div>

            <div className="pt-2 border-t border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-between text-xs font-bold text-[#607080] dark:text-[#AAB7C4] group-hover:text-[#2CBFAE]">
              <span>Fungura Instagram</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* 6. X (Twitter) */}
          <a
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#2CBFAE] shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.02] flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#EAF0F2] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#E6EDF3] border border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-center text-2xl font-black">
                𝕏
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EAF0F2] dark:bg-[#141E2A] text-[#607080] dark:text-[#AAB7C4] border border-[#D5DEE3] dark:border-[#2A3948] text-[11px] font-bold uppercase">
                X (Twitter)
              </span>
            </div>

            <div>
              <h3 className="font-black text-xl text-[#1E2933] dark:text-[#F1F5F9]">X (Twitter)</h3>
              <p className="text-xs font-bold text-[#168F7D] dark:text-[#2CBFAE] mt-1 text-base">
                heisfabrice1.2
              </p>
              <p className="text-xs text-[#607080] dark:text-[#AAB7C4] mt-0.5">
                Official X Profile • Kanda hano ukurikirane
              </p>
            </div>

            <div className="pt-2 border-t border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-between text-xs font-bold text-[#607080] dark:text-[#AAB7C4] group-hover:text-[#2CBFAE]">
              <span>Kurikira kuri 𝕏</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

        </div>
      </div>

      {/* Physical Office Address & Working Hours Section (with Coming Soon / Service Availability) */}
      <OfficeServiceNotice
        service={settings?.service}
        officeAddress={office}
        officeHours={hours}
        hotline={adminPhone}
        whatsapp={rawWaNum}
      />

    </div>
  );
};
