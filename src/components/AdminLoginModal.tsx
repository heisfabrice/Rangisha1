import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  KeyRound, 
  CheckCircle2,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTranslation } from '../lib/i18n';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const { t, language } = useTranslation();
  const { login, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Injiza email yemewe y\'ubuyobozi (Enter admin email)');
      return;
    }
    if (!password) {
      setError('Injiza ijambo ry\'ibanga ry\'ubuyobozi (Enter admin password)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await login(email.trim(), password);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ntabwo wemerewe kwinjira muri Admin Panel.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#182432] rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-[#D5DEE3] dark:border-[#2A3948] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0F1720] via-[#141E2A] to-[#111B26] border-b border-[#253443] text-[#F1F5F9] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-[#AAB7C4] hover:text-[#F1F5F9] hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-xl bg-[#16A085]/20 border border-[#2CBFAE]/30 flex items-center justify-center text-[#2CBFAE] mb-3">
            <Lock className="w-6 h-6 stroke-[2.2]" />
          </div>

          <h3 className="text-xl font-black text-[#F1F5F9]">
            Rangisha Admin Portal
          </h3>
          <p className="text-xs text-[#AAB7C4] mt-1">
            Uburyo bw'abakozi b'ubuyobozi bwa Rangisha.com gusa (Authorized Staff Only)
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-[#C99A4A] shrink-0 mt-0.5" />
            <span>
              <strong>Icyitonderwa:</strong> Nta kwiyandikisha gushya kw'aba-admin kuri uru rubuga. Koresha konti wahawe n'ubuyobozi bwa Rangisha.com.
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-[#C75C5C]/15 border border-rose-200 dark:border-[#C75C5C]/40 text-xs text-rose-800 dark:text-[#E6EDF3] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#C75C5C] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1E2933] dark:text-[#E6EDF3] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A99A8] dark:text-[#7F8C99] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter admin email address"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E2933] dark:text-[#E6EDF3] mb-1">
              Ijambo ry'Ibanga (Password / Security Key)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8A99A8] dark:text-[#7F8C99] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99] font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? 'Kwinjira...' : 'Injira muri Admin Console'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
