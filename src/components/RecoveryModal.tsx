import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  Mail, 
  FileText, 
  Lock,
  Upload,
  ExternalLink
} from 'lucide-react';
import { PublishedItem, RecoveryRequest } from '../types';
import { api } from '../lib/api';
import { useTranslation } from '../lib/i18n';

interface RecoveryModalProps {
  item: PublishedItem | null;
  onClose: () => void;
  onSuccess: (requestId: string) => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  item,
  onClose,
  onSuccess
}) => {
  const { t, language } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ requestId: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    claimantName: '',
    claimantPhone: '',
    claimantEmail: '',
    ownershipExplanation: '',
    identifyingDetails: '',
    proofDocumentUrl: '',
    preferredContactMethod: 'whatsapp' as 'whatsapp' | 'phone' | 'email'
  });

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.claimantName.trim() || !form.claimantPhone.trim() || !form.ownershipExplanation.trim()) {
      setError(language === 'rw' 
        ? 'Amazina, telefone n\'ibisobanuro by\'umutungo birakenewe.' 
        : 'Name, phone number, and explanation of ownership are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.submitRecoveryRequest({
        itemId: item.id,
        itemReportId: item.reportId,
        itemTitle: item.title,
        claimantName: form.claimantName.trim(),
        claimantPhone: form.claimantPhone.trim(),
        claimantEmail: form.claimantEmail.trim() || undefined,
        ownershipExplanation: form.ownershipExplanation.trim(),
        identifyingDetails: form.identifyingDetails.trim(),
        proofDocumentUrl: form.proofDocumentUrl.trim() || undefined,
        preferredContactMethod: form.preferredContactMethod
      });

      setSubmittedData({
        requestId: res.requestId,
        message: res.message
      });
      onSuccess(res.requestId);
    } catch (err: any) {
      setError(err.message || 'Habaye ikosa mu kohereza icyifuzo. Ongera ugerageze.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">
                RANGISHA — Iyi ni Iyanjye (Claim This Item)
              </h3>
              <p className="text-xs text-emerald-100">
                Saba kugarura ikintu mu buryo bunoze kandi bwizewe bwa Rangisha.com
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {submittedData ? (
            <div className="text-center py-8 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                  {submittedData.requestId}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Icyifuzo Cyawe Cyakiriwe Neza!
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  {submittedData.message}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-left space-y-1.5">
                <div className="font-bold text-slate-700 dark:text-slate-300">Icyitonderwa (Next Steps):</div>
                <p>1. Ubuyobozi bwa Rangisha.com buragenzura ibimenyetso watanze n'uwatoraguye.</p>
                <p>2. Abakozi bacu baraguhamagara cyangwa bakwandikire kuri WhatsApp kugira ngo bakubwire aho gufatira ikintu cyawe mu mutekano.</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl shadow-emerald-600/25 transition-all"
              >
                Funga (Done)
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Target Item summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  <img 
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=300&q=80'} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                    {item.reportId}
                  </span>
                  <strong className="text-sm text-slate-900 dark:text-white truncate block">
                    {item.title}
                  </strong>
                  <span className="text-slate-500">
                    {item.location?.district} • {item.date}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Amazina yawe (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.claimantName}
                    onChange={e => setForm({ ...form, claimantName: e.target.value })}
                    placeholder="Urugero: Mugisha Jean Claude"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nimero ya Telefone (Phone Number) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.claimantPhone}
                    onChange={e => setForm({ ...form, claimantPhone: e.target.value })}
                    placeholder="Urugero: 0788 123 456"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email yawe (Optional)
                  </label>
                  <input
                    type="email"
                    value={form.claimantEmail}
                    onChange={e => setForm({ ...form, claimantEmail: e.target.value })}
                    placeholder="urugero@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Uburyo wifuza ko tukwandikira (Contact Preference)
                  </label>
                  <select
                    value={form.preferredContactMethod}
                    onChange={e => setForm({ ...form, preferredContactMethod: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  >
                    <option value="whatsapp">WhatsApp (Irahebuje)</option>
                    <option value="phone">Guhamagarwa (Phone Call)</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sobanura impamvu wemeza ko iki kintu ari icyawe (Explanation of Ownership) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={form.ownershipExplanation}
                  onChange={e => setForm({ ...form, ownershipExplanation: e.target.value })}
                  placeholder="Sobanura neza: Wagitaye ryari? Aheza? Hari ibiranga byihariye nk'amashusho arimo, ibimenyetso, cyangwa icyangombwa gihura n'ibyo?"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ibindi bimenyetso byihariye (Additional Identifying Details)
                </label>
                <input
                  type="text"
                  value={form.identifyingDetails}
                  onChange={e => setForm({ ...form, identifyingDetails: e.target.value })}
                  placeholder="Urugero: PIN code, nimero ya serie, cover, cyangwa ibintu byari birimo imbere"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ifoto y'Icyemezo cy'umutungo / Facture (Proof URL / Photo)
                </label>
                <input
                  type="url"
                  value={form.proofDocumentUrl}
                  onChange={e => setForm({ ...form, proofDocumentUrl: e.target.value })}
                  placeholder="https://... (Urashobora no kuyohereza kuri WhatsApp ya Rangisha nyuma)"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Trust & Privacy Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Amakuru yawe arinzwe 100%. Rangisha.com ntabwo iyaha abantu bose. Abakozi b'ubuyobozi nibo bagenzura gusa ngo ikintu kigushyikire mu mucyo.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Reka (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/25 transition-all hover:scale-105 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Kohereza...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Ohereza Icyifuzo (Submit RANGISHA Claim)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
