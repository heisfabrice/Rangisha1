import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  MapPin, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  Award,
  Upload,
  Clock,
  Sparkles
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../lib/categories';
import { RWANDA_LOCATIONS } from '../lib/locations';
import { api } from '../lib/api';
import { useTranslation } from '../lib/i18n';

interface ReportLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reportId: string, caseNumber: string) => void;
}

export const ReportLostModal: React.FC<ReportLostModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t, language } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ reportId: string; caseNumber: string; message: string } | null>(null);

  // Form State
  const [personName, setPersonName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  const [itemName, setItemName] = useState('');
  const [categoryId, setCategoryId] = useState('phones');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [uniqueIdentifyingInfo, setUniqueIdentifyingInfo] = useState('');

  const [dateLost, setDateLost] = useState(new Date().toISOString().split('T')[0]);
  const [approximateTime, setApproximateTime] = useState('14:00');

  const [selectedProvince, setSelectedProvince] = useState(RWANDA_LOCATIONS[0].name);
  const [selectedDistrict, setSelectedDistrict] = useState(RWANDA_LOCATIONS[0].districts[0].name);
  const [sector, setSector] = useState('');
  const [cell, setCell] = useState('');
  const [village, setVillage] = useState('');
  const [landmark, setLandmark] = useState('');

  const [photoUrl, setPhotoUrl] = useState('');
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [additionalNotes, setAdditionalNotes] = useState('');

  if (!isOpen) return null;

  const currentDistricts = RWANDA_LOCATIONS.find(p => p.name === selectedProvince)?.districts || [];
  const currentSectors = currentDistricts.find(d => d.name === selectedDistrict)?.sectors || [];

  const handleProvinceChange = (pName: string) => {
    setSelectedProvince(pName);
    const prov = RWANDA_LOCATIONS.find(p => p.name === pName);
    if (prov && prov.districts.length > 0) {
      setSelectedDistrict(prov.districts[0].name);
      setSector('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !phone.trim() || !description.trim()) {
      setError(language === 'rw' 
        ? 'Amazina y\'ikintu, telefone n\'ibisobanuro birakenewe.' 
        : 'Item name, phone number, and description are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const catObj = INITIAL_CATEGORIES.find(c => c.id === categoryId);
      const photos = photoUrl.trim() ? [photoUrl.trim()] : [
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'
      ];

      const res = await api.reportLostItem({
        personName: personName.trim() || 'Citizen User',
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim() || undefined,
        itemName: itemName.trim(),
        categoryId,
        categoryName: catObj ? (language === 'rw' ? catObj.nameRw : catObj.nameEn) : 'Items',
        description: description.trim(),
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        color: color.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        uniqueIdentifyingInfo: uniqueIdentifyingInfo.trim() || undefined,
        date: dateLost,
        approximateTime,
        location: {
          province: selectedProvince,
          district: selectedDistrict,
          sector: sector.trim() || undefined,
          cell: cell.trim() || undefined,
          village: village.trim() || undefined,
          landmark: landmark.trim() || undefined
        },
        photos,
        rewardInfo: {
          offeredOrExpected: rewardAmount > 0,
          amount: rewardAmount > 0 ? rewardAmount : undefined
        },
        rewardAmount: rewardAmount > 0 ? rewardAmount : undefined,
        additionalInfo: additionalNotes.trim()
      });

      setSuccessInfo({
        reportId: res.reportId,
        caseNumber: res.caseNumber,
        message: res.message
      });
      onSuccess(res.reportId, res.caseNumber);
    } catch (err: any) {
      setError(err.message || 'Habaye ikosa mu kohereza raporo. Ongera ugerageze.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-600 to-rose-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">
                RANGISHA IKINTU CYATAKAYE — Report Lost Item
              </h3>
              <p className="text-xs text-rose-100">
                Tanga amakuru arambuye y'icyo wabuze ngo kigenzurwe kandi kigaruzwe vuba
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

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {successInfo ? (
            <div className="text-center py-8 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 mx-auto flex items-center justify-center border border-rose-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-300">
                    Report ID: {successInfo.reportId}
                  </span>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300">
                    Case: {successInfo.caseNumber}
                  </span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Raporo Yageze ku Buyobozi bwa Rangisha.com!
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  {successInfo.message}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 text-left space-y-2">
                <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>Icyo Rangisha.com igiye gukora:</span>
                </div>
                <p>• Smart Matching engine irahita ishakisha niba hari uwatoraguye ikintu gisa n'iki.</p>
                <p>• Abakozi b'ubuyobozi barasuzuma amakuru watanze, niba yujuje ibisabwa ahite ashyirwa ku rubuga rw'amahanga n'u Rwanda.</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-xl shadow-rose-600/25 transition-all"
              >
                Funga (Done)
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* SECTION 1: Item Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  <span>1. Amakuru y'Ikintu Cyatakaye (Item Details)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Izina ry'Ikintu Cyatakaye (Item Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={itemName}
                      onChange={e => setItemName(e.target.value)}
                      placeholder="Urugero: Indangamuntu ya Mugisha Jean Claude, iPhone 14 Pro, Ikofi y'umukara..."
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Icyiciro (Category) *
                    </label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    >
                      {INITIAL_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>
                          {language === 'rw' ? c.nameRw : c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ibara (Color)
                    </label>
                    <input
                      type="text"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      placeholder="Urugero: Umukara, Umweru, Ubururu..."
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ubwoko / Urushinge (Brand)
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      placeholder="Urugero: Apple, Samsung, HP, Dell, N/A..."
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      placeholder="Urugero: Galaxy S22, MacBook Pro 14"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nimero y'Icyangombwa / Serie (Serial/ID Number)
                    </label>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={e => setSerialNumber(e.target.value)}
                      placeholder="Urugero: 1199580012345678 cyangwa IMEI"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ifoto y'Ikintu (Photo URL)
                    </label>
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={e => setPhotoUrl(e.target.value)}
                      placeholder="https://images... cyangwa ohereza kuri WhatsApp"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ibisobanuro birambuye (Detailed Description) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Sobanura neza: Icyo cyari kirimo, ibimenyetso byihariye, ahantu cyataye, ibintu bidasanzwe kigaragaza..."
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Location & Date */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>2. Aho n'Igihe Cyatakiye (Location in Rwanda & Date)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Intara (Province)
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={e => handleProvinceChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    >
                      {RWANDA_LOCATIONS.map(p => (
                        <option key={p.name} value={p.name}>{p.nameRw} ({p.name})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Akarere (District) *
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={e => setSelectedDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    >
                      {currentDistricts.map(d => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Umurenge (Sector)
                    </label>
                    {currentSectors.length > 0 ? (
                      <select
                        value={sector}
                        onChange={e => setSector(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                      >
                        <option value="">-- Hitamo Umurenge --</option>
                        {currentSectors.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={sector}
                        onChange={e => setSector(e.target.value)}
                        placeholder="Umurenge"
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Akagari (Cell)
                    </label>
                    <input
                      type="text"
                      value={cell}
                      onChange={e => setCell(e.target.value)}
                      placeholder="Akagari"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Umudugudu (Village)
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={e => setVillage(e.target.value)}
                      placeholder="Umudugudu"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ahantu hazwi hafi yaho (Landmark)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      placeholder="Urugero: Kuri Stade Amahoro, Gare ya Nyabugogo"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Italiki Cyatakiye (Date Lost) *
                    </label>
                    <input
                      type="date"
                      required
                      value={dateLost}
                      onChange={e => setDateLost(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Isaha yabereyeho (Approx. Time)
                    </label>
                    <input
                      type="time"
                      value={approximateTime}
                      onChange={e => setApproximateTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Igihembo cyo gushimira uwakibonye (Reward - RWF)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={rewardAmount || ''}
                      onChange={e => setRewardAmount(parseInt(e.target.value, 10) || 0)}
                      placeholder="0 RWF (Optional)"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Contact Details (Strictly Private) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-500" />
                  <span>3. Amakuru yawe (Contact Info — Strictly Private)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Amazina yawe (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={personName}
                      onChange={e => setPersonName(e.target.value)}
                      placeholder="Urugero: Uwase Alice"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Telefone yawe (Phone) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0788 123 456"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp yawe
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      placeholder="250788123456"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email yawe (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="alice@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Icyitonderwa cy'umutekano:</strong> Nimero yawe ntizashyirwa ku mugaragaro. Ubuyobozi bwa Rangisha.com nibwo buzakuvugisha iyo ikintu kibonetse cyangwa uwagitoraguye yakiriye amakuru.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
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
                  className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-600/30 transition-all hover:scale-105 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Kohereza...</span>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Rangisha Ikintu Cyatakaye (Submit Lost Report)</span>
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
