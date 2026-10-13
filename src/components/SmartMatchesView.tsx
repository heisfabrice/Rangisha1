import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  Tag, 
  Layers, 
  Info 
} from 'lucide-react';
import { ItemMatch, AnyItem } from '../types';
import { api } from '../lib/api';
import { useTranslation } from '../lib/i18n';

interface SmartMatchesViewProps {
  onViewDetails: (item: AnyItem) => void;
  onClaim: (item: AnyItem) => void;
}

export const SmartMatchesView: React.FC<SmartMatchesViewProps> = ({ onViewDetails, onClaim }) => {
  const { t } = useTranslation();
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllMatches()
      .then(res => setMatches(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Title & Explainer */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-800/40 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ikoranabuhanga ryo Guhuza Ibintu (Algorithmic Smart Match)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ibyahuijwe Byikora (Smart Matches)
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Ikoranabuhanga rya Rangisha.com risesengura ibyiciro (30%), amagambo aranga (20%), aho byabereye mu Rwanda (20%), ikirango (10%), ibara (10%) n'amatariki (10%) kugira ngo riguhuza n'uwabonye ibyawe.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs text-emerald-200">
            <span className="px-2.5 py-1 rounded-lg bg-white/10">Category: 30%</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10">Keywords & Serial: 20%</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10">Location: 20%</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10">Brand & Color: 20%</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10">Date Proximity: 10%</span>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Ikoranabuhanga ririmo gusesengura ibyabonetse...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Info className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Nta Kintu Kirahuza 100% Kuri Ubu</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Iyo raporo nshya y'icyatoraguwe yinjijwe ihuye n'icyo wabuze, uhita ubona ubutumwa ako kanya kuri dashboard na WhatsApp.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <span>Ibyagaragaye Bihuza</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                {matches.length} matches
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {matches.map(m => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all overflow-hidden p-5 sm:p-6"
              >
                {/* Match Header Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 text-lg shadow-sm">
                      {m.score}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          Icyizere cyo Guhuza (Possible Match: {m.score}%)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold">
                          Icyifuzo cy'Ikoranabuhanga
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {m.reasons.map((r, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onClaim(m.foundItem)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Rangisha / Saba Kugaruzwa</span>
                  </button>
                </div>

                {/* Side-by-side comparison */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Lost Item Card */}
                  <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded font-black bg-rose-600 text-white uppercase text-[10px]">
                        Icyatakaye (Lost)
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{m.lostItem.reportId}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {m.lostItem.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {m.lostItem.description}
                    </p>

                    <div className="pt-2 border-t border-rose-100 dark:border-rose-900/30 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {m.lostItem.location.district} ({m.lostItem.location.sector || ''})
                      </span>
                      <span>{m.lostItem.date}</span>
                    </div>
                  </div>

                  {/* Found Item Card */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded font-black bg-emerald-600 text-white uppercase text-[10px]">
                        Icyatoraguwe (Found Match)
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{m.foundItem.reportId}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {m.foundItem.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {m.foundItem.description}
                    </p>

                    <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        {m.foundItem.location.district} ({m.foundItem.location.sector || ''})
                      </span>
                      <span>{m.foundItem.date}</span>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
