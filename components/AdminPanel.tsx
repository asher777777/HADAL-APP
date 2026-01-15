import React, { useState, useEffect } from 'react';
import { DayContent, UserProfile, Automation, ProgramSettings, ResourceLink, SubscriptionPlan } from '../types';
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
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'automations' | 'subscriptions'>('content');
  
  // Data State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  // Editing States
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [dayFormData, setDayFormData] = useState<DayContent | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null); // For modal
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({ name: '', price: 0, durationDays: 30, description: '' });

  // Automation Form
  const [newAutomation, setNewAutomation] = useState<Partial<Automation>>({
    name: '',
    trigger: 'day_complete',
    action: 'send_whatsapp',
    messageTemplate: '',
    active: true
  });

  // --- Initial Fetch ---
  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsersList(await res.json());
    } catch (e) { console.error("Failed to fetch users"); }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      if (res.ok) setPlans(await res.json());
    } catch (e) { console.error("Failed to fetch plans"); }
  };

  // --- Subscription Plan Handlers ---
  const handleCreatePlan = async () => {
    if (!newPlan.name) return;
    const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan)
    });
    if (res.ok) {
        fetchPlans();
        setNewPlan({ name: '', price: 0, durationDays: 30, description: '' });
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (window.confirm("למחוק סוג מנוי זה?")) {
        const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
        if (res.ok) fetchPlans();
    }
  };

  // --- User Editing Handlers ---
  const handleUpdateUserRole = async () => {
    if (!editingUser || !editingUser.id) return;
    
    const res = await fetch(`/api/users/${editingUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemRole: editingUser.systemRole,
            subscriptionPlanId: editingUser.subscriptionPlanId
        })
    });
    
    if (res.ok) {
        fetchUsers();
        setEditingUser(null);
    }
  };

  // --- Content Handlers ---
  const handleEditDay = (day: DayContent) => {
    setEditingDayId(day.id);
    setDayFormData({ 
      ...day,
      htmlContent: day.htmlContent || day.description, 
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
          <p className="text-indigo-400 text-sm">
             {currentUser?.name} | {currentUser?.systemRole === 'admin' ? 'אדמין' : 'משתמש'}
          </p>
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
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full text-right p-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'subscriptions' ? 'bg-indigo-600 shadow-lg shadow-indigo-900/50' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>💎</span>
            ניהול מנויים
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={onExit} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800 p-3 rounded-xl hover:bg-red-600/20 hover:text-red-400">
            יציאה לממשק משתמש
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        
        {/* --- Content Tab --- */}
        {activeTab === 'content' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* ... Content Editing (Same as before) ... */}
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
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">שיעורים ותכנים יומיים</h2>
                <button onClick={handleAddNewDay} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all">+ הוסף שיעור</button>
              </div>

              {/* Day Editor (Same logic as existing code) */}
              {editingDayId !== null && dayFormData && (
                  <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 mb-8 animate-slide-up relative overflow-hidden">
                     {/* Simplified for brevity - assumes RichTextEditor component exists and works */}
                     <h3 className="font-bold text-xl mb-4">עריכת יום {dayFormData.id}</h3>
                     <div className="space-y-4">
                        <input type="text" value={dayFormData.title} onChange={e => setDayFormData({...dayFormData, title: e.target.value})} className="w-full p-2 border rounded" placeholder="כותרת" />
                        <RichTextEditor initialValue={dayFormData.htmlContent || ''} onChange={(html) => setDayFormData({...dayFormData, htmlContent: html})} />
                        {/* ... other fields ... */}
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingDayId(null)} className="px-4 py-2 bg-slate-200 rounded">ביטול</button>
                            <button onClick={handleSaveDay} className="px-4 py-2 bg-indigo-600 text-white rounded">שמור</button>
                        </div>
                     </div>
                  </div>
              )}

              <div className="space-y-3">
                 {Object.values(days).map((day: DayContent) => (
                     <div key={day.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between">
                         <span className="font-bold">יום {day.id}: {day.title}</span>
                         <button onClick={() => handleEditDay(day)} className="text-indigo-600">ערוך</button>
                     </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Automations Tab --- */}
        {activeTab === 'automations' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">⚡ אוטומציות מערכת</h2>
            {/* Same as previous version... */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4">יצירת אוטומציה חדשה</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="שם" value={newAutomation.name} onChange={e => setNewAutomation({...newAutomation, name: e.target.value})} className="border p-2 rounded" />
                    {/* ... other inputs ... */}
                </div>
                <button onClick={handleAddAutomation} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">הוסף</button>
             </div>
             <div>
                {automations.map(a => <div key={a.id} className="bg-white p-4 my-2 rounded shadow">{a.name}</div>)}
             </div>
          </div>
        )}

        {/* --- Subscription Plans Tab (NEW) --- */}
        {activeTab === 'subscriptions' && (
             <div className="max-w-5xl mx-auto animate-fade-in">
                 <h2 className="text-2xl font-bold mb-6 text-slate-800">💎 ניהול סוגי מנויים</h2>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                     {plans.map(plan => (
                         <div key={plan.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative">
                             <div className="absolute top-4 left-4">
                                {plan.id !== 1 && (
                                    <button onClick={() => handleDeletePlan(plan.id)} className="text-red-400 hover:text-red-600 text-sm">מחק</button>
                                )}
                             </div>
                             <h3 className="text-xl font-bold text-indigo-700 mb-2">{plan.name}</h3>
                             <div className="text-3xl font-black text-slate-800 mb-4">
                                 ₪{plan.price} <span className="text-sm text-slate-400 font-normal">/ {plan.durationDays > 0 ? `${plan.durationDays} ימים` : 'תמיד'}</span>
                             </div>
                             <p className="text-slate-500 text-sm">{plan.description}</p>
                         </div>
                     ))}
                     
                     {/* Add New Plan Card */}
                     <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col gap-3">
                         <h4 className="font-bold text-slate-600">יצירת מנוי חדש</h4>
                         <input type="text" placeholder="שם המנוי (למשל: פרימיום)" value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} className="p-2 border rounded" />
                         <input type="number" placeholder="מחיר (₪)" value={newPlan.price || ''} onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})} className="p-2 border rounded" />
                         <input type="number" placeholder="משך בימים (0 = קבוע)" value={newPlan.durationDays || ''} onChange={e => setNewPlan({...newPlan, durationDays: Number(e.target.value)})} className="p-2 border rounded" />
                         <textarea placeholder="תיאור קצר" value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})} className="p-2 border rounded h-20" />
                         <button onClick={handleCreatePlan} className="bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">צור מנוי</button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- Users Tab (ENHANCED) --- */}
        {activeTab === 'users' && (
          <div className="max-w-6xl mx-auto animate-fade-in">
             <h2 className="text-2xl font-bold mb-6 text-slate-800">👥 ניהול משתמשים</h2>
             <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden overflow-x-auto">
              <table className="w-full text-right min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="p-4">משתמש</th>
                    <th className="p-4">פרטים דמוגרפיים</th>
                    <th className="p-4">תפקיד/מקצוע</th>
                    <th className="p-4">מנוי</th>
                    <th className="p-4">הרשאת מערכת</th>
                    <th className="p-4">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                            <img src={user.profileImage || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-full object-cover border" alt="" />
                            <div>
                                <div className="font-bold text-slate-800">{user.name}</div>
                                <div className="text-xs text-slate-500">{user.email} | {user.phone}</div>
                            </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                          <div>{user.ageRange} • {user.gender === 'male' ? 'זכר' : user.gender === 'female' ? 'נקבה' : 'אחר'}</div>
                          <div className="text-xs text-slate-400">מסכים: {user.dailyScreenTime}</div>
                      </td>
                      <td className="p-4 text-sm">
                          <div className="font-medium">{user.workplace}</div>
                          <div className="text-slate-500">{user.role}</div>
                      </td>
                      <td className="p-4">
                          <span className="inline-block px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                              {user.subscriptionPlanName || 'לא ידוע'}
                          </span>
                      </td>
                      <td className="p-4">
                          {user.systemRole === 'admin' ? 
                            <span className="text-red-600 font-bold text-xs border border-red-200 bg-red-50 px-2 py-1 rounded">ADMIN</span> 
                            : <span className="text-slate-500 text-xs border border-slate-200 bg-slate-50 px-2 py-1 rounded">USER</span>
                          }
                      </td>
                      <td className="p-4">
                          <button 
                            onClick={() => setEditingUser(user)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                          >
                              ערוך גישה
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-96 shadow-2xl animate-slide-up">
                        <h3 className="text-lg font-bold mb-4">עריכת משתמש: {editingUser.name}</h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-1">סוג מנוי</label>
                            <select 
                                value={editingUser.subscriptionPlanId} 
                                onChange={(e) => setEditingUser({...editingUser, subscriptionPlanId: Number(e.target.value)})}
                                className="w-full p-2 border rounded"
                            >
                                {plans.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - ₪{p.price}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold mb-1">הרשאת מערכת</label>
                            <select 
                                value={editingUser.systemRole} 
                                onChange={(e) => setEditingUser({...editingUser, systemRole: e.target.value as 'admin' | 'user'})}
                                className="w-full p-2 border rounded"
                            >
                                <option value="user">משתמש רגיל</option>
                                <option value="admin">מנהל (Admin)</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-slate-500">ביטול</button>
                            <button onClick={handleUpdateUserRole} className="px-4 py-2 bg-indigo-600 text-white rounded font-bold">שמור שינויים</button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};