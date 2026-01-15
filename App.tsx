import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { LandingPage } from './components/LandingPage';
import { InfoPage } from './components/InfoPage';
import { Dashboard } from './components/Dashboard';
import { DailyTask } from './components/DailyTask';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile, ViewState, DayContent, Automation, ProgramSettings } from './types';
import { ChatBot } from './components/ChatBot';
import { MOCK_DAYS, INITIAL_USER_STATE } from './constants';
import { auth, googleProvider } from './firebaseConfig';
import { signInWithPopup } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('loading');
  const [days, setDays] = useState<Record<number, DayContent>>({});
  
  // Program Settings State
  const [programSettings, setProgramSettings] = useState<ProgramSettings>({
    title: 'מסע המטמורפוזה',
    description: 'תוכנית יומית לצמיחה אישית והתנתקות מרעשים דיגיטליים',
    isPublished: true
  });
  const [automations, setAutomations] = useState<Automation[]>([]);

  // --- API Helpers ---
  const fetchDays = async () => {
    try {
      const res = await fetch('/api/days');
      if (res.ok) {
        const data = await res.json();
        // If empty DB, fallback to MOCK
        if (Object.keys(data).length === 0) {
          setDays(MOCK_DAYS);
        } else {
          setDays(data);
        }
      } else {
        console.warn('API Error, using mock data');
        setDays(MOCK_DAYS);
      }
    } catch (error) {
      console.error('Failed to fetch days', error);
      setDays(MOCK_DAYS); // Fallback for offline/dev without server
    }
  };

  const syncUserToDB = async (userData: UserProfile) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success && data.user) {
        // Return the full user object from DB (which includes roles, IDs etc)
        return data.user;
      }
    } catch (error) {
      console.error("Failed to sync user", error);
    }
    return userData;
  };

  const syncProgressToDB = async (userId: number, dayId: number) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, dayId })
      });
    } catch (error) {
      console.error("Failed to sync progress", error);
    }
  };

  // --- Initial Load ---
  useEffect(() => {
    const initApp = async () => {
      // 1. Load Content
      await fetchDays();
      
      // 2. Load Local Settings/User
      const savedSettings = localStorage.getItem('metamorphosis_settings');
      if (savedSettings) setProgramSettings(JSON.parse(savedSettings));

      const savedAutomations = localStorage.getItem('metamorphosis_automations');
      if (savedAutomations) setAutomations(JSON.parse(savedAutomations));

      const savedUser = localStorage.getItem('metamorphosis_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setCurrentView('dashboard');
        } catch (e) {
          console.error("Failed to parse user data", e);
          setCurrentView('landing');
        }
      } else {
        setCurrentView('landing');
      }
    };
    
    initApp();
  }, []);

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('metamorphosis_user', JSON.stringify(updatedUser));
  };

  const handleDaysUpdate = (updatedDays: Record<number, DayContent>) => {
    setDays(updatedDays);
    // In a real app, AdminPanel would call an API endpoint to save these
    localStorage.setItem('metamorphosis_content', JSON.stringify(updatedDays));
  };

  const handleSettingsUpdate = (newSettings: ProgramSettings) => {
    setProgramSettings(newSettings);
    localStorage.setItem('metamorphosis_settings', JSON.stringify(newSettings));
  };

  const handleAutomationsUpdate = (newAutomations: Automation[]) => {
    setAutomations(newAutomations);
    localStorage.setItem('metamorphosis_automations', JSON.stringify(newAutomations));
  };

  const handleOnboardingComplete = async (newUser: UserProfile) => {
    // Save to DB immediately
    const syncedUser = await syncUserToDB(newUser);
    handleUserUpdate(syncedUser);
    setCurrentView('dashboard');
  };

  const handleStartDailyTask = () => {
    setCurrentView('task');
  };

  const handleTaskComplete = async (dayId: number) => {
    if (!user) return;
    
    // Save to DB if user has ID
    if (user.id) {
      await syncProgressToDB(user.id, dayId);
    }

    const updatedUser = {
      ...user,
      progress: {
        ...user.progress,
        completedDays: [...user.progress.completedDays, dayId],
        currentDay: user.progress.currentDay + 1
      }
    };
    handleUserUpdate(updatedUser);
    setCurrentView('dashboard');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleEnterAdmin = () => {
    setCurrentView('admin');
  };

  const handleLogout = () => {
    if (window.confirm("האם אתה בטוח שברצונך לצאת מהמערכת?")) {
      setUser(null);
      localStorage.removeItem('metamorphosis_user');
      auth.signOut().catch(console.error); // Sign out from Firebase too
      setCurrentView('landing');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      
      // Create a partial profile from Google data
      const partialProfile: UserProfile = {
        ...INITIAL_USER_STATE,
        name: googleUser.displayName || 'אורח',
        email: googleUser.email || '',
        profileImage: googleUser.photoURL || undefined,
        // We assume other fields are empty for now, database will merge if exists
      };

      // Sync with DB (will find by email or create new)
      const syncedUser = await syncUserToDB(partialProfile);
      
      handleUserUpdate(syncedUser);
      
      // Decision: If phone/role are missing, it might be a new user who needs onboarding.
      // But for now, we send them to dashboard as requested to "Login".
      // You could check `if (!syncedUser.phone) setCurrentView('onboarding')` here.
      setCurrentView('dashboard');

    } catch (error) {
      console.error("Google Login Error:", error);
      alert("התחברות נכשלה. אנא נסה שנית.");
    }
  };

  if (currentView === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <AdminPanel 
        days={days} 
        onUpdateDays={handleDaysUpdate} 
        programSettings={programSettings}
        onUpdateSettings={handleSettingsUpdate}
        automations={automations}
        onUpdateAutomations={handleAutomationsUpdate}
        onExit={handleBackToDashboard}
        currentUser={user}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden" dir="rtl">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-100 to-transparent -z-10" />
      
      <main className="container mx-auto max-w-4xl relative z-10 h-full">
        {currentView === 'landing' && (
          <LandingPage 
            onStartRegistration={() => setCurrentView('onboarding')}
            onShowInfo={() => setCurrentView('info')}
            onGoogleLogin={handleGoogleLogin}
          />
        )}

        {currentView === 'info' && (
          <InfoPage onBack={() => setCurrentView('landing')} />
        )}

        {currentView === 'onboarding' && (
          <Onboarding 
            onComplete={handleOnboardingComplete} 
            onAdminLogin={handleEnterAdmin}
            onExit={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'dashboard' && user && (
          <Dashboard 
            user={user} 
            days={days}
            programTitle={programSettings.title}
            onStartTask={handleStartDailyTask} 
            onLogout={handleLogout}
          />
        )}

        {currentView === 'task' && user && (
          <DailyTask 
            dayId={user.progress.currentDay}
            days={days}
            onComplete={() => handleTaskComplete(user.progress.currentDay)}
            onExit={handleBackToDashboard}
          />
        )}
      </main>

      {/* Persistent AI Chatbot */}
      {user && currentView !== 'landing' && currentView !== 'onboarding' && (
        <ChatBot userName={user.name} />
      )}
    </div>
  );
};

export default App;