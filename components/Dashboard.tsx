import React from 'react';
import { UserProfile, DayContent } from '../types';

interface DashboardProps {
  user: UserProfile;
  days: Record<number, DayContent>;
  programTitle?: string;
  onStartTask: () => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, days, programTitle, onStartTask, onLogout }) => {
  // Use the days prop, fallback to day 1 if current day doesn't exist
  const currentDayContent = days[user.progress.currentDay] || days[1] || {
    title: 'טוען...',
    description: 'אנא המתן לטעינת התוכן',
    videoUrl: '',
    writingPrompt: ''
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
           <img 
              src="https://res.cloudinary.com/dv1z6p82q/image/upload/v1740924976/sheep-logo_copy_rmq5l1.png" // Placeholder - Ensure asset exists
              alt="Logo" 
              className="w-16 h-16 rounded-full border-2 border-indigo-100 shadow-sm object-cover"
            />
           <div>
            <h2 className="text-2xl font-bold text-slate-800">שלום, {user.name}</h2>
            <p className="text-slate-500">ברוך הבא ל{programTitle || "מסע המטמורפוזה"}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 z-10">
          <div className="text-center bg-indigo-50 p-3 rounded-xl">
            <span className="block text-2xl font-bold text-indigo-600">{user.progress.currentDay}</span>
            <span className="text-xs font-medium text-indigo-400">היום הנוכחי</span>
          </div>
          
          <button 
            onClick={onLogout}
            className="p-3 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100"
            title="יציאה מהמערכת"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        
        {/* Abstract bg decoration */}
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-indigo-50 to-transparent opacity-50 pointer-events-none"></div>
      </header>

      {/* Main Task Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm">
            המשימה היומית
          </div>
          <h1 className="text-4xl font-bold mb-4">{currentDayContent.title}</h1>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl leading-relaxed">
            {currentDayContent.description}
          </p>
          
          <button 
            onClick={onStartTask}
            className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span>התחל את היום</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">🌱</span>
            ההתקדמות שלך
          </h3>
          <div className="space-y-4">
             {user.progress.completedDays.length === 0 ? (
               <p className="text-slate-500 text-sm">טרם השלמת ימים. המסע מתחיל היום!</p>
             ) : (
               <div className="flex flex-wrap gap-2">
                 {user.progress.completedDays.map(day => (
                   <span key={day} className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-sm font-bold">
                     {day}
                   </span>
                 ))}
               </div>
             )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📊</span>
            הפרופיל שלי
          </h3>
          <ul className="space-y-3">
             <li className="flex justify-between text-sm">
                <span className="text-slate-500">יעד הפחתה:</span>
                <span className="font-bold text-indigo-600">{user.reductionGoal || 'לא הוגדר'}</span>
             </li>
             <li className="flex justify-between text-sm">
                <span className="text-slate-500">זמן מסך נוכחי:</span>
                <span className="font-bold text-slate-700">{user.dailyScreenTime || '-'}</span>
             </li>
             <li className="flex justify-between text-sm">
                <span className="text-slate-500">תפקיד:</span>
                <span className="font-bold text-slate-700">{user.role || '-'}</span>
             </li>
          </ul>
        </div>
      </div>
    </div>
  );
};