import React from 'react';
import { MessageSquare } from 'lucide-react';

interface FloatingWhatsAppProps {
  phone?: string;
  defaultMessage?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  phone = '0736138312',
  defaultMessage = 'Hello Rangisha.com, I would like to get more information about your services.'
}) => {
  // Format WhatsApp number for Rwanda international format (+250)
  const clean = phone.replace(/[^\d]/g, '');
  const intlNumber = clean.startsWith('0') 
    ? '25' + clean 
    : (clean.startsWith('250') ? clean : '250' + clean);

  const waLink = `https://wa.me/${intlNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside 
      aria-label="WhatsApp Contact"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:left-6 z-40 flex items-center group"
    >
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-[0_4px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.6)] transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/30 backdrop-blur-sm"
        title="Chat na Rangisha kuri WhatsApp: 0736138312"
      >
        {/* WhatsApp Icon */}
        <div className="relative">
          <MessageSquare className="w-5 h-5 fill-white stroke-none" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full" />
        </div>

        {/* Text for desktop & tablet, compact on small phones */}
        <div className="hidden xs:flex flex-col text-left">
          <span className="text-[11px] uppercase font-black tracking-wider leading-none text-white/90">
            WhatsApp
          </span>
          <span className="text-xs font-bold leading-tight font-mono text-white">
            {phone}
          </span>
        </div>

        {/* Tooltip badge */}
        <span className="hidden xl:inline-block ml-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">
          Twandikire
        </span>
      </a>
    </aside>
  );
};
