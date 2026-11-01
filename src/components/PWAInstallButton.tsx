import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Share2,
  PlusSquare,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Current app URL
  const appUrl = window.location.href;

  const handleButtonClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // If already running in standalone mode (installed PWA)
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600/30 text-emerald-100 text-[11px] font-bold border border-emerald-400/30">
        <ShieldCheck size={13} className="text-emerald-300" />
        <span>{language === 'mr' ? 'ॲप इन्स्टॉल आहे' : 'App Installed'}</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 text-white font-bold text-xs transition-all shadow-xs border border-white/20 shrink-0"
        title={
          language === 'mr'
            ? 'मोबाईलमध्ये ॲप (APK / PWA) इन्स्टॉल करा'
            : 'Install App on Mobile (APK / PWA)'
        }
      >
        <Smartphone size={14} className="animate-pulse" />
        <span className="hidden sm:inline">
          {language === 'mr' ? 'मोबाईल ॲप / APK' : 'Install App / APK'}
        </span>
        <span className="sm:hidden">
          {language === 'mr' ? 'ॲप' : 'Install'}
        </span>
      </button>

      {/* Mobile Install & 30-Day Trial Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                    {language === 'mr'
                      ? 'मोबाईलवर ॲप / APK कसे चालवावे?'
                      : 'How to Install on Mobile / APK Trial'}
                  </h3>
                  <p className="text-[11px] text-white/85">
                    {language === 'mr'
                      ? '३० दिवस किंवा आजीवन मोफत ट्रायल (No Limits)'
                      : '30-Day or Lifetime Free Trial'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Highlight Box */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5">
                <Sparkles size={18} className="text-[#d32f2f] shrink-0 mt-0.5" />
                <div className="text-slate-700 leading-relaxed">
                  <span className="font-bold text-[#d32f2f]">
                    {language === 'mr' ? 'हे ॲप PWA (Progressive Web App) आहे:' : 'This is a Progressive Web App:'}
                  </span>{' '}
                  {language === 'mr'
                    ? 'तुम्हाला संशयास्पद थर्ड-पार्टी APK डाऊनलोड करण्याची गरज नाही. हे थेट तुमच्या फोनमध्ये अस्सल ॲपप्रमाणे सेव्ह होते आणि इंटरनेट नसतानाही (Offline) ३० दिवस व आयुष्यभर चालते.'
                    : 'No need for risky unknown APK files. It installs directly to your home screen and works offline with local storage.'}
                </div>
              </div>

              {/* Native Prompt Button if available */}
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs sm:text-sm rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-md flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>
                    {language === 'mr' ? 'थेट १-क्लिक मध्ये फोनवर इन्स्टॉल करा' : '1-Click Direct Install to Phone'}
                  </span>
                </button>
              )}

              {/* Method 1: Android Phone Installation */}
              <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2.5 bg-slate-50/50">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#d32f2f] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>{language === 'mr' ? 'Android फोनवर चालवण्यासाठी सोपी पद्धत:' : 'Easiest Method for Android Phone:'}</span>
                </div>
                <div className="space-y-2 text-slate-600 pl-6">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800">१.</span>
                    <span>
                      {language === 'mr'
                        ? 'खालील लिंक कॉपी करून तुमच्या फोनमधील Chrome ब्राउझरमध्ये उघडा.'
                        : 'Copy the link below and open it in Google Chrome on your phone.'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800">२.</span>
                    <span>
                      {language === 'mr'
                        ? 'Chrome च्या वर उजव्या कोपऱ्यातील ३ ठिपक्यांवर (⋮) दाबा.'
                        : 'Tap the 3 dots menu (⋮) in Chrome top right corner.'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-800">३.</span>
                    <span>
                      {language === 'mr'
                        ? '"Install app" (ॲप इन्स्टॉल करा) किंवा "Add to Home screen" दाबा.'
                        : 'Tap "Install app" or "Add to Home screen".'}
                    </span>
                  </div>
                  <div className="text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    {language === 'mr'
                      ? '✓ तुमच्या मोबाईल स्क्रीनवर "धनप्रबंधक" चे आयकॉन येईल व पूर्ण स्क्रीनमध्ये ॲपसारखे उघडेल!'
                      : '✓ The app icon appears on your home screen and launches full-screen like a native app!'}
                  </div>
                </div>

                {/* Copy Link Box */}
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-600 truncate font-mono select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#d32f2f] text-white rounded-xl font-bold text-xs hover:bg-rose-800 active:scale-95 transition shrink-0"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? (language === 'mr' ? 'कॉपी झाले!' : 'Copied!') : (language === 'mr' ? 'लिंक कॉपी' : 'Copy Link')}</span>
                  </button>
                </div>
              </div>

              {/* Method 2: PWABuilder APK Generator */}
              <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2 bg-slate-50/50">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>{language === 'mr' ? 'तुम्हाला नेमकी .APK फाईलच हवी असल्यास:' : 'If you specifically need a .APK installer file:'}</span>
                </div>
                <p className="text-slate-600 pl-6 leading-relaxed">
                  {language === 'mr'
                    ? 'मायक्रोसॉफ्टचे अधिकृत मोफत टूल (PWABuilder) वापरून तुम्ही या लिंकवरून थेट Android .APK फाईल तयार करू शकता:'
                    : 'You can generate a signed/unsigned Android .APK package directly via Microsoft PWABuilder:'}
                </p>
                <div className="pl-6">
                  <a
                    href={`https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
                  >
                    <Download size={14} />
                    <span>PWABuilder वरून APK बनवा (Free)</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* iOS Note if on Apple device */}
              {isIOS && (
                <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2 bg-slate-50">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Share2 size={14} className="text-blue-500" />
                    <span>iPhone / iPad साठी सूचना:</span>
                  </div>
                  <div className="text-slate-600 space-y-1 pl-5">
                    <div>१. Safari मध्ये "Share" (शेअर) बटण दाबा.</div>
                    <div>२. "Add to Home Screen" निवडा.</div>
                  </div>
                </div>
              )}

              {/* 30 Day Trial details */}
              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-700">
                  {language === 'mr' ? '📌 ३० दिवस ट्रायल बद्दल माहिती:' : '📌 30-Day Trial Information:'}
                </div>
                <div>
                  {language === 'mr'
                    ? '• हे ॲप तुमच्या फोनवर ३० दिवस नव्हे तर आयुष्यभर विनामूल्य चालेल.'
                    : '• This trial has no 30-day time bomb; you can test it for 30 days and keep it forever.'}
                </div>
                <div>
                  {language === 'mr'
                    ? '• तुमचा सर्व डेटा फोनच्या सुरक्षित मेमरीमध्ये (LocalStorage) सेव्ह होतो.'
                    : '• All your transaction, category, and debt data is safely stored on your device.'}
                </div>
                <div>
                  {language === 'mr'
                    ? '• सेटिंग्जमधून तुम्ही एका क्लिकमध्ये Excel (CSV) किंवा पूर्ण बॅकअप डाउनलोड करू शकता.'
                    : '• You can export your data to Excel or take a full device backup anytime.'}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-medium">
                {language === 'mr' ? 'धनप्रबंधक (DhanPrabandhak)' : 'DhanPrabandhak'}
              </span>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-[#d32f2f] text-white font-bold text-xs rounded-xl hover:bg-rose-800 transition"
              >
                {language === 'mr' ? 'समजले / बंद करा' : 'Got it / Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
