import React from 'react';

interface InfoPageProps {
  onBack: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ onBack }) => {
  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      <header className="p-4 border-b bg-white flex items-center justify-between">
        <button onClick={onBack} className="text-slate-500 font-bold p-2">חזרה</button>
        <h1 className="font-black text-xl text-slate-800">על המיזם</h1>
        <div className="w-10"></div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto space-y-6">
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">מטמורפוזה יהודית</h2>
          <p className="text-slate-600 leading-relaxed text-lg">
            מיזם חברתי-רוחני שנועד לעזור ליהודים בעידן המודרני למצוא את השקט הפנימי בתוך הרעש הדיגיטלי. 
            אנחנו משלבים כלים של פסיכולוגיה מודרנית (כמו כתיבה נוירופלסטית) עם חוכמת ישראל ודמיון מודרך.
          </p>
        </section>

        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-2">איך זה עובד?</h3>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="text-2xl">📺</span>
              <div>
                <p className="font-bold">שיעור יומי קצר</p>
                <p className="text-slate-500 text-sm">וידאו ממוקד של 5-10 דקות.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-2xl">✍️</span>
              <div>
                <p className="font-bold">כתיבה נוירופלסטית</p>
                <p className="text-slate-500 text-sm">תרגול כתיבה לשינוי דפוסי חשיבה.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-2xl">🧘</span>
              <div>
                <p className="font-bold">דמיון מודרך</p>
                <p className="text-slate-500 text-sm">חיבור פנימי ורוגע בסיום כל יום.</p>
              </div>
            </li>
          </ul>
        </section>

        <button 
          onClick={onBack}
          className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold"
        >
          הבנתי, בואו נתחיל
        </button>
      </main>
    </div>
  );
};