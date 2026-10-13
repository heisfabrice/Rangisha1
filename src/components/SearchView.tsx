import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Tag, 
  RefreshCw, 
  X, 
  SlidersHorizontal,
  MessageSquare
} from 'lucide-react';
import { PublishedItem } from '../types';
import { ItemCard } from './ItemCard';
import { ALL_DISTRICTS } from '../lib/locations';
import { INITIAL_CATEGORIES } from '../lib/categories';
import { api } from '../lib/api';
import { useTranslation } from '../lib/i18n';

interface SearchViewProps {
  initialType?: 'all' | 'lost' | 'found' | 'missing_person' | 'found_person';
  initialCategory?: string;
  initialDistrict?: string;
  initialQuery?: string;
  onViewDetails: (item: PublishedItem) => void;
  onHaveInformation: (item: PublishedItem) => void;
  onNavigateContact: (mode: 'lost' | 'found' | 'missing_person' | 'found_person') => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  initialType = 'all',
  initialCategory = 'all',
  initialDistrict = 'all',
  initialQuery = '',
  onViewDetails,
  onHaveInformation,
  onNavigateContact
}) => {
  const { t } = useTranslation();

  const [type, setType] = useState<'all' | 'lost' | 'found' | 'missing_person' | 'found_person'>(initialType);
  const [category, setCategory] = useState<string>(initialCategory);
  const [district, setDistrict] = useState<string>(initialDistrict);
  const [query, setQuery] = useState<string>(initialQuery);
  const [sort, setSort] = useState<'newest' | 'oldest' | 'rewardHigh'>('newest');

  const [items, setItems] = useState<PublishedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialType) setType(initialType);
  }, [initialType]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.getItems({
        type,
        category,
        district,
        q: query,
        sort,
        page: 1,
        limit: 50
      });
      setItems(res.items);
      setTotalCount(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type, category, district, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleResetFilters = () => {
    setType('all');
    setCategory('all');
    setDistrict('all');
    setQuery('');
    setSort('newest');
  };

  const getHeaderInfo = () => {
    switch (type) {
      case 'missing_person':
        return {
          title: 'Ababuze (Missing People Rwanda)',
          subtitle: 'Urutonde rw\'abantu babuze bamenyeshejwe ubuyobozi bwa Rangisha.com. Ibisabwa byose byabanje gusuzumwa no kwemezwa mu mutekano.',
          isEmergency: true
        };
      case 'found_person':
        return {
          title: 'Ababonense (Found & Sheltered People)',
          subtitle: 'Abana n\'abantu bakuze babonetse batibuka imiryango yabo. Biri mu maboko meza ya Polisi, Isange One Stop Center, cyangwa Ibitaro.',
          isEmergency: false
        };
      case 'lost':
        return {
          title: 'Ibyatakaye (Lost Items in Rwanda)',
          subtitle: 'Ibyangombwa, mudasobwa, telefone n\'ibikoresho byatakaye byemejwe n\'ubuyobozi bwa Rangisha.com.',
          isEmergency: false
        };
      case 'found':
        return {
          title: 'Ibyatoraguwe (Found Items in Rwanda)',
          subtitle: 'Ibintu byatoraguwe n\'abaturage b\'inyamugayo bitegereje ba nyirabyo byemejwe na Rangisha.com.',
          isEmergency: false
        };
      default:
        return {
          title: 'Shakisha muri Byose (Search Lost & Found & People)',
          subtitle: 'Ibyatakaye, ibyatoraguwe n\'abantu babuze byose byabanje gusuzumwa n\'ubuyobozi bwa Rangisha.com.',
          isEmergency: false
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
              {headerInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#607080] dark:text-[#AAB7C4] mt-1 max-w-2xl">
              {headerInfo.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D5DEE3] dark:border-[#2A3948] bg-white dark:bg-[#182432] text-xs font-bold text-[#1E2933] dark:text-[#E6EDF3] shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#168F7D] dark:text-[#2CBFAE]" />
              <span>Akayunguruzo</span>
            </button>

            {/* Type tabs (5 standard tabs) */}
            <div className="w-full overflow-x-auto flex sm:flex-wrap items-center bg-[#EAF0F2] dark:bg-[#141E2A] p-1 rounded-2xl border border-[#D5DEE3] dark:border-[#2A3948] gap-1">
              <button
                onClick={() => setType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  type === 'all'
                    ? 'bg-white dark:bg-[#182432] text-[#168F7D] dark:text-[#2CBFAE] shadow-sm'
                    : 'text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-white'
                }`}
              >
                Byose (All)
              </button>
              <button
                onClick={() => setType('lost')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  type === 'lost'
                    ? 'bg-[#C75C5C] text-[#F1F5F9] shadow-sm'
                    : 'text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-white'
                }`}
              >
                Ibyatakaye
              </button>
              <button
                onClick={() => setType('found')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  type === 'found'
                    ? 'bg-[#16A085] text-[#F1F5F9] shadow-sm'
                    : 'text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-white'
                }`}
              >
                Ibyatoraguwe
              </button>
              <button
                onClick={() => {
                  setType('missing_person');
                  setCategory('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  type === 'missing_person'
                    ? 'bg-[#C75C5C] text-[#F1F5F9] shadow-sm'
                    : 'text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-white'
                }`}
              >
                🚨 Ababuze
              </button>
              <button
                onClick={() => {
                  setType('found_person');
                  setCategory('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  type === 'found_person'
                    ? 'bg-[#16A085] text-[#F1F5F9] shadow-sm'
                    : 'text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-white'
                }`}
              >
                🛡️ Ababonense
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Alert Banner if in missing people view */}
        {type === 'missing_person' && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-[#C75C5C]/15 border border-rose-200 dark:border-[#C75C5C]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <strong className="block text-rose-800 dark:text-rose-200 font-black text-sm">
                🚨 IBURIRWA RYIHUTIRWA RY'ABANTU BABUZE (EMERGENCY ALERTS)
              </strong>
              <p className="text-rose-700 dark:text-[#CBD5E1] mt-0.5">
                Niba hari uwo uzi cyangwa ubonye mu babuze, hamagara ako kanya Hotline ya Rangisha.com kuri <strong className="font-mono text-rose-900 dark:text-white">0794473504</strong> cyangwa Polisi y'u Rwanda (112).
              </p>
            </div>
            <a
              href="tel:0794473504"
              className="px-5 py-2.5 rounded-xl bg-[#C75C5C] hover:bg-[#b54f4f] text-white font-bold text-xs shrink-0 text-center shadow-sm"
            >
              Hamagara Hotline
            </a>
          </div>
        )}

        {/* Search bar (Requirement #10) */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-4 text-[#7F8C99]" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Andika izina ry'ikintu, akarere, cyangwa raporo ID..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-[#D5DEE3] dark:border-[#2A3948] bg-white dark:bg-[#182432] text-sm text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] shadow-[0_4px_20px_rgba(0,0,0,0.18)] focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 px-5 py-2 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-bold text-xs shadow-md transition-colors"
          >
            Shakisha
          </button>
        </form>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className={`space-y-6 lg:block ${mobileFilterOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white dark:bg-[#182432] p-5 rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5DEE3] dark:border-[#2A3948]">
              <span className="font-extrabold text-sm flex items-center gap-2 text-[#1E2933] dark:text-[#F1F5F9]">
                <Filter className="w-4 h-4 text-[#168F7D] dark:text-[#2CBFAE]" />
                <span>Akayunguruzo</span>
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#168F7D] dark:text-[#2CBFAE] hover:underline"
              >
                Subiza Ku Busa
              </button>
            </div>

            {/* Category (Hidden for Ababuze and Ababonense per user request) */}
            {type !== 'missing_person' && type !== 'found_person' && (
              <div>
                <label className="block text-xs font-bold text-[#1E2933] dark:text-[#E6EDF3] mb-1.5">
                  Icyiciro (Category)
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5DEE3] dark:border-[#2A3948] bg-[#F4F7F8] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#E6EDF3] text-xs font-medium outline-none focus:border-[#2CBFAE]"
                >
                  <option value="all">Ibyiciro Byose</option>
                  {INITIAL_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nameRw} ({cat.nameEn})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Rwanda District */}
            <div>
              <label className="block text-xs font-bold text-[#1E2933] dark:text-[#E6EDF3] mb-1.5">
                Akarere mu Rwanda (District)
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5DEE3] dark:border-[#2A3948] bg-[#F4F7F8] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#E6EDF3] text-xs font-medium outline-none focus:border-[#2CBFAE]"
              >
                <option value="all">Uturere Twose</option>
                {ALL_DISTRICTS.map((d, i) => (
                  <option key={`${d.district}-${i}`} value={d.district}>{d.district}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-bold text-[#1E2933] dark:text-[#E6EDF3] mb-1.5">
                Gutunganya (Sort By)
              </label>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5DEE3] dark:border-[#2A3948] bg-[#F4F7F8] dark:bg-[#141E2A] text-[#1E2933] dark:text-[#E6EDF3] text-xs font-medium outline-none focus:border-[#2CBFAE]"
              >
                <option value="newest">Bishya Cyane</option>
                <option value="oldest">Bishaje</option>
                <option value="rewardHigh">Igihembo Kinini</option>
              </select>
            </div>

          </div>

            {/* Contact Admin Callout */}
          <div className="p-5 rounded-[16px] bg-gradient-to-br from-[#16A085] to-[#14232C] text-[#F1F5F9] shadow-[0_4px_20px_rgba(22,160,133,0.25)] border border-[#2CBFAE]/30 space-y-3">
            <h4 className="font-extrabold text-sm text-[#F1F5F9]">Ntugize icyo ubona?</h4>
            <p className="text-xs text-[#E6EDF3]/85 leading-relaxed">
              Twandikire kuri Rangisha.com kugira ngo abakozi bacu bagufashe gushakisha.
            </p>
            <button
              onClick={() => onNavigateContact(type === 'missing_person' ? 'missing_person' : type === 'found' ? 'found' : 'lost')}
              className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-[#182432] text-[#168F7D] dark:text-[#2CBFAE] border border-[#D5DEE3] dark:border-[#2A3948] font-bold text-xs shadow hover:bg-[#EAF0F2] dark:hover:bg-[#1D2A38] transition-colors"
            >
              Twandikire kuri Rangisha.com
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#607080] dark:text-[#AAB7C4]">
            <span>Ibibonetse byemejwe: <strong className="text-[#1E2933] dark:text-[#F1F5F9]">{totalCount}</strong></span>
            {query && <span>Ijambo ryashakishijwe: "<strong className="text-[#1E2933] dark:text-[#F1F5F9]">{query}</strong>"</span>}
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#168F7D] dark:text-[#2CBFAE] animate-spin mx-auto" />
              <p className="text-xs text-[#607080] dark:text-[#AAB7C4]">Birimo gushakishwa mu byemejwe...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-[#182432] rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] p-8 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.18)]">
              <div className="w-16 h-16 rounded-full bg-[#EAF0F2] dark:bg-[#141E2A] flex items-center justify-center text-[#7F8C99] mx-auto border border-[#D5DEE3] dark:border-[#2A3948]">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#1E2933] dark:text-[#F1F5F9]">
                Nta kintu cyangwa umuntu ubonetse ahuye n'ibyo ushakishije
              </h3>
              <p className="text-xs text-[#607080] dark:text-[#AAB7C4] max-w-md mx-auto">
                Waba wabuze ikintu cyangwa umuntu utari ku rubuga? Twandikire kuri Rangisha.com kugira ngo abakozi bacu bagufashe kugishakisha no kugishyira ku mugaragaro.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-[#EAF0F2] dark:bg-[#1D2A38] text-[#1E2933] dark:text-[#D7E0E8] border border-[#D5DEE3] dark:border-[#2A3948] text-xs font-bold hover:bg-[#D5DEE3] dark:hover:bg-[#233344] transition-colors"
                >
                  Kuraho Akayunguruzo
                </button>
                <button
                  onClick={() => onNavigateContact(type === 'missing_person' ? 'missing_person' : type === 'found' ? 'found' : 'lost')}
                  className="px-5 py-2 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-xs font-bold text-[#F1F5F9] shadow-md transition-colors"
                >
                  Twandikire kuri Rangisha.com
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onViewDetails={onViewDetails}
                  onHaveInformation={onHaveInformation}
                />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
