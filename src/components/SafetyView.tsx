import React from 'react';
import { ShieldCheck, AlertTriangle, Lock, Users, PhoneCall, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export const SafetyView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-[#16A085]/15 dark:bg-[#16A085]/20 text-[#168F7D] dark:text-[#2CBFAE] border border-[#16A085]/30">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
          {t('safety.title')}
        </h1>
        <p className="text-sm text-[#607080] dark:text-[#AAB7C4] max-w-xl mx-auto">
          {t('safety.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        <div className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#C75C5C]/15 text-[#C75C5C] flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="font-bold text-base text-[#1E2933] dark:text-[#F1F5F9]">
            Kwirinda Kwibwa PIN cyangwa Amakuru y'Ibanga
          </h3>
          <p className="text-xs text-[#607080] dark:text-[#AAB7C4] leading-relaxed">
            {t('safety.rule1')}
          </p>
        </div>

        <div className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#C99A4A]/15 text-[#C99A4A] flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="font-bold text-base text-[#1E2933] dark:text-[#F1F5F9]">
            Ntukohereze Amafaranga Y'Igihembo ku Muntu Utazi
          </h3>
          <p className="text-xs text-[#607080] dark:text-[#AAB7C4] leading-relaxed">
            {t('safety.rule2')}
          </p>
        </div>

        <div className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#2CBFAE]/15 text-[#2CBFAE] flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="font-bold text-base text-[#1E2933] dark:text-[#F1F5F9]">
            Guhurira Ahantu Hazwi kandi Hatekanye
          </h3>
          <p className="text-xs text-[#607080] dark:text-[#AAB7C4] leading-relaxed">
            {t('safety.rule3')}
          </p>
        </div>

        <div className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#3BA982]/15 text-[#3BA982] flex items-center justify-center font-bold">
            4
          </div>
          <h3 className="font-bold text-base text-[#1E2933] dark:text-[#F1F5F9]">
            Genzura n'Ubuyobozi bwa Rangisha.com
          </h3>
          <p className="text-xs text-[#607080] dark:text-[#AAB7C4] leading-relaxed">
            {t('safety.rule4')}
          </p>
        </div>

      </div>

      <div className="p-6 rounded-[16px] bg-[#16A085]/10 dark:bg-[#182432] border border-[#16A085]/30 dark:border-[#2A3948] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.18)]">
        <div>
          <h4 className="font-bold text-sm text-[#1E2933] dark:text-[#F1F5F9]">
            Waba ubonye ikintu gikemangwa cyangwa umuntu ushaka kukuriganya?
          </h4>
          <p className="text-xs text-[#607080] dark:text-[#AAB7C4] mt-0.5">
            Bimenyeshe ako kanya ubuyobozi bwa Rangisha.com binyuze kuri numero yacu itishyurwa.
          </p>
        </div>
        <a
          href="tel:+250788450120"
          className="px-5 py-2.5 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-bold text-xs whitespace-nowrap shadow-sm transition-colors"
        >
          Hamagara Hotline
        </a>
      </div>

    </div>
  );
};

