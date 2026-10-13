import React from 'react';
import { 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Award, 
  Eye, 
  Lock,
  Tag,
  MessageSquare,
  ImageOff
} from 'lucide-react';
import { PublishedItem } from '../types';
import { useTranslation } from '../lib/i18n';

interface ItemCardProps {
  item: PublishedItem;
  onViewDetails: (item: PublishedItem) => void;
  onHaveInformation: (item: PublishedItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onViewDetails, onHaveInformation }) => {
  const { t } = useTranslation();
  const isPerson = item.type === 'missing_person' || item.type === 'found_person';
  const isMissing = item.type === 'missing_person';
  const isFoundPerson = item.type === 'found_person';
  const isLost = item.type === 'lost';
  const isChild = item.personDetails?.ageGroup === 'child' || (Boolean(item.personDetails?.age) && (item.personDetails?.age || 0) < 18);
  
  // Resolve image or optional photo
  const rawImages = item.images && item.images.length > 0 ? item.images : ((item as any).image ? [(item as any).image] : []);
  const validPhoto = rawImages.length > 0 && typeof rawImages[0] === 'string' && rawImages[0].trim().length > 0 ? rawImages[0].trim() : null;
  const itemName = item.personDetails?.fullName || item.title || (item as any).name || 'Item';
  const locationText = item.location?.district 
    ? `${item.location.district}${item.location.sector ? `, ${item.location.sector}` : ''}` 
    : (typeof (item as any).location === 'string' ? (item as any).location : 'Kigali, Rwanda');

  const getStatusBadge = () => {
    switch (item.status) {
      case 'searching':
        return <span className="bg-[#C99A4A]/20 text-[#C99A4A] border border-[#C99A4A]/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Searching</span>;
      case 'possible_match':
        return <span className="bg-[#C99A4A]/20 text-[#C99A4A] border border-[#C99A4A]/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Possible Match</span>;
      case 'found':
        return <span className="bg-[#3BA982]/20 text-[#3BA982] border border-[#3BA982]/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Found</span>;
      case 'recovery_in_progress':
        return <span className="bg-[#4F9D8A]/20 text-[#4F9D8A] border border-[#4F9D8A]/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Recovery In Progress</span>;
      case 'recovered':
        return <span className="bg-[#4F9D8A]/20 text-[#4F9D8A] border border-[#4F9D8A]/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Recovered</span>;
      default:
        return <span className="bg-[#3BA982]/20 text-[#3BA982] border border-[#3BA982]/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{item.status || 'Active'}</span>;
    }
  };

  return (
    <div className={`group relative bg-white dark:bg-[#182432] rounded-[16px] border ${
      isMissing && (isChild || item.isUrgent)
        ? 'border-[#C75C5C]/60 hover:border-[#C75C5C] shadow-[0_4px_20px_rgba(199,92,92,0.18)]'
        : 'border-[#D5DEE3] dark:border-[#2A3948] hover:border-[#16A085] dark:hover:border-[#2CBFAE] shadow-[0_4px_20px_rgba(0,0,0,0.18)]'
    } hover:-translate-y-[2px] transition-all duration-200 flex flex-col overflow-hidden`}>
      
      {/* Top Image & Container */}
      <div 
        className="relative h-[220px] w-full bg-[#EAF0F2] dark:bg-[#111B26] border-b border-[#D5DEE3] dark:border-[#2A3948] overflow-hidden cursor-pointer flex items-center justify-center p-2.5"
        onClick={() => onViewDetails(item)}
      >
        {validPhoto ? (
          <img
            src={validPhoto}
            alt={itemName}
            className="w-full h-full object-cover rounded-[14px] border border-transparent dark:border-[#2A3948] group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full rounded-[14px] border border-[#D5DEE3] dark:border-[#2A3948] flex flex-col items-center justify-center p-6 text-center bg-[#F4F7F8] dark:bg-[#141E2A] text-[#7F8C99]">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#182432] shadow-sm flex items-center justify-center mb-2 text-[#7F8C99]">
              <ImageOff className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-[#1E2933] dark:text-[#E6EDF3]">No photo available</span>
            <span className="text-[10px] text-[#7F8C99]">Nta foto ihari</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 items-center">
          {isMissing ? (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase shadow-sm ${
              isChild || item.isUrgent ? 'bg-[#C75C5C] text-white animate-pulse' : 'bg-[#C75C5C] text-white'
            }`}>
              {isChild ? '🚨 UMWANA YABUZE' : '🚨 ABABUZE / MISSING'}
            </span>
          ) : isFoundPerson ? (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase shadow-sm bg-[#16A085] text-white">
              🛡️ ABABONENSE / FOUND
            </span>
          ) : (
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase shadow-sm ${
              isLost ? 'bg-[#C75C5C] text-[#F1F5F9]' : 'bg-[#16A085] text-[#F1F5F9]'
            }`}>
              {isLost ? 'CYATAKAYE / LOST' : 'CYATORAGUWE / FOUND'}
            </span>
          )}

          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/95 dark:bg-[#182432]/95 text-[#168F7D] dark:text-[#2CBFAE] border border-[#168F7D]/30 dark:border-[#2CBFAE]/30">
            <CheckCircle className="w-3 h-3 text-[#168F7D] dark:text-[#2CBFAE]" />
            <span>Ranga Verified</span>
          </span>
        </div>

        {/* Reward Pill */}
        {item.rewardAmount && item.rewardAmount > 0 ? (
          <div className="absolute top-4 right-4 bg-[#C99A4A] text-[#0F1720] font-black text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>{item.rewardAmount.toLocaleString()} RWF</span>
          </div>
        ) : null}

        {/* Privacy badge */}
        <div className="absolute bottom-4 left-4 bg-[#0F1720]/85 text-[#AAB7C4] text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#2A3948]">
          <Lock className="w-2.5 h-2.5 text-[#2CBFAE]" />
          <span>Privacy Protected</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-[#607080] dark:text-[#7F8C99] mb-1.5">
            <span className="inline-flex items-center gap-1 font-semibold text-[#168F7D] dark:text-[#2CBFAE]">
              <Tag className="w-3 h-3" />
              {item.categoryName || item.categoryId || (isPerson ? 'Abantu (People)' : 'General')}
            </span>
            <span className="font-mono text-[11px] bg-[#EAF0F2] dark:bg-[#141E2A] text-[#607080] dark:text-[#AAB7C4] px-2 py-0.5 rounded border border-[#D5DEE3] dark:border-[#2A3948]">
              {item.reportId}
            </span>
          </div>

          {/* Item / Person Name */}
          <h3 
            className="font-extrabold text-base text-[#1E2933] dark:text-[#E6EDF3] line-clamp-2 hover:text-[#168F7D] dark:hover:text-[#2CBFAE] cursor-pointer transition-colors"
            onClick={() => onViewDetails(item)}
          >
            {itemName}
          </h3>

          {/* Person-specific metadata */}
          {isPerson && item.personDetails && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              {item.personDetails.age !== undefined && (
                <span className="px-2 py-0.5 rounded-md bg-[#EAF0F2] dark:bg-[#1D2A38] font-bold text-[#1E2933] dark:text-[#E6EDF3]">
                  Imyaka: {item.personDetails.age}
                </span>
              )}
              {item.personDetails.gender && (
                <span className="px-2 py-0.5 rounded-md bg-[#EAF0F2] dark:bg-[#1D2A38] text-[#607080] dark:text-[#AAB7C4]">
                  {item.personDetails.gender === 'female' ? 'Igitsina Gore' : 'Igitsina Gabo'}
                </span>
              )}
              {item.personDetails.currentLocationOrShelter && (
                <span className="px-2 py-0.5 rounded-md bg-[#3BA982]/15 text-[#3BA982] font-semibold">
                  Aho ari: {item.personDetails.currentLocationOrShelter}
                </span>
              )}
            </div>
          )}

          {/* Location & Date */}
          <div className="mt-2 space-y-1 text-xs text-[#607080] dark:text-[#AAB7C4]">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#168F7D] dark:text-[#2CBFAE] shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
            {item.date && (
              <div className="flex items-center gap-1.5 font-medium text-[#7F8C99]">
                <Calendar className="w-3.5 h-3.5 text-[#7F8C99] shrink-0" />
                <span>{item.date}</span>
              </div>
            )}
          </div>

          {/* Clothes / Description */}
          {item.personDetails?.clothingDescription ? (
            <p className="text-xs text-[#607080] dark:text-[#AAB7C4] line-clamp-2 mt-2 leading-relaxed">
              <strong className="text-[#1E2933] dark:text-[#E6EDF3]">Imyenda:</strong> {item.personDetails.clothingDescription}
            </p>
          ) : (
            <p className="text-xs text-[#607080] dark:text-[#AAB7C4] line-clamp-2 mt-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Status indicator */}
        <div className="pt-2 border-t border-[#D5DEE3] dark:border-[#2A3948] flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-[#7F8C99]">Status</span>
          {getStatusBadge()}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails(item)}
            className="py-2.5 px-3 rounded-xl border border-[#D5DEE3] dark:border-[#2A3948] bg-[#EAF0F2] dark:bg-[#1D2A38] hover:border-[#168F7D] dark:hover:border-[#2CBFAE] text-[#1E2933] dark:text-[#D7E0E8] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Reba Byose</span>
          </button>

          <button
            onClick={() => onHaveInformation(item)}
            className="py-2.5 px-3 rounded-xl font-bold text-xs bg-[#16A085] hover:bg-[#2CBFAE] text-[#F1F5F9] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isPerson ? 'Tanga Amakuru' : 'Mfite Amakuru'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
