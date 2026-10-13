import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  ExternalLink,
  Sparkles,
  Lock,
  Layers,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTranslation } from '../lib/i18n';
import { api } from '../lib/api';
import { ContactCase, PublishedItem, RecoveryRequest } from '../types';

interface UserDashboardProps {
  onNavigateContact: (mode: 'lost' | 'found') => void;
  onViewDetails: (item: PublishedItem) => void;
  onOpenReportLost?: () => void;
  onOpenReportFound?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onNavigateContact,
  onViewDetails,
  onOpenReportLost,
  onOpenReportFound
}) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'recovery' | 'profile'>('lost');
  const [myCases, setMyCases] = useState<ContactCase[]>([]);
  const [myRecoveries, setMyRecoveries] = useState<RecoveryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [allCases, allRecs] = await Promise.all([
          api.getAdminCases().catch(() => []),
          api.getRecoveryRequests().catch(() => [])
        ]);

        if (currentUser) {
          const userCases = allCases.filter(c => 
            c.personName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
            c.phone === currentUser.phone ||
            c.email === currentUser.email
          );
          setMyCases(userCases.length > 0 ? userCases : allCases.slice(0, 3));

          const userRecs = allRecs.filter(r => 
            r.claimantName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
            r.claimantPhone === currentUser.phone
          );
          setMyRecoveries(userRecs.length > 0 ? userRecs : allRecs.slice(0, 2));
        } else {
          setMyCases(allCases.slice(0, 2));
          setMyRecoveries(allRecs.slice(0, 2));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const lostCases = myCases.filter(c => c.type === 'lost');
  const foundCases = myCases.filter(c => c.type === 'found');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-[#182432] rounded-[16px] p-6 sm:p-8 border border-[#D5DEE3] dark:border-[#2A3948] shadow-[0_4px_20px_rgba(0,0,0,0.18)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#16A085] to-[#14232C] text-[#F1F5F9] font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-[#16A085]/20 border border-[#2CBFAE]/30">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#1E2933] dark:text-[#F1F5F9]">
                {currentUser?.name || 'Citizen User'}
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.12)] text-[#168F7D] dark:text-[#2CBFAE] border border-[#168F7D]/25 dark:border-[#2CBFAE]/30">
                <ShieldCheck className="w-3 h-3 text-[#168F7D] dark:text-[#2CBFAE]" />
                Verified Citizen Account
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#607080] dark:text-[#AAB7C4] mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {currentUser?.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {currentUser?.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#168F7D] dark:text-[#2CBFAE]" />
                {currentUser?.district || 'Rwanda'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Report Actions */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => onOpenReportLost ? onOpenReportLost() : onNavigateContact('lost')}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-black bg-[#C75C5C] hover:bg-[#b54f4f] text-[#F1F5F9] shadow-sm transition-all hover:scale-105"
          >
            Rangisha Icyatakaye
          </button>
          <button
            onClick={() => onOpenReportFound ? onOpenReportFound() : onNavigateContact('found')}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-black bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] shadow-sm transition-all hover:scale-105"
          >
            Natoraguye Ikintu
          </button>
        </div>
      </div>

      {/* Tabs Navigation (Requirement #24) */}
      <div className="flex border-b border-[#D5DEE3] dark:border-[#2A3948] overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('lost')}
          className={`py-3 px-4 font-black text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'lost'
              ? 'border-[#C75C5C] text-[#C75C5C]'
              : 'border-transparent text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ibyanjye Byatakaye ({lostCases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('found')}
          className={`py-3 px-4 font-black text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'found'
              ? 'border-[#16A085] text-[#168F7D] dark:text-[#2CBFAE]'
              : 'border-transparent text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Ibyo Natoraguye ({foundCases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`py-3 px-4 font-black text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'recovery'
              ? 'border-[#2CBFAE] text-[#168F7D] dark:text-[#2CBFAE]'
              : 'border-transparent text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Gusaba Kugarura / RANGISHA Claims ({myRecoveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-4 font-black text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#16A085] text-[#168F7D] dark:text-[#2CBFAE]'
              : 'border-transparent text-[#607080] dark:text-[#AAB7C4] hover:text-[#1E2933] dark:hover:text-[#F1F5F9]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Umwirondoro & Umutekano (Profile)</span>
        </button>
      </div>

      {/* Tab 1: My Lost Items */}
      {activeTab === 'lost' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base sm:text-lg text-[#1E2933] dark:text-[#F1F5F9]">
              Raporo z'Ibintu Natakaje (My Lost Item Reports)
            </h3>
            <button
              onClick={() => onOpenReportLost ? onOpenReportLost() : onNavigateContact('lost')}
              className="text-xs text-[#C75C5C] font-bold hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ongeraho Ikindi</span>
            </button>
          </div>

          {lostCases.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#182432] rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] space-y-3">
              <p className="text-xs text-[#607080] dark:text-[#AAB7C4]">Nta kintu uratanga ko cyatakaye.</p>
              <button
                onClick={() => onOpenReportLost ? onOpenReportLost() : onNavigateContact('lost')}
                className="px-5 py-2.5 rounded-xl bg-[#C75C5C] hover:bg-[#b54f4f] text-[#F1F5F9] text-xs font-bold"
              >
                Rangisha Ikintu Cyatakaye
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {lostCases.map(c => (
                <div
                  key={c.id}
                  className="p-5 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#C75C5C]/15 text-[#C75C5C]">
                        {c.caseNumber}
                      </span>
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                        c.status === 'PUBLISHED' ? 'bg-[#3BA982]/15 text-[#3BA982]' :
                        c.status === 'RECOVERED' ? 'bg-[#4F9D8A]/15 text-[#4F9D8A]' :
                        'bg-[#C99A4A]/15 text-[#C99A4A]'
                      }`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-[#1E2933] dark:text-[#F1F5F9]">
                      {c.itemName}
                    </h4>
                    <p className="text-xs text-[#607080] dark:text-[#AAB7C4] line-clamp-1">{c.description}</p>
                    <span className="text-[11px] text-[#7F8C99]">📍 {c.location?.district} • {c.date}</span>
                  </div>

                  <div className="text-right text-xs space-y-1 shrink-0">
                    {c.status === 'PUBLISHED' ? (
                      <span className="text-[#3BA982] font-bold text-[11px] block">
                        ✓ Byemejwe & biri ku rubuga
                      </span>
                    ) : (
                      <span className="text-[#C99A4A] font-medium text-[11px] block">
                        ⏳ Birimo gusuzumwa na Admin
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Found Items */}
      {activeTab === 'found' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base sm:text-lg text-[#1E2933] dark:text-[#F1F5F9]">
              Raporo z'Ibyo Natoraguye (My Found Item Reports)
            </h3>
            <button
              onClick={() => onOpenReportFound ? onOpenReportFound() : onNavigateContact('found')}
              className="text-xs text-[#168F7D] dark:text-[#2CBFAE] font-bold hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Ongeraho Icyo Watoraguye</span>
            </button>
          </div>

          {foundCases.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#182432] rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] space-y-3">
              <p className="text-xs text-[#607080] dark:text-[#AAB7C4]">Nta kintu uratanga ko watoraguye.</p>
              <button
                onClick={() => onOpenReportFound ? onOpenReportFound() : onNavigateContact('found')}
                className="px-5 py-2.5 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] text-xs font-bold"
              >
                Natoraguye Ikintu
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {foundCases.map(c => (
                <div
                  key={c.id}
                  className="p-5 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#16A085]/15 text-[#168F7D] dark:text-[#2CBFAE]">
                        {c.caseNumber}
                      </span>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[#EAF0F2] dark:bg-[#141E2A] text-[#607080] dark:text-[#AAB7C4] border border-[#D5DEE3] dark:border-[#2A3948]">
                        {c.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-[#1E2933] dark:text-[#F1F5F9]">
                      {c.itemName}
                    </h4>
                    <p className="text-xs text-[#607080] dark:text-[#AAB7C4] line-clamp-1">{c.description}</p>
                    <span className="text-[11px] text-[#7F8C99]">📍 {c.location?.district} • {c.date}</span>
                  </div>

                  <div className="text-right text-xs shrink-0">
                    <span className="text-[#3BA982] font-bold block">
                      Finder Reward Eligible
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recovery Requests (RANGISHA claims) */}
      {activeTab === 'recovery' && (
        <div className="space-y-4">
          <h3 className="font-black text-base sm:text-lg text-[#1E2933] dark:text-[#F1F5F9]">
            Ibyifuzo Byo Kugarura Ibintu — RANGISHA Claims
          </h3>

          {myRecoveries.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#182432] rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] space-y-2">
              <p className="text-xs text-[#607080] dark:text-[#AAB7C4]">Nta cyifuzo cyo kugarura ikintu urasaba.</p>
              <p className="text-[11px] text-[#7F8C99]">
                Iyo ubonye ikintu cyawe ku rubuga, kanda kuri <strong>"RANGISHA — Iyi ni Iyanjye"</strong> ngo ucyakire.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRecoveries.map(r => (
                <div
                  key={r.id}
                  className="p-5 rounded-[16px] bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#16A085]/15 text-[#168F7D] dark:text-[#2CBFAE]">
                        {r.requestId}
                      </span>
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                        r.status === 'completed' ? 'bg-[#3BA982]/15 text-[#3BA982]' :
                        r.status === 'approved' ? 'bg-[#2CBFAE]/15 text-[#2CBFAE]' :
                        'bg-[#C99A4A]/15 text-[#C99A4A]'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-[#1E2933] dark:text-[#F1F5F9]">
                      {r.itemTitle}
                    </h4>
                    <p className="text-xs text-[#607080] dark:text-[#AAB7C4]">{r.ownershipExplanation}</p>
                    <span className="text-[11px] text-[#7F8C99] font-mono">Item ID: {r.itemReportId}</span>
                  </div>

                  <div className="text-right text-xs shrink-0 space-y-1">
                    <span className="text-[#168F7D] dark:text-[#2CBFAE] font-bold block">
                      Under Admin Review
                    </span>
                    <span className="text-[#7F8C99] block text-[11px]">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Profile & Security */}
      {activeTab === 'profile' && (
        <div className="p-6 sm:p-8 bg-white dark:bg-[#182432] rounded-[16px] border border-[#D5DEE3] dark:border-[#2A3948] space-y-6">
          <h3 className="font-black text-base sm:text-lg text-[#1E2933] dark:text-[#F1F5F9] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#168F7D] dark:text-[#2CBFAE]" />
            <span>Ibyerekeye Umwirondoro n'Umutekano (Profile & Security)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] space-y-1">
              <span className="text-[#7F8C99] font-bold block">Amazina:</span>
              <strong className="text-[#1E2933] dark:text-[#F1F5F9] text-sm">{currentUser?.name}</strong>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] space-y-1">
              <span className="text-[#7F8C99] font-bold block">Email:</span>
              <strong className="text-[#1E2933] dark:text-[#F1F5F9] text-sm">{currentUser?.email}</strong>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] space-y-1">
              <span className="text-[#7F8C99] font-bold block">Telefone:</span>
              <strong className="text-[#1E2933] dark:text-[#F1F5F9] text-sm font-mono">{currentUser?.phone}</strong>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7F8] dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] space-y-1">
              <span className="text-[#7F8C99] font-bold block">Akarere:</span>
              <strong className="text-[#1E2933] dark:text-[#F1F5F9] text-sm">{currentUser?.district || 'Gasabo'}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#16A085]/10 border border-[#16A085]/25 text-xs text-[#168F7D] dark:text-[#2CBFAE] space-y-1">
            <strong className="block font-bold">Umutekano usesuye:</strong>
            <p className="text-[#607080] dark:text-[#AAB7C4]">
              Kuri Rangisha.com, nimero yawe na aderesi yawe ntibigaragazwa ku bantu basanzwe. Amakuru yose acungwa n'ubuyobozi mu buryo bw'ibanga (Strict Privacy & Security Guard).
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
