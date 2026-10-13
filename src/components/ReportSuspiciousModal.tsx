import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AnyItem } from '../types';
import { api } from '../lib/api';

interface ReportSuspiciousModalProps {
  item: AnyItem | null;
  onClose: () => void;
}

export const ReportSuspiciousModal: React.FC<ReportSuspiciousModalProps> = ({ item, onClose }) => {
  const [reason, setReason] = useState<string>('scam');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;

    try {
      setIsSubmitting(true);
      await api.reportSuspicious({
        itemId: item.id,
        reason,
        description,
        reporterName,
        reporterPhone
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-extrabold text-base">Tanga Impuruza ku Kintu (Report Listing)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 dark:text-white">Murakoze! Impuruza yawe yakiriwe.</h4>
            <p className="text-xs text-slate-500">Ikipe yacu igiye gukora iperereza kuri iki kintu ako kanya.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Impamvu (Reason)
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-white"
              >
                <option value="scam">Scam / Ubwambuzi Bushukana</option>
                <option value="fake_item">Fake Item / Ikintu Cy\'Ibihimbano</option>
                <option value="wrong_information">Wrong Information / Amakuru Y\'Ikinyoma</option>
                <option value="fraud">Fraud / Uburiganya</option>
                <option value="harassment">Harassment / Ihohotera</option>
                <option value="duplicate">Duplicate / Byasubiwemo</option>
                <option value="other">Other / Izindi Mpamvu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ibisobanuro Birambuye *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Sobanura ikibazo witegereje..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Amazina yawe (Option)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="Amazina"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Telefone (Option)</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={e => setReporterPhone(e.target.value)}
                  placeholder="078..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Reka
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Biragenda...' : 'Ohereza Impuruza'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
