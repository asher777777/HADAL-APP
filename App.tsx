import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { LandingPage } from './components/LandingPage';
import { InfoPage } from './components/InfoPage';
import { Dashboard } from './components/Dashboard';
import { DailyTask } from './components/DailyTask';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile, ViewState, DayContent, Automation, ProgramSettings } from './types';
import { ChatBot } from './components/ChatBot';
import { MOCK_DAYS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('loading');
  const [days, setDays] = useState<Record<number, DayContent>>(MOCK_DAYS);
  
  // New State for Program & Automations
  const [programSettings, setProgramSettings] = useState<ProgramSettings>({
    title: 'מסע המטמורפוזה',
    description: 'תוכנית יומית לצמיחה אישית והתנתקות מרעשים דיגיטליים',
    isPublished: true
  });
  const [automations, setAutomations] = useState<Automation[]>([]);

  // Load user and days from local storage on mount
  useEffect(() => {
    // Load Content
    const savedDays = localStorage.getItem('metamorphosis_content');
    if (savedDays) {
      try {
        setDays(JSON.parse(savedDays));
      } catch (e) {
        console.error("Failed to parse days content", e);
      }
    }
    
    // Load Settings
    const savedSettings = localStorage.getItem('metamorphosis_settings');
    if (savedSettings) setProgramSettings(JSON.parse(savedSettings));

    // Load Automations
    const savedAutomations = localStorage.getItem('metamorphosis_automations');
    if (savedAutomations) setAutomations(JSON.parse(savedAutomations));

    // Load User
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

  const handleOnboardingComplete = (newUser: UserProfile) => {
    handleUserUpdate(newUser);
    setCurrentView('dashboard');
  };

  const handleStartDailyTask = () => {
    setCurrentView('task');
  };

  const handleTaskComplete = (dayId: number) => {
    if (!user) return;
    
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
      setCurrentView('landing');
    }
  };

  const handleGoogleLogin = () => {
    // Simulated Google Login
    // In a real app, this would trigger OAuth
    alert("מתחבר עם גוגל...");
    // If we had a "remembered" user or if this was real, we'd set currentView('dashboard')
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

      {/* Persistent AI Chatbot (Only show if logged in and not admin/landing) */}
      {user && currentView !== 'landing' && currentView !== 'onboarding' && (
        <ChatBot userName={user.name} />
      )}
    </div>
  );
};

export default App;