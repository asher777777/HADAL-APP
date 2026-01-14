import React from 'react';

interface LandingPageProps {
  onStartRegistration: () => void;
  onShowInfo: () => void;
  onGoogleLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStartRegistration, 
  onShowInfo, 
  onGoogleLogin 
}) => {
  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden relative font-sans" dir="rtl">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-40 pointer-events-none"></div>

      {/* Main Content Area - Full Height without scroll */}
      <main className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 text-center relative z-10 h-full max-h-screen">
        
        {/* א. וידיאו למעלה */}
        <div className="w-full max-w-xl aspect-video bg-slate-100 rounded-3xl overflow-hidden shadow-xl border-4 border-white flex-shrink-0">
          <iframe 
            src="https://www.youtube.com/embed/5qap5aO4i9A?autoplay=0&controls=1&rel=0" 
            title="Introduction Video"
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* ב. תמונה מלבנית לרוחב (במקום ברוכים הבאים ולוגו) */}
        <div className="w-full max-w-lg aspect-[21/9] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden group">
          <div className="text-slate-300 font-bold group-hover:text-slate-400 transition-colors">
            {/* Placeholder for landscape image */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">כאן תופיע תמונת המיזם</span>
          </div>
        </div>

        {/* כפתורים ג-ה */}
        <div className="w-full max-w-xs flex flex-col gap-3 pb-6 flex-shrink-0">
          
          {/* ג. כפתור התחברות (גוגל) - ירוק */}
          <button 
            onClick={onGoogleLogin}
            className="group relative flex items-center justify-center gap-3 bg-green-600 text-white font-black py-4 rounded-2xl border-2 border-green-600 transition-all duration-300 hover:bg-white hover:text-green-600 shadow-md"
          >
            <div className="bg-white p-1 rounded-full group-hover:bg-green-600 transition-colors">
               <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5 group-hover:invert group-hover:brightness-200 transition-all" alt="Google" />
            </div>
            <span>התחברות עם Google</span>
          </button>
          
          {/* ד. כפתור הרשמה - צהוב עמוק */}
          <button 
            onClick={onStartRegistration}
            className="bg-[#D97706] text-white font-black py-4 rounded-2xl border-2 border-[#D97706] transition-all duration-300 hover:bg-white hover:text-[#D97706] shadow-md"
          >
            הרשמה למחזור הקרוב
          </button>

          {/* ה. כפתור על הפרויקט - אדום */}
          <button 
            onClick={onShowInfo}
            className="bg-red-600 text-white font-black py-4 rounded-2xl border-2 border-red-600 transition-all duration-300 hover:bg-white hover:text-red-600 shadow-md"
          >
            מידע על המיזם
          </button>
        </div>
      </main>

      <style>{`
        body {
          overflow: hidden;
          height: 100vh;
        }
        #root {
          height: 100vh;
        }
      `}</style>
    </div>
  );
};