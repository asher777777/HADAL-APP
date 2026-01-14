import React, { useState, useRef, useEffect } from 'react';
import { DayContent } from '../types';

interface DailyTaskProps {
  dayId: number;
  days: Record<number, DayContent>;
  onComplete: () => void;
  onExit: () => void;
}

export const DailyTask: React.FC<DailyTaskProps> = ({ dayId, days, onComplete, onExit }) => {
  const [phase, setPhase] = useState<0 | 1 | 2>(0); // 0: Video, 1: Writing, 2: Audio
  const content = days[dayId] || days[1];
  const [writingText, setWritingText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to top on phase change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phase]);

  // Handle Media Session for Background Audio
  useEffect(() => {
    if (phase === 2 && content.guidedImageryAudioUrl && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `דמיון מודרך - יום ${dayId}`,
        artist: 'מטמורפוזה יהודית',
        album: 'מסע יומי',
        artwork: [
          { src: 'https://via.placeholder.com/96', sizes: '96x96', type: 'image/png' },
          { src: 'https://via.placeholder.com/128', sizes: '128x128', type: 'image/png' },
        ]
      });

      // Simple handler to ensure it stays "active"
      navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play());
      navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
    }
  }, [phase, content, dayId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const downloadPDFPlaceholder = () => {
    // Simulate PDF download
    const element = document.createElement("a");
    const file = new Blob([`משימת כתיבה - יום ${dayId}\n\n${content.writingPrompt}\n\n-------------------\n\n${writingText}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `writing_task_day_${dayId}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      default: return '🔗';
    }
  };

  return (
    <div className="min-h-screen bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col mb-12">
      {/* Top Navigation / Progress */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
        <button onClick={onExit} className="text-slate-500 hover:text-slate-800 font-medium text-sm">
          ✕ יציאה
        </button>
        <div className="flex gap-2">
           <div className={`h-2 w-12 rounded-full transition-colors ${phase >= 0 ? 'bg-indigo-600' : 'bg-slate-300'}`} />
           <div className={`h-2 w-12 rounded-full transition-colors ${phase >= 1 ? 'bg-indigo-600' : 'bg-slate-300'}`} />
           <div className={`h-2 w-12 rounded-full transition-colors ${phase >= 2 ? 'bg-indigo-600' : 'bg-slate-300'}`} />
        </div>
        <div className="text-indigo-900 font-bold">
          יום {dayId}
        </div>
      </div>

      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        
        {/* Phase 0: Lesson / Video */}
        {phase === 0 && (
          <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-indigo-600 font-bold tracking-wide text-sm uppercase">שלב 1: לימוד</span>
              <h2 className="text-3xl font-bold text-slate-900">{content.title}</h2>
            </div>
            
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border-4 border-slate-100">
              <iframe 
                width="100%" 
                height="100%" 
                src={content.videoUrl} 
                title="Lesson Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            {/* Rich Text Content */}
            <div 
              className="prose prose-lg text-slate-600 max-w-none"
              dangerouslySetInnerHTML={{ __html: content.htmlContent || content.description }}
            />

            {/* Extra Resources */}
            {content.resources && content.resources.length > 0 && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6">
                <h3 className="font-bold text-slate-800 mb-3 text-lg">חומרי עזר וקבצים</h3>
                <ul className="grid gap-3">
                  {content.resources.map(res => (
                    <li key={res.id}>
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-100 group"
                      >
                        <span className="text-2xl">{getResourceIcon(res.type)}</span>
                        <div className="flex-1">
                           <div className="font-bold text-indigo-900 group-hover:text-indigo-600 transition-colors">{res.title}</div>
                           <div className="text-xs text-slate-400 truncate dir-ltr">{res.url}</div>
                        </div>
                        <span className="text-indigo-500">➜</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-8">
              <button 
                onClick={() => setPhase(1)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
              >
                המשך למשימת הכתיבה
              </button>
            </div>
          </div>
        )}

        {/* Phase 1: Neuroplastic Writing */}
        {phase === 1 && (
          <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-indigo-600 font-bold tracking-wide text-sm uppercase">שלב 2: כתיבה נוירופלסטית</span>
              <h2 className="text-3xl font-bold text-slate-900">עיבוד והפנמה</h2>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
              <h3 className="font-bold text-indigo-900 mb-2">המשימה שלך להיום:</h3>
              <p className="text-indigo-800 text-lg">{content.writingPrompt}</p>
            </div>

            <div className="space-y-4">
              <textarea
                value={writingText}
                onChange={(e) => setWritingText(e.target.value)}
                placeholder="כתוב כאן את המחשבות שלך... (מומלץ לכתוב באופן חופשי ללא שיפוט)"
                className="w-full h-64 p-6 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg leading-relaxed resize-none shadow-inner"
              />
              
              <div className="flex flex-wrap gap-4 items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex gap-2">
                    {/* Simulated PDF Download */}
                    <button 
                      onClick={downloadPDFPlaceholder}
                      className="text-slate-600 hover:text-indigo-600 text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      שמור כקובץ
                    </button>

                    {/* Camera/Upload */}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-slate-600 hover:text-indigo-600 text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      {file ? 'קובץ נבחר' : 'צלם/העלה דף'}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                    />
                </div>

                <button 
                  onClick={() => setPhase(2)}
                  disabled={writingText.length < 10 && !file}
                  className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg
                    ${(writingText.length > 10 || file)
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                  המשך לדמיון מודרך
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Guided Imagery */}
        {phase === 2 && (
          <div className="animate-fade-in space-y-8 max-w-3xl mx-auto text-center">
             <div className="space-y-2">
              <span className="text-purple-600 font-bold tracking-wide text-sm uppercase">שלב 3: התבוננות</span>
              <h2 className="text-3xl font-bold text-slate-900">דמיון מודרך לסיום</h2>
            </div>

            <div className="bg-purple-900 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
              {/* Animated Circles BG */}
              <div className="absolute w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              
              <div className="relative z-10 w-full max-w-md">
                <p className="text-purple-200 mb-8 font-medium">עצמו עיניים, קחו נשימה עמוקה, והקשיבו.</p>
                
                <audio 
                  ref={audioRef}
                  controls 
                  className="w-full h-12 rounded-lg" 
                  controlsList="nodownload"
                  title="מדיטציה יומית"
                >
                  <source src={content.guidedImageryAudioUrl} type="audio/ogg" />
                  Your browser does not support the audio element.
                </audio>
                <p className="text-purple-300 text-xs mt-4">* האודיו ימשיך לנגן גם בכיבוי מסך (תלוי דפדפן)</p>
              </div>
            </div>

            <button 
                onClick={onComplete}
                className="bg-green-600 text-white px-10 py-4 rounded-full font-bold text-xl hover:bg-green-700 transition-transform transform hover:scale-105 shadow-xl"
              >
                סיימתי את המשימה היומית!
              </button>
          </div>
        )}

      </div>
    </div>
  );
};