import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  KeyRound, 
  Mail, 
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../lib/auth';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
  onBackToHome?: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToHome
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Injiza email yemewe y'ubuyobozi (Enter admin email)");
      return;
    }
    if (!password) {
      setError("Injiza ijambo ry'ibanga ry'ubuyobozi (Enter admin password)");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await login(email.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Ntabwo wemerewe kwinjira muri Admin Console. Reba ko ijambo ry'ibanga ari ryo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-[#182432] rounded-[20px] shadow-[0_10px_35px_rgba(0,0,0,0.2)] border border-[#D5DEE3] dark:border-[#2A3948] overflow-hidden">
        
        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-[#0F1720] via-[#141E2A] to-[#111B26] border-b border-[#253443] text-[#F1F5F9] relative">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="absolute top-5 left-5 p-2 rounded-xl text-[#AAB7C4] hover:text-[#F1F5F9] hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ahabanza</span>
            </button>
          )}

          <div className="w-14 h-14 rounded-2xl bg-[#16A085]/20 border border-[#2CBFAE]/30 flex items-center justify-center text-[#2CBFAE] mb-4 mx-auto mt-2">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>

          <h2 className="text-2xl font-black text-center text-[#F1F5F9]">
            Rangisha Admin Portal
          </h2>
          <p className="text-xs text-[#AAB7C4] text-center mt-1.5">
            Uburyo bw'abakozi b'ubuyobozi bwa Rangisha.com gusa (Authorized Staff Only)
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-[#C99A4A] shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Icyitonderwa cy'Umutekano:</strong> Injiza Email n'Ijambo ry'Ibanga wahawe n'ubuyobozi kugira ngo ufungure Administrator Console.
            </span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-[#C75C5C]/15 border border-rose-200 dark:border-[#C75C5C]/40 text-xs text-rose-800 dark:text-[#F1F5F9] flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#C75C5C] shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3] mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A99A8] dark:text-[#7F8C99] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Injiza email yawe y'ubuyobozi"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#1E2933] dark:text-[#E6EDF3] mb-1.5">
              Ijambo ry'Ibanga (Password / Security Key)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8A99A8] dark:text-[#7F8C99] absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Injiza ijambo ry'ibanga"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] outline-none focus:border-[#2CBFAE] focus:ring-2 focus:ring-[#2CBFAE]/20 text-[#1E2933] dark:text-[#E6EDF3] placeholder-[#8A99A8] dark:placeholder-[#7F8C99]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-black text-xs sm:text-sm shadow-md shadow-[#16A085]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
