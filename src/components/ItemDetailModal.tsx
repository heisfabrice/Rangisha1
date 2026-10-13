import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  AlertTriangle, 
  MessageSquare, 
  Phone, 
  Award, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { PublishedItem, SystemSettings } from '../types';
import { useTranslation } from '../lib/i18n';

interface ItemDetailModalProps {
  item: PublishedItem | null;
  settings?: SystemSettings;
  onClose: () => void;
  onHaveInformation: (item: PublishedItem) => void;
  onReportSuspicious: (item: PublishedItem) => void;
  onOpenRecovery?: (item: PublishedItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  settings,
  onClose,
  onHaveInformation,
  onReportSuspicious,
  onOpenRecovery
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  if (!item) return null;

  const isPerson = item.type === 'missing_person' || item.type === 'found_person';
  const isMissing = item.type === 'missing_person';
  const isFoundPerson = item.type === 'found_person';
  const isLost = item.type === 'lost';
  const isChild = item.personDetails?.ageGroup === 'child' || (Boolean(item.personDetails?.age) && (item.personDetails?.age || 0) < 18);

  const rawImages = item.images && item.images.length > 0 ? item.images : ((item as any).image ? [(item as any).image] : []);
  const validImages = rawImages.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
  const hasPhoto = validImages.length > 0;
  const itemName = item.personDetails?.fullName || item.title || (item as any).name || 'Item';
  const locationText = item.location?.district 
    ? `${item.location.district}${item.location.sector ? `, ${item.location.sector}` : ''}` 
    : (typeof (item as any).location === 'string' ? (item as any).location : 'Kigali, Rwanda');

  const adminPhone = settings?.contact?.phone || '+250 788 450 120';
  const rawWaNum = settings?.contact?.whatsapp || '250788450120';
  const cleanWaNumber = rawWaNum.replace(/[^\d]/g, '');

  const waPreText = isPerson
    ? `Muraho Ranga Admin! Mfite amakuru y'umuntu ${isMissing ? 'wabuze' : 'watoraguwe'}: [${item.reportId}] ${itemName}.`
    : `Muraho Ranga Admin! Mfite amakuru cyangwa nshaka kumenya byinshi kuri ${item.reportId}: ${item.title}.`;
  const waLink = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(waPreText)}`;

  const copyReportId = () => {
    navigator.clipboard.writeText(item.reportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Rangisha.com — ${itemName}`,
        text: `${isMissing ? 'IBURIRWA RYIHUTIRWA RY\'UWABUZE:' : 'RANGISHA.COM:'} ${itemName} (${item.reportId}). Reba birambuye cyangwa tanga amakuru.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0F1720]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#182432] rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.25)] border border-[#D5DEE3] dark:border-[#2A3948] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-between bg-[#F4F7F8] dark:bg-[#141E2A]">
          <div className="flex flex-wrap items-center gap-2">
            {isMissing ? (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                isChild || item.isUrgent ? 'bg-[#C75C5C] text-white animate-pulse' : 'bg-[#C75C5C] text-white'
              }`}>
                {isChild ? '🚨 UMWANA YABUZE' : '🚨 ABABUZE / MISSING'}
              </span>
            ) : isFoundPerson ? (
              <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#16A085] text-white">
                🛡️ ABABONENSE / FOUND PERSON
              </span>
            ) : (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                isLost ? 'bg-[#C75C5C] text-[#F1F5F9]' : 'bg-[#16A085] text-[#F1F5F9]'
              }`}>
                {isLost ? 'CYATAKAYE / LOST' : 'CYATORAGUWE / FOUND'}
              </span>
            )}

            <div className="flex items-center gap-1.5 font-mono text-xs bg-[#EAF0F2] dark:bg-[#111B26] px-2.5 py-1 rounded-lg text-[#1E2933] dark:text-[#E6EDF3] font-bold border border-[#D5DEE3] dark:border-[#2A3948]">
              <span>{item.reportId}</span>
              <button onClick={copyReportId} className="text-[#7F8C99] hover:text-[#168F7D] dark:hover:text-[#2CBFAE]" title="Copy Report ID">
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#3BA982]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <span className="flex items-center gap-1 text-xs font-bold text-[#168F7D] dark:text-[#2CBFAE] bg-[#168F7D]/10 dark:bg-[rgba(44,191,174,0.12)] px-2.5 py-1 rounded-full border border-[#168F7D]/25 dark:border-[#2CBFAE]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Approved</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7F8C99] hover:text-[#1E2933] dark:hover:text-white hover:bg-[#EAF0F2] dark:hover:bg-[#1D2A38] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Main Visual */}
          <div className="space-y-2">
            <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-[#EAF0F2] dark:bg-[#111B26] border border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-center p-2">
              {hasPhoto ? (
                <img
                  src={validImages[activeImgIndex] || validImages[0]}
                  alt={itemName}
                  className="w-full h-full object-contain sm:object-cover rounded-[14px]"
                />
              ) : (
                <div className="w-full h-full rounded-[14px] flex flex-col items-center justify-center p-8 text-center bg-[#F4F7F8] dark:bg-[#141E2A] text-[#7F8C99]">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#182432] shadow-sm flex items-center justify-center mb-3 text-[#7F8C99]">
                    <HelpCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1E2933] dark:text-[#E6EDF3]">No photo available</h3>
                  <p className="text-xs text-[#7F8C99] mt-1">Nta foto yashyizweho n'ubuyobozi</p>
                </div>
              )}

              {item.rewardAmount && item.rewardAmount > 0 && (
                <div className="absolute top-4 right-4 bg-[#C99A4A] text-[#0F1720] px-3.5 py-1.5 rounded-xl font-black text-sm shadow-md flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>{item.rewardAmount.toLocaleString()} RWF Reward</span>
                </div>
              )}
            </div>

            {hasPhoto && validImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {validImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`h-16 w-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImgIndex === idx ? 'border-[#2CBFAE]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Core Meta */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1E2933] dark:text-[#F1F5F9] tracking-tight">
                {itemName}
              </h2>
              <button
                onClick={handleShare}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[#EAF0F2] dark:bg-[#1D2A38] text-xs font-bold text-[#1E2933] dark:text-[#E6EDF3] border border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#16A085] flex items-center gap-1.5 transition-colors"
              >
                <span>Isangize Abandi (Share)</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-[#607080] dark:text-[#AAB7C4]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#168F7D] dark:text-[#2CBFAE] shrink-0" />
                <span>Location: <strong className="text-[#1E2933] dark:text-[#F1F5F9] font-bold">{locationText}</strong></span>
              </span>
              {item.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#7F8C99] shrink-0" />
                  <span>Date: <strong className="text-[#1E2933] dark:text-[#F1F5F9] font-bold">{item.date}</strong></span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 font-semibold text-[#168F7D] dark:text-[#2CBFAE] bg-[#168F7D]/10 dark:bg-[rgba(44,191,174,0.12)] px-2.5 py-0.5 rounded-md border border-[#168F7D]/20 dark:border-[#2CBFAE]/30">
                <Tag className="w-3.5 h-3.5" />
                {isPerson ? (isMissing ? 'Ababuze' : 'Ababonense') : (item.categoryName || item.categoryId || 'General')}
              </span>
            </div>
          </div>

          {/* Dossier for Missing or Found Person */}
          {isPerson && item.personDetails && (
            <div className="p-5 rounded-2xl bg-[#EAF0F2]/70 dark:bg-[#141E2A] border border-[#D5DEE3] dark:border-[#2A3948] space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#168F7D] dark:text-[#2CBFAE] flex items-center gap-2">
                <span>Imyirondoro n'Ibiranga Byihariye (Person Identification Details)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {item.personDetails.age !== undefined && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948]">
                    <span className="text-[#7F8C99] block font-semibold">Imyaka (Age):</span>
                    <strong className="text-[#1E2933] dark:text-[#F1F5F9] text-sm">{item.personDetails.age} ans</strong>
                  </div>
                )}
                {item.personDetails.gender && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948]">
                    <span className="text-[#7F8C99] block font-semibold">Igitsina (Gender):</span>
                    <strong className="text-[#1E2933] dark:text-[#F1F5F9] text-sm">{item.personDetails.gender === 'female' ? 'Gore (Female)' : 'Gabo (Male)'}</strong>
                  </div>
                )}
                {item.personDetails.ageGroup && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948]">
                    <span className="text-[#7F8C99] block font-semibold">Imyaka (Age Group):</span>
                    <strong className="text-[#1E2933] dark:text-[#F1F5F9] text-sm capitalize">{item.personDetails.ageGroup}</strong>
                  </div>
                )}
                {item.personDetails.lastSeenLocation && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948]">
                    <span className="text-[#7F8C99] block font-semibold">Aho yaburiye (Last Seen):</span>
                    <strong className="text-[#1E2933] dark:text-[#F1F5F9] text-sm">{item.personDetails.lastSeenLocation}</strong>
                  </div>
                )}
                {item.personDetails.currentLocationOrShelter && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948]">
                    <span className="text-[#7F8C99] block font-semibold">Aho aherereye ubu (Location):</span>
                    <strong className="text-[#3BA982] text-sm">{item.personDetails.currentLocationOrShelter}</strong>
                  </div>
                )}
                {item.personDetails.policeCaseNumber && (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948]">
                    <span className="text-[#7F8C99] block font-semibold">Dosiye ya RIB / Polisi:</span>
                    <strong className="text-[#1E2933] dark:text-[#F1F5F9] font-mono text-sm">{item.personDetails.policeCaseNumber}</strong>
                  </div>
                )}
              </div>

              {item.personDetails.clothingDescription && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] text-xs">
                  <span className="text-[#7F8C99] block font-semibold mb-0.5">Imyenda yari yambaye (Clothing when last seen):</span>
                  <p className="text-[#1E2933] dark:text-[#E6EDF3] leading-relaxed font-medium">{item.personDetails.clothingDescription}</p>
                </div>
              )}

              {item.personDetails.physicalDescription && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#182432] border border-[#D5DEE3] dark:border-[#2A3948] text-xs">
                  <span className="text-[#7F8C99] block font-semibold mb-0.5">Ibiranga ku mubiri (Physical & Distinctive Marks):</span>
                  <p className="text-[#1E2933] dark:text-[#E6EDF3] leading-relaxed font-medium">{item.personDetails.physicalDescription}</p>
                </div>
              )}

              {item.personDetails.healthConditions && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-[#C75C5C]/15 border border-rose-200 dark:border-[#C75C5C]/30 text-xs">
                  <span className="text-rose-800 dark:text-rose-300 block font-bold mb-0.5">⚠️ Uburwayi cyangwa Ibyihutirwa by'Ubuzima:</span>
                  <p className="text-rose-950 dark:text-[#E6EDF3] leading-relaxed">{item.personDetails.healthConditions}</p>
                </div>
              )}
            </div>
          )}

          {/* Public Description */}
          <div className="bg-[#F4F7F8] dark:bg-[#141E2A] p-5 rounded-2xl border border-[#D5DEE3] dark:border-[#2A3948] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7F8C99]">
              Ibisobanuro Byemejwe (Approved Description)
            </h4>
            <p className="text-sm text-[#1E2933] dark:text-[#E6EDF3] leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
            {item.location?.landmark && (
              <p className="text-xs text-[#607080] dark:text-[#AAB7C4] pt-2 border-t border-[#D5DEE3] dark:border-[#2A3948]">
                📍 <strong>Ahantu hazwi hafi yaho:</strong> {item.location.landmark}
              </p>
            )}
          </div>

          {/* Reward Status Notice (if applicable) */}
          {!isPerson && (
            <div className="p-4 rounded-2xl bg-[#EAF0F2] dark:bg-[#1D2A38] border border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#7F8C99] font-bold uppercase text-[10px] block">Igihembo (Reward Information)</span>
                <strong className="text-[#168F7D] dark:text-[#2CBFAE] text-sm">
                  {item.rewardText || 'Vugana na Ranga Admin kumenya byinshi'}
                </strong>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#168F7D] dark:text-[#2CBFAE] font-bold hover:underline flex items-center gap-1"
              >
                <span>Sobanuza kuri WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Emergency / Hotline Callout for Missing People */}
          {isMissing && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-[#C75C5C]/15 border border-rose-200 dark:border-[#C75C5C]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <strong className="block text-rose-800 dark:text-rose-200 font-black text-sm">Waba ubonye uyu muntu cyangwa uzi aho aherereye?</strong>
                <p className="text-rose-700 dark:text-[#CBD5E1] mt-0.5">
                  Hamagara ako kanya Hotline ya Rangisha.com cyangwa Polisi y'u Rwanda kuri 112 / 116.
                </p>
              </div>
              <a
                href={`tel:${adminPhone.replace(/\s+/g, '')}`}
                className="px-5 py-2.5 rounded-xl bg-[#C75C5C] hover:bg-[#b54f4f] text-white font-bold text-xs shrink-0 flex items-center justify-center gap-2 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hamagara: {adminPhone}</span>
              </a>
            </div>
          )}

          {/* Privacy Protection Notice */}
          <div className="p-4 bg-[#16A085]/10 dark:bg-[rgba(44,191,174,0.10)] rounded-2xl border border-[#16A085]/20 dark:border-[#2CBFAE]/20 flex items-start gap-3 text-xs text-[#168F7D] dark:text-[#2CBFAE]">
            <Lock className="w-5 h-5 text-[#168F7D] dark:text-[#2CBFAE] shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-[#1E2933] dark:text-[#F1F5F9]">Umutekano n'Ibanga (Strict Privacy & Security Guard)</span>
              <p className="text-[#607080] dark:text-[#AAB7C4] leading-relaxed mt-0.5">
                Kuri Rangisha.com, nimero za telefone n'amakuru y'ibanga y'abaturage ntibishyirwa ku mugaragaro. Ibiganiro byose byerekeye kugarura iki kintu cyangwa guhuza uyu muntu n'umuryango we bicungwa n'ubuyobozi bwa Rangisha.com mu mutekano busesuye.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#D5DEE3] dark:border-[#2A3948] bg-[#F4F7F8] dark:bg-[#141E2A] flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <button
            onClick={() => onReportSuspicious(item)}
            className="text-xs font-semibold text-[#C75C5C] hover:underline flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Tanga Impuruza ku Byanditswe</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            
            {/* Button 1: "RANGISHA" for found items */}
            {item.type === 'found' && onOpenRecovery && (
              <button
                onClick={() => onOpenRecovery(item)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
              >
                <Sparkles className="w-4 h-4 text-[#C99A4A]" />
                <span>Ranga — Iyi ni Iyanjye</span>
              </button>
            )}

            {/* Button 2: "Contact Ranga via WhatsApp" */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAF0F2] dark:bg-[#1D2A38] hover:bg-[#D5DEE3] dark:hover:bg-[#233344] text-[#1E2933] dark:text-[#D7E0E8] font-bold text-xs sm:text-sm border border-[#D5DEE3] dark:border-[#2A3948] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#168F7D] dark:text-[#2CBFAE]" />
              <span>WhatsApp Admin</span>
            </a>

            {/* Button 3: "I HAVE INFORMATION" */}
            <button
              onClick={() => onHaveInformation(item)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] font-bold text-xs sm:text-sm shadow-md transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isPerson ? 'Tanga Amakuru' : 'Mfite Amakuru'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
