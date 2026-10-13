import React from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle2, Phone, MessageSquare, Calendar, ShieldAlert } from 'lucide-react';
import { ServiceSettings } from '../types';

interface OfficeServiceNoticeProps {
  service?: ServiceSettings;
  officeAddress?: string;
  officeHours?: string;
  hotline?: string;
  whatsapp?: string;
}

export const OfficeServiceNotice: React.FC<OfficeServiceNoticeProps> = ({
  service,
  officeAddress = 'KN 3 Rd, CHIC Complex, 3rd Floor, Kigali, Rwanda',
  officeHours = 'Kuwa Mbere - Kuwa Gatandatu: 8:00 AM - 6:00 PM CAT',
  hotline = '0794473504',
  whatsapp = '0736138312'
}) => {
  const isAvailable = service?.available === true && service?.status === 'available';
  const isComingSoon = !isAvailable;
  
  const statusBadgeText = isAvailable
    ? 'Service Active'
    : (service?.status === 'unavailable' ? 'Temporarily Unavailable' : 'Service Coming Soon');

  const mainMessageEn = service?.message || 'This service is currently unavailable and will be available in the coming days.';
  const mainMessageRw = service?.messageRw || 'Iyi serivisi yo kwakira ibyangombwa mu biro ntabwo iratangira, irimo gutunganywa neza kandi izatangira mu minsi iri imbere.';
  const expectedAvailability = service?.expectedAvailability || 'Coming days';

  const cleanWa = whatsapp.replace(/[^\d]/g, '');
  const waLink = `https://wa.me/${cleanWa.startsWith('0') ? '25' + cleanWa : cleanWa}?text=${encodeURIComponent('Muraho Rangisha.com! Nshaka kumenya amakuru ku bijyanye na serivisi zanyu.')}`;

  return (
    <section 
      aria-label="Office Service Availability Notice"
      className="p-6 sm:p-8 md:p-10 rounded-[20px] bg-[#111B26] border border-[#253443] text-[#E6EDF3] shadow-[0_4px_24px_rgba(0,0,0,0.22)] space-y-6 transition-all"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Column: Heading & Service Info */}
        <div className="space-y-3.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A085]/15 text-[#2CBFAE] text-xs font-bold border border-[#2CBFAE]/30">
              <MapPin className="w-3.5 h-3.5 text-[#2CBFAE]" />
              <span>Ibiro Bikuru bya Rangisha.com mu Rwanda</span>
            </div>

            {/* Service Availability Badge */}
            {isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#3BA982]/15 text-[#3BA982] border border-[#3BA982]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{statusBadgeText}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#C99A4A]/15 text-[#E5B567] border border-[#C99A4A]/30 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>{statusBadgeText}</span>
              </span>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-[#F1F5F9] tracking-tight leading-tight">
            Ushobora no Kugana Ibiro Byawe mu Mujyi wa Kigali
          </h3>

          {/* Coming Soon Notice Card */}
          {isComingSoon ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#182432]/90 border border-[#C99A4A]/35 text-[#CBD5E1] space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#C99A4A]/20 text-[#E5B567] shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-extrabold text-[#F1F5F9]">
                      Notice: {mainMessageEn}
                    </h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#C99A4A]/20 text-[#E5B567] border border-[#C99A4A]/30">
                      Expected: {expectedAvailability}
                    </span>
                  </div>
                  <p className="text-xs text-[#AAB7C4] leading-relaxed">
                    {mainMessageRw}
                  </p>
                </div>
              </div>

              {/* Status explanation bullet list */}
              <div className="pt-3 border-t border-[#2A3948] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#AAB7C4]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B567]" />
                  <span>The service is not available yet.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B567]" />
                  <span>It is being actively prepared.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B567]" />
                  <span>Expected to become available in coming days.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5B567]" />
                  <span>Please check back later or contact us online.</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-[#AAB7C4] leading-relaxed">
              Ku bafite ibyangombwa by'agaciro bifuza gushyikiriza abakozi bacu imbonankubone cyangwa kwakira ubufasha mu biro, murahawe ikaze.
            </p>
          )}
        </div>

        {/* Right Column: Office Details & Direct Actions */}
        <div className="w-full lg:w-auto shrink-0 space-y-4">
          <div className="space-y-3 text-xs text-[#AAB7C4] bg-[#182432] p-4 sm:p-5 rounded-2xl border border-[#2A3948] w-full max-w-sm">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#2CBFAE] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#F1F5F9] block">Aderesi y'Ibiro:</span>
                <span className="text-[#CBD5E1]">{officeAddress}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#2CBFAE] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#F1F5F9] block">Amasaha y'Akazi:</span>
                <span className="text-[#CBD5E1]">{officeHours}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
            {isComingSoon ? (
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-xl bg-[#141E2A] text-[#7F8C99] border border-[#2A3948] text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                title="This in-person service is currently being prepared and will be available soon."
              >
                <Clock className="w-3.5 h-3.5 text-[#E5B567]" />
                <span>Office Visit Unavailable — Coming Soon</span>
              </button>
            ) : (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(officeAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Reba Aderesi ku Ikarita</span>
              </a>
            )}

            {/* Quick Contact Fallback buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${hotline}`}
                className="py-2.5 px-3 rounded-xl bg-[#182432] hover:bg-[#1D2A38] text-[#F1F5F9] border border-[#2A3948] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                title={`Call Hotline ${hotline}`}
              >
                <Phone className="w-3.5 h-3.5 text-[#2CBFAE]" />
                <span>Hotline</span>
              </a>

              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                title={`WhatsApp ${whatsapp}`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
