import React, { useState } from 'react';
import { DayContent, UserProfile, Automation, ProgramSettings, ResourceLink } from '../types';
import { RichTextEditor } from './RichTextEditor';

interface AdminPanelProps {
  days: Record<number, DayContent>;
  onUpdateDays: (days: Record<number, DayContent>) => void;
  programSettings: ProgramSettings;
  onUpdateSettings: (settings: ProgramSettings) => void;
  automations: Automation[];
  onUpdateAutomations: (automations: Automation[]) => void;
  onExit: () => void;
  currentUser: UserProfile | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  days, onUpdateDays, 
  programSettings, onUpdateSettings,
  automations, onUpdateAutomations,
  onExit, currentUser 
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'automations'>('content');
  
  // Content State
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [dayFormData, setDayFormData] = useState<DayContent | null>(null);

  // Automation State
  const [newAutomation, setNewAutomation] = useState<Partial<Automation>>({
    name: '',
    trigger: 'day_complete',
    action: 'send_whatsapp',
    messageTemplate: '',
    active: true
  });

  // --- Handlers for Content ---
  const handleEditDay = (day: DayContent) => {
    setEditingDayId(day.id);
    setDayFormData({ 
      ...day,
      htmlContent: day.htmlContent || day.description, // Fallback
      resources: day.resources || []
    });
  };

  const handleAddNewDay = () => {
    const newId = Math.max(...Object.keys(days).map(Number), 0) + 1;
    const newDay: DayContent = {
      id: newId,
      title: 'שיעור חדש',
      description: '',
      htmlContent: '',
      videoUrl: '',
      writingPrompt: '',
      guidedImageryAudioUrl: '',
      resources: []
    };
    setEditingDayId(newId);
    setDayFormData(newDay);
  };

  const handleSaveDay = () => {
    if (dayFormData) {
      const updatedDays = { ...days, [dayFormData.id]: dayFormData };
      onUpdateDays(updatedDays);
      setEditingDayId(null);
      setDayFormData(null);
    }
  };

  const handleDeleteDay = (id: number) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק יום זה?')) {
      const updatedDays = { ...days };
      delete updatedDays[id];
      onUpdateDays(updatedDays);
    }
  };

  // --- Resource Handlers ---
  const addResource = () => {
    if (!dayFormData) return;
    const newResource: ResourceLink = {
      id: Date.now().toString(),
      title: 'קובץ חדש',
      url: '',
      type: 'link'
    };
    setDayFormData({
      ...dayFormData,
      resources: [...(dayFormData.resources || []), newResource]
    });
  };

  const updateResource = (id: string, field: keyof ResourceLink, value: string) => {
    if (!dayFormData) return;
    const updatedResources = dayFormData.resources?.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    );
    setDayFormData({ ...dayFormData, resources: updatedResources });
  };

  const removeResource = (id: string) => {
    if (!dayFormData) return;
    const updatedResources = dayFormData.resources?.filter(r => r.id !== id);
    setDayFormData({ ...dayFormData, resources: updatedResources });
  };

  // --- Handlers for Automations ---
  const handleAddAutomation = () => {
    if (newAutomation.name && newAutomation.messageTemplate) {
      const automation: Automation = {
        id: Date.now().toString(),
        name: newAutomation.name,
        trigger: newAutomation.trigger as any,
        triggerValue: newAutomation.triggerValue,
        action: newAutomation.action as any,
        messageTemplate: newAutomation.messageTemplate,
        active: true
      };
      onUpdateAutomations([...automations, automation]);
      setNewAutomation({
        name: '',
        trigger: 'day_complete',
        action: 'send_whatsapp',
        messageTemplate: '',
        active: true
      });
    }
  };

  const handleDeleteAutomation = (id: string) => {
    onUpdateAutomations(automations.filter(a => a.id !== id));
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10 overflow-y-auto">
        <div className="p-6 border-b border-slate-800 bg-slate-900 sticky top-0">
          <h1 className="text-xl font-bold text-white">לוח בקרה</h1>
          <p className="text-indigo-400 text-sm">מנהל מערכת</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('content')}
            className={`w-full text-right p-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'content' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>📚</span>
            ניהול קורסים ותוכן
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={`w-full text-right p-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'automations' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>⚡</span>
            אוטומציות מערכת
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full text-right p-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'users' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>👥</span>
            ניהול משתמשים
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={onExit} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800 p-3 rounded-xl hover:bg-red-600/20 hover:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            יציאה לממשק משתמש
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        
        {/* --- Content Tab --- */}
        {activeTab === 'content' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Program Settings */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">הגדרות תוכנית ראשית</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">שם הקורס/תוכנית</label>
                  <input 
                    type="text" 
                    value={programSettings.title}
                    onChange={(e) => onUpdateSettings({...programSettings, title: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">תיאור קצר</label>
                  <textarea 
                    value={programSettings.description}
                    onChange={(e) => onUpdateSettings({...programSettings, description: e.target.value})}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  />
                </div>
              </div>
            </div>

            {/* Daily Content Management */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">שיעורים ותכנים יומיים</h2>
                <button 
                  onClick={handleAddNewDay}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2"
                >
                  <span className="text-xl">+</span> הוסף שיעור
                </button>
              </div>

              {/* Edit Form */}
              {editingDayId !== null && dayFormData && (
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 mb-8 animate-slide-up relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                  <h3 className="font-bold text-xl mb-6 text-indigo-900">עריכת יום מס' {dayFormData.id}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">כותרת השיעור</label>
                      <input 
                        type="text" 
                        value={dayFormData.title} 
                        onChange={e => setDayFormData({...dayFormData, title: e.target.value})}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">תיאור קצר (לדאשבורד)</label>
                      <input 
                        type="text"
                        value={dayFormData.description} 
                        onChange={e => setDayFormData({...dayFormData, description: e.target.value})}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">תוכן השיעור (עורך עשיר)</label>
                      <RichTextEditor 
                        initialValue={dayFormData.htmlContent || ''} 
                        onChange={(html) => setDayFormData({...dayFormData, htmlContent: html})} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">קישור לוידאו (Embed URL)</label>
                      <input 
                        type="text" 
                        value={dayFormData.videoUrl} 
                        onChange={e => setDayFormData({...dayFormData, videoUrl: e.target.value})}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-sm"
                        placeholder="https://www.youtube.com/embed/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">קישור לאודיו</label>
                      <input 
                        type="text" 
                        value={dayFormData.guidedImageryAudioUrl} 
                        onChange={e => setDayFormData({...dayFormData, guidedImageryAudioUrl: e.target.value})}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dir-ltr text-sm"
                      />
                    </div>
                    
                    {/* Resources Section */}
                    <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                         <label className="block text-sm font-bold text-slate-700">קבצים מצורפים וקישורים</label>
                         <button onClick={addResource} className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded">
                           + הוסף קובץ
                         </button>
                      </div>
                      <div className="space-y-2">
                        {dayFormData.resources?.map((res, idx) => (
                          <div key={res.id} className="flex gap-2 items-center">
                            <select 
                              value={res.type}
                              onChange={(e) => updateResource(res.id, 'type', e.target.value)}
                              className="p-2 border rounded text-sm w-24"
                            >
                              <option value="link">קישור</option>
                              <option value="pdf">PDF</option>
                              <option value="doc">Doc</option>
                              <option value="image">תמונה</option>
                              <option value="audio">אודיו</option>
                            </select>
                            <input 
                              type="text" 
                              placeholder="שם הקובץ"
                              value={res.title}
                              onChange={(e) => updateResource(res.id, 'title', e.target.value)}
                              className="p-2 border rounded text-sm flex-1"
                            />
                            <input 
                              type="text" 
                              placeholder="URL (Google Drive/Other)"
                              value={res.url}
                              onChange={(e) => updateResource(res.id, 'url', e.target.value)}
                              className="p-2 border rounded text-sm flex-1 dir-ltr"
                            />
                            <button onClick={() => removeResource(res.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                          </div>
                        ))}
                        {(!dayFormData.resources || dayFormData.resources.length === 0) && (
                          <p className="text-xs text-slate-400">אין קבצים מצורפים.</p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">שאלת כתיבה (פרומפט)</label>
                      <textarea 
                        value={dayFormData.writingPrompt} 
                        onChange={e => setDayFormData({...dayFormData, writingPrompt: e.target.value})}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                    <button 
                      onClick={() => setEditingDayId(null)}
                      className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                      ביטול
                    </button>
                    <button 
                      onClick={handleSaveDay}
                      className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md transition-colors"
                    >
                      שמור שינויים
                    </button>
                  </div>
                </div>
              )}

              {/* Content List */}
              <div className="space-y-3">
                {Object.values(days).map((day: DayContent) => (
                  <div key={day.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center hover:border-indigo-300 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="bg-indigo-50 text-indigo-700 font-bold w-12 h-12 rounded-xl flex items-center justify-center text-lg border border-indigo-100">
                        {day.id}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{day.title}</h4>
                        <p className="text-slate-500 text-sm truncate max-w-lg">{day.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditDay(day)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="ערוך"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteDay(day.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="מחק"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Automations Tab (Existing) --- */}
        {activeTab === 'automations' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">⚡ אוטומציות מערכת</h2>
            
            {/* Create Automation Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-indigo-900 border-b border-slate-100 pb-2">יצירת אוטומציה חדשה</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">שם האוטומציה</label>
                  <input 
                    type="text" 
                    placeholder="למשל: עידוד אחרי יום 1"
                    value={newAutomation.name}
                    onChange={e => setNewAutomation({...newAutomation, name: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">פעולה (Action)</label>
                  <select 
                    value={newAutomation.action}
                    onChange={e => setNewAutomation({...newAutomation, action: e.target.value as any})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="send_whatsapp">שליחת הודעת WhatsApp</option>
                    <option value="send_email">שליחת אימייל</option>
                    <option value="system_notification">התראה באפליקציה</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">טריגר (Trigger)</label>
                  <select 
                    value={newAutomation.trigger}
                    onChange={e => setNewAutomation({...newAutomation, trigger: e.target.value as any})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="day_complete">סיום יום מסוים</option>
                    <option value="program_start">הרשמה לתוכנית</option>
                    <option value="inactive_3_days">חוסר פעילות (3 ימים)</option>
                  </select>
                </div>
                {newAutomation.trigger === 'day_complete' && (
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">מספר יום</label>
                     <input 
                       type="number" 
                       min="1"
                       placeholder="1"
                       value={newAutomation.triggerValue || ''}
                       onChange={e => setNewAutomation({...newAutomation, triggerValue: parseInt(e.target.value)})}
                       className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                     />
                   </div>
                )}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">תוכן ההודעה (Template)</label>
                  <textarea 
                    placeholder="היי {name}, כל הכבוד על סיום יום {day}..."
                    value={newAutomation.messageTemplate}
                    onChange={e => setNewAutomation({...newAutomation, messageTemplate: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleAddAutomation}
                  disabled={!newAutomation.name || !newAutomation.messageTemplate}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:bg-slate-300 transition-colors"
                >
                  + צור אוטומציה
                </button>
              </div>
            </div>

            {/* Automation List */}
            <div className="grid gap-4">
              {automations.map(auto => (
                <div key={auto.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                       ${auto.trigger === 'day_complete' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                       {auto.trigger === 'day_complete' ? '🏁' : '⏰'}
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-800">{auto.name}</h4>
                       <p className="text-xs text-slate-500">
                         {auto.trigger === 'day_complete' ? `סיום יום ${auto.triggerValue}` : 'טריגר כללי'} 
                         {' -> '} 
                         {auto.action === 'send_whatsapp' ? 'WhatsApp' : 'Email'}
                       </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="text-sm text-slate-600 bg-slate-100 p-2 rounded max-w-xs truncate">
                       "{auto.messageTemplate}"
                     </div>
                     <button 
                       onClick={() => handleDeleteAutomation(auto.id)}
                       className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                     >
                       מחק
                     </button>
                  </div>
                </div>
              ))}
              {automations.length === 0 && (
                <p className="text-center text-slate-400 py-8">אין אוטומציות מוגדרות כרגע.</p>
              )}
            </div>
          </div>
        )}

        {/* --- Users Tab (Existing) --- */}
        {activeTab === 'users' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
             <h2 className="text-2xl font-bold mb-6 text-slate-800">ניהול משתמשים</h2>
             <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="p-4 font-medium">שם משתמש</th>
                    <th className="p-4 font-medium">אימייל</th>
                    <th className="p-4 font-medium">התקדמות</th>
                    <th className="p-4 font-medium">הודעות אחרונות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentUser && (
                    <tr className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs">You</div>
                        {currentUser.name}
                      </td>
                      <td className="p-4 text-slate-600">{currentUser.email}</td>
                      <td className="p-4">
                        <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-200 w-24">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{width: '45%'}}></div>
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">יום {currentUser.progress.currentDay}</span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">-</td>
                    </tr>
                  )}
                  {/* Mock Data */}
                  {[1, 2, 3].map(i => (
                    <tr key={i} className="hover:bg-slate-50 opacity-70">
                      <td className="p-4 font-medium text-slate-700">משתמש דמה {i}</td>
                      <td className="p-4 text-slate-600">user{i}@demo.com</td>
                      <td className="p-4 text-sm">יום {i+2}</td>
                      <td className="p-4 text-xs text-slate-400">נשלח WhatsApp (אתמול)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};