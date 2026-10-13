import React, { useState, useEffect } from 'react';
import { 
  Search, 
  PlusCircle, 
  FileCheck, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Tag,
  Star,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { INITIAL_CATEGORIES } from '../lib/categories';
import { ALL_DISTRICTS } from '../lib/locations';
import { PublishedItem, Review, SystemSettings } from '../types';
import { ItemCard } from './ItemCard';
import { OfficeServiceNotice } from './OfficeServiceNotice';
import { api } from '../lib/api';

interface HomeViewProps {
  settings?: SystemSettings;
  onNavigateContact: (mode: 'lost' | 'found') => void;
  onNavigateSearch: (params?: { category?: string; district?: string; q?: string; type?: 'all' | 'lost' | 'found' }) => void;
  onViewDetails: (item: PublishedItem) => void;
  onHaveInformation: (item: PublishedItem) => void;
  onOpenReportLost?: () => void;
  onOpenReportFound?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  onNavigateContact,
  onNavigateSearch,
  onViewDetails,
  onHaveInformation,
  onOpenReportLost,
  onOpenReportFound
}) => {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  
  const [recentItems, setRecentItems] = useState<PublishedItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let isMounted = true;
    api.getItems({ page: 1, limit: 6 })
      .then(res => {
        if (isMounted && res?.items) setRecentItems(res.items);
      })
      .catch(err => {
        console.warn('Could not load recent items:', err);
      });

    api.getReviews()
      .then(res => {
        if (isMounted && Array.isArray(res)) setReviews(res);
      })
      .catch(err => {
        console.warn('Could not load reviews:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateSearch({
      q: searchQuery,
      category: selectedCategory,
      district: selectedDistrict
    });
  };

  const whatsappNum = settings?.contact?.whatsapp || '250788450120';
  const cleanWaNumber = whatsappNum.replace(/[^\d]/g, '');
  const waLink = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent('Muraho Rangisha.com! Nshaka kumenyesha no kuvugana na Admin ku kintu cyatakaye cyangwa icyatoraguwe.')}`;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* ================================================= */}
      {/* 1. HERO SECTION WITH TWO MAIN BUTTONS (Req #1 & #25) */}
      {/* ================================================= */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 bg-gradient-to-b from-[#F4F7F8] via-[#EAF0F2] to-[#F4F7F8] dark:from-[#0F1720] dark:via-[#14232C] dark:to-[#0F1720] border-b border-[#D5DEE3] dark:border-[#253443]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
          
          {/* Top trust pill */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] text-[11px] sm:text-xs font-bold border border-[#168F7D]/25 dark:border-[#2CBFAE]/30 shadow-sm max-w-full">
            <Lock className="w-3.5 h-3.5 text-[#168F7D] dark:text-[#2CBFAE] shrink-0" />
            <span className="truncate sm:whitespace-normal">Urubuga Rugengwa n'Ubuyobozi • Admin-Moderated Platform</span>
          </div>

          {/* Slogan */}
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-[#1E2933] dark:text-[#F1F5F9] tracking-tight leading-[1.18] sm:leading-[1.15]">
              {t('brand.slogan')}
            </h1>
            <p className="text-xs sm:text-base lg:text-lg text-[#607080] dark:text-[#AAB7C4] max-w-2xl mx-auto leading-relaxed font-medium">
              Rangisha.com igufasha gutangaza no gushakisha ibyabuze mu Rwanda. Amakuru yose asuzumwa kandi akemezwa n'ubuyobozi bwa Rangisha mbere yo gushyirwa ku mugaragaro.
            </p>
          </div>

          {/* THREE MAIN PROMINENT BUTTONS */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 max-w-xl sm:max-w-none mx-auto w-full">
            
            {/* BUTTON 1: RANGISHA IKINTU CYATAKAYE */}
            <button
              onClick={() => onNavigateContact('lost')}
              className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-[#C75C5C] hover:bg-[#b54f4f] text-[#F1F5F9] font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(199,92,92,0.25)] transition-all hover:-translate-y-0.5 text-left"
            >
              <PlusCircle className="w-5 h-5 shrink-0" />
              <div>
                <div>Rangisha Ikintu Cyatakaye</div>
                <div className="text-[10px] font-normal text-[#F1F5F9]/80">Contact Admin • Lost Item</div>
              </div>
            </button>

            {/* BUTTON 2: NATORAGUYE IKINTU */}
            <button
              onClick={() => onNavigateContact('found')}
              className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(22,160,133,0.25)] transition-all hover:-translate-y-0.5 text-left"
            >
              <FileCheck className="w-5 h-5 shrink-0" />
              <div>
                <div>Natoraguye Ikintu</div>
                <div className="text-[10px] font-normal text-[#F1F5F9]/80">Contact Admin • Found Item</div>
              </div>
            </button>

            {/* BUTTON 3: SHAKISHA IKINTU */}
            <button
              onClick={() => onNavigateSearch({ type: 'all' })}
              className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-white dark:bg-[#1D2A38] hover:bg-[#EAF0F2] dark:hover:bg-[#233344] text-[#1E2933] dark:text-[#D7E0E8] font-bold text-xs sm:text-sm shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 border border-[#D5DEE3] dark:border-[#2A3948] text-left"
            >
              <Search className="w-5 h-5 shrink-0 text-[#168F7D] dark:text-[#2CBFAE]" />
              <div>
                <div>Shakisha Ikintu</div>
                <div className="text-[10px] font-normal text-[#607080] dark:text-[#AAB7C4]">Search Items</div>
              </div>
            </button>

          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto pt-4 w-full">
            <form
              onSubmit={handleHeroSearch}
              className="bg-white dark:bg-[#182432] p-2.5 sm:p-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.18)] border border-[#D5DEE3] dark:border-[#2A3948] flex flex-col md:flex-row items-stretch md:items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#7F8C99]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Shakisha ikintu wabuze (Indangamuntu, iPhone...)"
                  className="w-full pl-11 pr-3 py-3 rounded-xl text-xs sm:text-sm text-[#1E2933] dark:text-[#E6EDF3] bg-[#EAF0F2] dark:bg-[#141E2A] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] border border-transparent focus:border-[#168F7D] dark:focus:border-[#2CBFAE] outline-none transition-colors"
                />
              </div>

              <div className="w-full md:w-48">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl text-xs font-semibold text-[#1E2933] dark:text-[#E6EDF3] bg-[#EAF0F2] dark:bg-[#141E2A] border border-transparent focus:border-[#168F7D] dark:focus:border-[#2CBFAE] outline-none cursor-pointer"
                >
                  <option value="all">Ibyiciro Byose</option>
                  {INITIAL_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.nameRw}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-44">
                <select
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl text-xs font-semibold text-[#1E2933] dark:text-[#E6EDF3] bg-[#EAF0F2] dark:bg-[#141E2A] border border-transparent focus:border-[#168F7D] dark:focus:border-[#2CBFAE] outline-none cursor-pointer"
                >
                  <option value="all">Uturere Twose</option>
                  {ALL_DISTRICTS.map((d, i) => (
                    <option key={`${d.district}-${i}`} value={d.district}>{d.district}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-bold text-xs sm:text-sm shadow-md shadow-[#16A085]/20 whitespace-nowrap transition-all"
              >
                Shakisha
              </button>
            </form>
          </div>

          {/* Admin Workflow Micro Graphic */}
          <div className="pt-2 max-w-3xl mx-auto p-4 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] text-xs text-[#607080] dark:text-[#AAB7C4]">
            <span className="font-bold text-[#1E2933] dark:text-[#F1F5F9]">Imikorere y'Umutekano:</span>{' '}
            Umuntu watakaje cyangwa uwatoraguye yandikira Admin ➔ Admin agenzura amakuru ➔ Admin ashyira ku rubuga ➔ Icyemejwe kigashyirwa ku mugaragaro.
          </div>

        </div>
      </section>

      {/* ================================================= */}
      {/* 2. ADMIN IS THE GATEKEEPER */}
      {/* ================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#141E2A] text-[#E6EDF3] rounded-3xl p-8 sm:p-12 border border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2CBFAE]">
              Icyizere n'Ubunyangamugayo (The Trusted Gateway)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F1F5F9]">
              Kuki Rangisha.com icungwa n'Ubuyobozi?
            </h2>
            <p className="text-xs sm:text-sm text-[#AAB7C4] leading-relaxed">
              Kwirinda ibinyoma, ubushukanyi n'amakuru y'ibihimbano. Buri kintu kibonetse cyangwa cyatakaye kibanza gucungwa n'abakozi bacu babifitiye ububasha.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#182432] border border-[#2A3948] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#C75C5C]/20 text-[#C75C5C] flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-[#F1F5F9]">1. Twandikire</h4>
              <p className="text-xs text-[#AAB7C4]">
                Uzuza ubutumwa cyangwa utwandikire kuri WhatsApp y'ubuyobozi bwa Rangisha.com.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#182432] border border-[#2A3948] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#C99A4A]/20 text-[#C99A4A] flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-[#F1F5F9]">2. Admin Arasuzuma</h4>
              <p className="text-xs text-[#AAB7C4]">
                Ubuyobozi buhamagara, bukasuzuma ibiranga nyiracyo n'umwirondoro mu mutekano.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#182432] border border-[#2A3948] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-[#3BA982]/20 text-[#3BA982] flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-[#F1F5F9]">3. Gushyira ku Rubuga</h4>
              <p className="text-xs text-[#AAB7C4]">
                Icyemejwe nicyo cyonyine gishyirwa ku rubuga rw'igihugu kugira ngo kigaruzwe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* 3. RECENT APPROVED PUBLISHED LISTINGS */}
      {/* ================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
              Ibyemejwe n'Ubuyobozi Biri ku Rubuga (Published Items)
            </h2>
            <p className="text-xs text-[#607080] dark:text-[#AAB7C4]">
              Ibyatakaye n'ibyatoraguwe byasuzumwe n'abakozi ba Rangisha.com
            </p>
          </div>

          <button
            onClick={() => onNavigateSearch({ type: 'all' })}
            className="text-xs font-bold text-[#168F7D] dark:text-[#2CBFAE] hover:underline flex items-center gap-1"
          >
            <span>Reba Byose mu Ishakiro</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onViewDetails={onViewDetails}
              onHaveInformation={onHaveInformation}
            />
          ))}
        </div>
      </section>

      {/* ================================================= */}
      {/* 4. SUCCESS STORIES (Requirement #19 & #43) */}
      {/* ================================================= */}
      <section className="bg-[#EAF0F2] dark:bg-[#111B26] py-12 border-y border-[#D5DEE3] dark:border-[#253443]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#168F7D] dark:text-[#2CBFAE] uppercase tracking-widest">
              Ubuhamya bw'Abaranguwe
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
              Ibyasubijwe Ba Nyirabyo Binyuze muri Rangisha.com
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {reviews.map(rev => (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#C99A4A]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C99A4A]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3BA982]/15 text-[#3BA982] border border-[#3BA982]/30">
                    ✓ Verified by Admin
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#1E2933] dark:text-[#E6EDF3] italic leading-relaxed">
                  "{rev.story}"
                </p>

                <div className="pt-2 border-t border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-between text-xs text-[#607080] dark:text-[#AAB7C4]">
                  <span className="font-bold text-[#1E2933] dark:text-[#F1F5F9]">{rev.authorName}</span>
                  <span>{rev.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* 5. OFFICE SERVICE AVAILABILITY (Requirement #2) */}
      {/* ================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OfficeServiceNotice
          service={settings?.service}
          officeAddress={settings?.contact?.officeAddress}
          officeHours={settings?.contact?.officeHours}
          hotline={settings?.contact?.phone || '0794473504'}
          whatsapp={settings?.contact?.whatsapp || '0736138312'}
        />
      </section>

      {/* ================================================= */}
      {/* 6. DIRECT WHATSAPP BANNER */}
      {/* ================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#141E2A] text-[#F1F5F9] p-8 sm:p-12 border border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black text-[#F1F5F9]">
              Ukeneye ko dutangaza ikintu cyawe cyangwa ufite icyo watoraguye?
            </h3>
            <p className="text-xs sm:text-sm text-[#AAB7C4] leading-relaxed">
              Kanda kuri WhatsApp cyangwa Twandikire kuri Rangisha.com kugira ngo abakozi b'ubuyobozi bagufashe ako kanya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-bold text-sm shadow-md transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#F1F5F9]" />
              <span>Kuvugana kuri WhatsApp</span>
            </a>

            <button
              onClick={() => onNavigateContact('lost')}
              className="px-6 py-3.5 rounded-2xl bg-[#182432] hover:bg-[#1D2A38] text-[#E6EDF3] font-bold text-sm border border-[#2A3948] transition-colors"
            >
              Fungura Paji yo Kwandikira Admin
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
