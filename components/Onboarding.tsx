import React, { useState } from 'react';
import { UserProfile } from '../types';
import { INITIAL_USER_STATE } from '../constants';

// --- OPTIONS WITH ICONS ---
const AGE_OPTIONS = [
  { label: '18-24', icon: '🎓' },
  { label: '25-34', icon: '🚀' },
  { label: '35-44', icon: '💼' },
  { label: '45-54', icon: '👓' },
  { label: '55+', icon: '🏡' }
];

const SCREEN_TIME_OPTIONS = [
  { label: 'פחות משעה', icon: '😌' },
  { label: '1-3 שעות', icon: '👀' },
  { label: '3-5 שעות', icon: '😵‍💫' },
  { label: '5+ שעות', icon: '🆘' }
];

const GOAL_OPTIONS = [
  { label: 'להפחית ב-20%', icon: '📉' },
  { label: 'להפחית בחצי', icon: '✂️' },
  { label: 'התנתקות מלאה', icon: '📵' },
  { label: 'איזון עדין', icon: '⚖️' }
];

const INDUSTRY_OPTIONS = [
  { label: 'הייטק וטכנולוגיה', icon: '💻' },
  { label: 'חינוך והוראה', icon: '📚' },
  { label: 'רפואה ובריאות', icon: '🩺' },
  { label: 'פיננסים וכלכלה', icon: '💰' },
  { label: 'נדל"ן ובנייה', icon: '🏗️' },
  { label: 'משפטים', icon: '⚖️' },
  { label: 'שיווק ומכירות', icon: '📢' },
  { label: 'אומנות ועיצוב', icon: '🎨' },
  { label: 'ביטחון', icon: '🛡️' },
  { label: 'טיפול ורווחה', icon: '🧘' },
];

interface OnboardingProps {
  onComplete: (user: UserProfile) => void;
  onAdminLogin: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onAdminLogin }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({ ...INITIAL_USER_STATE });
  const [step, setStep] = useState(1);
  const totalSteps = 8; 

  // Modal state for "Other" workplace
  const [showWorkplaceModal, setShowWorkplaceModal] = useState(false);
  const [customWorkplace, setCustomWorkplace] = useState('');

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Auto-advance for selection steps
    if (['gender', 'ageRange', 'dailyScreenTime', 'reductionGoal', 'workplace'].includes(field)) {
       setTimeout(() => handleNext(), 300);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      onComplete(formData as UserProfile);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  // --- Gender Personalized Text Helper ---
  const t = (male: string, female: string, other: string) => {
    if (formData.gender === 'male') return male;
    if (formData.gender === 'female') return female;
    return other;
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!formData.gender;
      case 2: return !!formData.name && formData.name.length > 1;
      case 3: return !!formData.ageRange;
      case 4: return !!formData.workplace;
      case 5: return !!formData.role;
      case 6: return !!formData.dailyScreenTime;
      case 7: return !!formData.reductionGoal;
      case 8: return !!formData.phone && formData.phone.length >= 9;
      default: return false;
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1: // Gender
        return (
          <div className="space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 text-center">ברוכים הבאים! איך לפנות אליך?</h2>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {[
                 { val: 'male', label: 'בלשון זכר', icon: '👨' },
                 { val: 'female', label: 'בלשון נקבה', icon: '👩' },
                 { val: 'other', label: 'אחר/ניטרלי', icon: '🌈' }
               ].map((opt) => (
                 <button
                   key={opt.val}
                   onClick={() => updateField('gender', opt.val)}
                   className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 hover:scale-105
                     ${formData.gender === opt.val 
                       ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' 
                       : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50'}`}
                 >
                   <span className="text-4xl">{opt.icon}</span>
                   <span className="font-bold text-lg">{opt.label}</span>
                 </button>
               ))}
             </div>
          </div>
        );

      case 2: // Name
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center">
              {t("נעים מאוד, איך קוראים לך?", "נעים מאוד, איך קוראים לך?", "נעים מאוד, איך נקרא לך?")}
            </h2>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})} // No auto-advance
              className="w-full p-6 text-2xl text-center bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
              placeholder="השם שלך"
              autoFocus
            />
          </div>
        );

      case 3: // Age
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center">
               {t("בן כמה אתה?", "בת כמה את?", "מה גילך?")}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {AGE_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => updateField('ageRange', opt.label)}
                  className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 hover:scale-105
                    ${formData.ageRange === opt.label
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="font-bold text-lg">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4: // Workplace
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center">
              {t("באיזה תחום אתה עוסק?", "באיזה תחום את עוסקת?", "באיזה תחום העיסוק שלך?")}
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
               {INDUSTRY_OPTIONS.map((opt) => (
                 <button
                   key={opt.label}
                   onClick={() => updateField('workplace', opt.label)}
                   className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 aspect-square hover:scale-105
                     ${formData.workplace === opt.label
                       ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                       : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}
                 >
                   <span className="text-3xl">{opt.icon}</span>
                   <span className="font-medium text-sm text-center leading-tight">{opt.label}</span>
                 </button>
               ))}
               
               {/* Other Button */}
               <button
                   onClick={() => setShowWorkplaceModal(true)}
                   className={`p-4 rounded-2xl border-2 border-dashed border-slate-300 transition-all flex flex-col items-center justify-center gap-2 aspect-square hover:bg-slate-50 hover:border-indigo-300
                     ${formData.workplace && !INDUSTRY_OPTIONS.find(o => o.label === formData.workplace) 
                       ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                       : 'text-slate-500'}`}
                 >
                   <span className="text-3xl">✨</span>
                   <span className="font-medium text-sm text-center">אחר</span>
                 </button>
            </div>

            {/* Modal for Custom Workplace */}
            {showWorkplaceModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative transform transition-all scale-100">
                   <button 
                     onClick={() => setShowWorkplaceModal(false)}
                     className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 p-2"
                   >
                     ✕
                   </button>
                   <div className="text-center mb-6">
                     <span className="text-4xl mb-2 block">💼</span>
                     <h3 className="text-xl font-bold text-slate-800">
                       {t("במה אתה עוסק?", "במה את עוסקת?", "מה העיסוק שלך?")}
                     </h3>
                   </div>
                   
                   <input 
                     type="text"
                     value={customWorkplace}
                     onChange={(e) => setCustomWorkplace(e.target.value)}
                     className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none mb-6 text-lg text-center"
                     placeholder="מעניין, אז מה התחום שלך?"
                     autoFocus
                   />
                   <button 
                     onClick={() => {
                        if(customWorkplace.trim()) {
                            updateField('workplace', customWorkplace);
                            setShowWorkplaceModal(false);
                        }
                     }}
                     disabled={!customWorkplace.trim()}
                     className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-slate-300"
                   >
                     אישור והמשך
                   </button>
                </div>
              </div>
            )}
          </div>
        );

      case 5: // Role
        return (
          <div className="space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 text-center">
               {t("ומה התפקיד שלך?", "ומה התפקיד שלך?", "מה התפקיד שלך?")}
             </h2>
             <input
              type="text"
              value={formData.role || ''}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full p-6 text-xl bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none"
              placeholder="למשל: מנהל מוצר, מורה..."
              autoFocus
            />
          </div>
        );

      case 6: // Screen Time
        return (
          <div className="space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 text-center">
               {t("כמה זמן ביום אתה מול מסכים?", "כמה זמן ביום את מול מסכים?", "זמן מסך יומי ממוצע?")}
             </h2>
             <div className="grid gap-3">
               {SCREEN_TIME_OPTIONS.map((opt) => (
                 <button
                   key={opt.label}
                   onClick={() => updateField('dailyScreenTime', opt.label)}
                   className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center justify-between group hover:scale-[1.02]
                     ${formData.dailyScreenTime === opt.label
                       ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                       : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-300'}`}
                 >
                   <span className="font-bold text-lg">{opt.label}</span>
                   <span className="text-3xl transform group-hover:rotate-12 transition-transform">{opt.icon}</span>
                 </button>
               ))}
             </div>
          </div>
        );

      case 7: // Goal
        return (
          <div className="space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 text-center">
               {t("כמה היית רוצה להפחית?", "כמה היית רוצה להפחית?", "מה יעד ההפחתה שלך?")}
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {GOAL_OPTIONS.map((opt) => (
                 <button
                   key={opt.label}
                   onClick={() => updateField('reductionGoal', opt.label)}
                   className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center hover:scale-105
                     ${formData.reductionGoal === opt.label
                       ? 'bg-purple-600 border-purple-600 text-white shadow-xl' 
                       : 'bg-white border-slate-100 text-slate-600 hover:border-purple-300'}`}
                 >
                   <span className="text-4xl mb-1">{opt.icon}</span>
                   <span className="font-bold text-lg">{opt.label}</span>
                 </button>
               ))}
             </div>
          </div>
        );

      case 8: // Phone (Changed from Email)
        return (
          <div className="space-y-6 text-center">
             <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-2 animate-bounce">
               📞
             </div>
             <h2 className="text-2xl font-bold text-slate-800">
               {t("מספר הטלפון שלך?", "מספר הטלפון שלך?", "מספר טלפון לזיהוי")}
             </h2>
             <div className="relative">
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, phone: val})
                  }}
                  className="w-full p-6 text-3xl text-center bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none tracking-widest font-mono"
                  placeholder="0500000000"
                  dir="ltr"
                  autoFocus
                />
             </div>
             <p className="text-slate-400 text-sm">הפרטים שלך בטוחים איתנו.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] py-10 px-4">
      
      {/* --- BRANDING --- */}
      <div className="mb-8 relative group cursor-pointer transition-transform hover:scale-105 duration-500">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
        <img 
          src="https://res.cloudinary.com/dv1z6p82q/image/upload/v1740924976/sheep-logo_copy_rmq5l1.png"
          alt="חדל קשקשת" 
          className="w-32 h-32 rounded-full border-4 border-white shadow-2xl relative z-10 object-cover"
        />
        {/* Step Indicator Badge */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-indigo-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 border-2 border-white">
          {step} / {totalSteps}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-lg border border-slate-100 relative overflow-hidden transition-all duration-500 min-h-[450px] flex flex-col">
        
        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100" dir="ltr">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500 ease-out" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center animate-fade-in mt-4">
          {getStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-50">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-4 rounded-xl text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              חזור
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex-1 py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 shadow-xl
              ${isStepValid() 
                ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/40 transform hover:-translate-y-1' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
          >
            {step === totalSteps ? 'יצאנו לדרך! 🚀' : 'המשך'}
          </button>
        </div>

        {/* Admin Link */}
        <div className="absolute top-4 left-4">
          <button 
            onClick={onAdminLogin}
            className="text-slate-200 hover:text-indigo-400 transition-colors p-2"
            title="כניסת מנהל"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};