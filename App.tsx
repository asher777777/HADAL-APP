
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
import { signInWithPopup, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('loading');
  const [days, setDays] = useState<Record<number, DayContent>>({});
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
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
      const contentType = res.headers.get("content-type");
      
      // Check if response is OK and specifically JSON
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (Object.keys(data).length === 0) {
          setDays(MOCK_DAYS);
        } else {
          setDays(data);
          setIsOfflineMode(false);
        }
      } else {
        console.warn('API returned non-JSON response (likely 404 or HTML). Using offline data.');
        setDays(MOCK_DAYS);
        setIsOfflineMode(true);
      }
    } catch (error) {
      console.error('Network error fetching days:', error);
      setDays(MOCK_DAYS);
      setIsOfflineMode(true);
    }
  };

  const syncUserToDB = async (userData: UserProfile) => {
    if (isOfflineMode) return userData;

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success && data.user) {
          return data.user;
        }
      }
    } catch (error) {
      console.error("Failed to sync user", error);
    }
    return userData;
  };

  const syncProgressToDB = async (userId: number, dayId: number) => {
    if (isOfflineMode) return;

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
    const syncedUser = await syncUserToDB(newUser);
    handleUserUpdate(syncedUser);
    setCurrentView('dashboard');
  };

  const handleStartDailyTask = () => {
    setCurrentView('task');
  };

  const handleTaskComplete = async (dayId: number) => {
    if (!user) return;
    
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
      if (auth) {
        signOut(auth).catch(console.error);
      }
      setCurrentView('landing');
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      alert("שגיאת מערכת: חיבור ל-Firebase לא הוגדר כראוי (חסר API Key).");
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      
      const partialProfile: UserProfile = {
        ...INITIAL_USER_STATE,
        name: googleUser.displayName || 'אורח',
        email: googleUser.email || '',
        profileImage: googleUser.photoURL || undefined,
      };

      const syncedUser = await syncUserToDB(partialProfile);
      handleUserUpdate(syncedUser);
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
      
      {/* Offline Mode Indicator */}
      {isOfflineMode && (
        <div className="bg-amber-100 text-amber-800 text-xs font-bold text-center py-1 px-2 absolute top-0 w-full z-50">
          מצב הדגמה (ללא חיבור לשרת)
        </div>
      )}

      <main className="container mx-auto max-w-4xl relative z-10 h-full pt-6">
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
