import React from 'react';
import { ShieldCheck, HeartHandshake, Award, Sparkles, MapPin } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export const AboutView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      <div className="text-center space-y-3">
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#168F7D] dark:text-[#2CBFAE]">
          Ubutumwa n'Intego yacu
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
          Ibyerekeye Rangisha.com
        </h1>
        <p className="text-sm sm:text-base text-[#607080] dark:text-[#AAB7C4] max-w-2xl mx-auto leading-relaxed">
          Rangisha.com ni ikoranabuhanga ry'igihugu ry'u Rwanda ryashyizweho kugira ngo buri Munyarwanda watakaje ikintu cy'agaciro (indangamuntu, mudasobwa, telefone, amakarita ya banki, cyangwa ibindi byangombwa) akibone mu buryo bwihuse, bworoshye kandi butekanye.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#16A085]/15 text-[#16A085] dark:text-[#2CBFAE] mx-auto flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-[#1E2933] dark:text-[#F1F5F9]">Ubunyangamugayo</h3>
          <p className="text-xs text-[#607080] dark:text-[#AAB7C4] leading-relaxed">
            Duteza imbere umuco w'Ubunyangamugayo n'Ubutwari mu gusubiza ibyatoraguwe binyuze mu bihembo bisobanutse.
          </p>
        </div>

        <div className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#2CBFAE]/15 text-[#2CBFAE] mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-[#1E2933] dark:text-[#F1F5F9]">Kwizera n'Umutekano</h3>
          <p className="text-xs text-[#607080] dark:text-[#AAB7C4] leading-relaxed">
            Ibisabwa byose binyuzwa mu kugenzura ubunyiracyo bwa nyir'ikintu mbere yo guhura cyangwa gushyikirizwa ikintu.
          </p>
        </div>

        <div className="p-6 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#16A085]/15 text-[#16A085] dark:text-[#2CBFAE] mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-[#1E2933] dark:text-[#F1F5F9]">Ikoranabuhanga Rishya</h3>
          <p className="text-xs text-[#607080] dark:text-[#AAB7C4] leading-relaxed">
            Ikoranabuhanga rya Smart Matching riguhuza byikora n'uwabonye ikintu cyawe mu masaha make cyane.
          </p>
        </div>

      </div>

      <div className="p-8 rounded-[16px] bg-[#141E2A] text-[#F1F5F9] border border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-4">
        <h3 className="text-xl font-bold text-[#F1F5F9]">Imikorere y'Ibihembo na Komisiyo</h3>
        <p className="text-xs sm:text-sm text-[#AAB7C4] leading-relaxed">
          Rangisha.com ikora nk'ubucuruzi buhamye buteza imbere imibereho myiza. Iyo nyir'ikintu yatanze igihembo cy'ubushake, uwatoraguye ahabwa igice kinini cy'igihembo kuri Mobile Money ye, Rangisha igafata komisiyo nto y'ubuyobozi ifasha gukomeza kubungabunga imikorere y'urubuga n'umutekano w'abaturage.
        </p>
      </div>

    </div>
  );
};
