import React, { useRef, useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Coins,
  Languages,
  Smartphone,
  Copy,
  Check,
  Cloud,
  CloudUpload,
  CloudDownload,
  LogOut,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { Account, Budget, Category, CurrencyConfig, DebtRecord, Language, Transaction } from '../types';
import { translations, AVAILABLE_LANGUAGES } from '../data/translations';
import { DEFAULT_CURRENCIES } from '../data/initialData';
import { exportTransactionsToCSV, downloadJSONBackup } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  debts: DebtRecord[];
  currency: CurrencyConfig;
  onSelectCurrency: (curr: CurrencyConfig) => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onResetToZero: () => void;
  onLoadDemoData: () => void;
  onRestoreData: (data: {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
    budgets: Budget[];
    debts?: DebtRecord[];
  }) => void;
  currentUser: User | null;
  onSignInGoogle: () => Promise<void>;
  onSignInGuest: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSyncToCloud: () => Promise<void>;
  onRestoreFromCloud: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  accounts,
  budgets,
  debts,
  currency,
  onSelectCurrency,
  language,
  onSelectLanguage,
  onResetToZero,
  onLoadDemoData,
  onRestoreData,
  currentUser,
  onSignInGoogle,
  onSignInGuest,
  onSignOut,
  onSyncToCloud,
  onRestoreFromCloud,
  isSyncing,
  lastSyncTime,
}) => {
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const appUrl = window.location.href;

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, categories, accounts, currency.symbol);
  };

  const handleDownloadBackup = () => {
    downloadJSONBackup({
      transactions,
      accounts,
      categories,
      budgets,
      debts,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.transactions)) {
            onRestoreData(parsed);
            alert(language === 'mr' ? 'बॅकअप यशस्वीरीत्या रिस्टोअर झाला!' : 'Backup successfully restored!');
            onClose();
          } else {
            alert(language === 'mr' ? 'अवैध फाईल फॉरमॅट.' : 'Invalid backup file format.');
          }
        } catch {
          alert(language === 'mr' ? 'फाईल वाचण्यात त्रुटी आली.' : 'Error reading backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      await onSignInGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setAuthError(null);
      await onSignInGuest();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#d32f2f] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} />
            <div>
              <h3 className="font-bold text-base leading-tight">
                {t.settingsAndBackup}
              </h3>
              <p className="text-[11px] text-white/80">
                {t.lifetimeFreeBadge} &bull; Firebase Cloud Enabled
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800">

          {/* Firebase Cloud Sync Card */}
          <div className="border-2 border-emerald-500/30 bg-emerald-50/50 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <Cloud size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-emerald-950">
                      {language === 'mr' ? 'गुगल फायरबेस क्लाउड सिंक (Firebase Cloud)' : 'Google Firebase Cloud Sync'}
                    </h4>
                    <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-full uppercase">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    {language === 'mr'
                      ? 'तुमचा खर्च व उत्पन्न डेटा सुरक्षित Google Cloud मध्ये सिंक होतो.'
                      : 'Real-time automatic cloud backup across your devices.'}
                  </p>
                </div>
              </div>
            </div>

            {currentUser ? (
              <div className="bg-white rounded-xl p-3 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-9 h-9 rounded-full border border-emerald-300 shadow-2xs"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        <UserIcon size={18} />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {currentUser.displayName || (currentUser.isAnonymous ? 'Guest User (Cloud Ready)' : 'Firebase User')}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {currentUser.email || `UID: ${currentUser.uid.slice(0, 10)}...`}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onSignOut}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-rose-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 bg-slate-50 transition"
                  >
                    <LogOut size={13} />
                    <span>{language === 'mr' ? 'बाहेर पडा' : 'Sign Out'}</span>
                  </button>
                </div>

                {lastSyncTime && (
                  <div className="text-[11px] text-slate-600 bg-emerald-50/80 px-2.5 py-1 rounded-lg flex items-center justify-between">
                    <span className="font-medium">
                      {language === 'mr' ? 'शेवटचा सिंक:' : 'Last Synced:'}
                    </span>
                    <span className="font-semibold text-emerald-800">{lastSyncTime}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onSyncToCloud}
                    disabled={isSyncing}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <CloudUpload size={14} />
                    )}
                    <span>
                      {isSyncing
                        ? (language === 'mr' ? 'सिंक होत आहे...' : 'Syncing...')
                        : (language === 'mr' ? 'आताच क्लाउडवर सेव्ह करा' : 'Sync to Cloud Now')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onRestoreFromCloud}
                    disabled={isSyncing}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition shadow-2xs disabled:opacity-50"
                  >
                    <CloudDownload size={14} />
                    <span>
                      {language === 'mr' ? 'क्लाउडवरून डेटा आणा' : 'Restore from Cloud'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-3 border border-emerald-200 space-y-2.5">
                <p className="text-xs text-slate-600">
                  {language === 'mr'
                    ? 'गुगल अकाउंटने लॉगिन करा जेणेकरून कोणत्याही फोन किंवा कम्प्युटरवर तुमचा सर्व डेटा सुरक्षित राहील.'
                    : 'Sign in to access your money manager data securely from any phone or browser.'}
                </p>

                {authError && (
                  <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {authError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{language === 'mr' ? 'गुगलने साइन इन करा' : 'Sign in with Google'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 active:scale-95"
                  >
                    <UserIcon size={14} />
                    <span>{language === 'mr' ? 'गेस्ट मोड (क्लाउड)' : 'Guest Cloud Mode'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Language Selection Grid */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Languages size={16} className="text-[#d32f2f]" />
              <span>{t.languageLabel} (Select App Language)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onSelectLanguage(lang.code)}
                    className={`p-2.5 rounded-xl text-center border font-bold text-xs transition-all active:scale-95 ${
                      isSelected
                        ? 'border-[#d32f2f] bg-rose-50 text-[#d32f2f] ring-2 ring-[#d32f2f]/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="text-sm font-bold">{lang.nativeName}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{lang.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile App & APK 30-Day Trial Info Card */}
          <div className="border border-rose-200 bg-rose-50/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 bg-[#d32f2f] text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                <Smartphone size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#d32f2f]">
                    {language === 'mr' ? 'मोबाईल ॲप / APK ट्रायल (३० दिवस व आजीवन)' : 'Mobile App / APK Trial (Lifetime Free)'}
                  </h4>
                  <span className="text-[10px] bg-rose-200/80 text-rose-900 font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                    100% Free
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {language === 'mr'
                    ? 'हे ॲप Android फोनवर पूर्ण स्क्रीनमध्ये चालवण्यासाठी Chrome मध्ये "Install app" (किंवा Add to Home Screen) करा. ३० दिवस किंवा आयुष्यभर मोफत चालेल.'
                    : 'To run this app full-screen on your Android phone, tap "Install app" or "Add to Home screen" in Chrome. Runs offline forever with no expiry.'}
                </p>

                {/* Direct Link Copy */}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 bg-white border border-rose-200 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-600 truncate font-mono select-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleCopyAppUrl}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#d32f2f] text-white rounded-xl font-bold text-xs hover:bg-rose-800 active:scale-95 transition shrink-0 shadow-xs"
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedLink ? (language === 'mr' ? 'कॉपी झाले!' : 'Copied!') : (language === 'mr' ? 'लिंक कॉपी' : 'Copy Link')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Zero Starting Balance Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-600 text-white rounded-xl shrink-0 mt-0.5">
                <RotateCcw size={18} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-amber-900">
                  {t.zeroNoticeTitle}
                </h4>
                <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                  {t.zeroNoticeDesc}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {isConfirmingReset ? (
                    <div className="flex items-center gap-2 bg-amber-100/90 border border-amber-300 rounded-xl px-3 py-1.5 shadow-xs">
                      <span className="text-xs font-bold text-amber-950">
                        {language === 'mr' ? 'सर्व डेटा 0 करायचा?' : 'Reset all data to 0?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onResetToZero();
                          setIsConfirmingReset(false);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs"
                      >
                        {language === 'mr' ? 'होय' : 'Yes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingReset(false)}
                        className="px-2 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingReset(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      {t.resetZeroBalance}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onLoadDemoData();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold text-xs transition-colors"
                  >
                    {t.loadDemoData}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="border border-slate-200 rounded-2xl p-4">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Coins size={16} className="text-slate-500" />
              <span>{t.currencyLabel}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEFAULT_CURRENCIES.map((c) => {
                const isSelected = currency.code === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => onSelectCurrency(c)}
                    className={`p-2.5 rounded-xl text-center border font-bold text-xs transition-all ${
                      isSelected
                        ? 'border-[#d32f2f] bg-rose-50 text-[#d32f2f] ring-1 ring-[#d32f2f]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-base">{c.symbol}</div>
                    <div className="text-[11px] text-slate-500 font-normal">
                      {language === 'mr' ? c.nameMr : c.code}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data Export & Backup Actions */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {language === 'mr' ? 'डेटा एक्सपोर्ट व बॅकअप (Free)' : 'Export & Offline Backup'}
            </h4>

            {/* CSV Export */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {language === 'mr' ? 'Excel / CSV फाईल डाउनलोड' : 'Excel / CSV Spreadsheet'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {t.exportCSVDescription}
                </div>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shrink-0 shadow-xs"
              >
                <FileSpreadsheet size={15} />
                <span>{t.downloadCsvBtn}</span>
              </button>
            </div>

            {/* JSON Backup Download */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {language === 'mr' ? 'संपूर्ण डेटा बॅकअप' : 'Full Device Backup (JSON)'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {t.backupJSONDescription}
                </div>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shrink-0 shadow-xs"
              >
                <Download size={15} />
                <span>{t.downloadBackupBtn}</span>
              </button>
            </div>

            {/* JSON Restore */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {language === 'mr' ? 'बॅकअप रिस्टोअर करा' : 'Restore from Backup'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {t.restoreJSONDescription}
                </div>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shrink-0"
                >
                  <Upload size={15} />
                  <span>{t.restoreBtn}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};
