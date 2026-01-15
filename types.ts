export type ViewState = 'loading' | 'landing' | 'onboarding' | 'info' | 'dashboard' | 'task' | 'admin';

export interface UserProfile {
  id?: number; // Database ID
  name: string;
  email: string;
  phone?: string;
  // Demographics
  ageRange?: string;
  gender?: 'male' | 'female' | 'other';
  // Professional
  workplace?: string;
  role?: string;
  // Habits
  dailyScreenTime?: string;
  reductionGoal?: string;
  
  goals: string[];
  joinDate: string;
  progress: {
    currentDay: number;
    completedDays: number[];
    streak: number;
  };
}

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'doc' | 'image' | 'audio' | 'link';
}

export interface DayContent {
  id: number;
  title: string;
  description: string; // Plain text short description for dashboard
  htmlContent?: string; // Rich text content for the lesson
  videoUrl: string; // Placeholder for Google Drive/YouTube
  writingPrompt: string;
  guidedImageryAudioUrl: string; // Placeholder
  resources?: ResourceLink[]; // List of extra files
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Automation {
  id: string;
  name: string;
  trigger: 'day_complete' | 'inactive_3_days' | 'program_start';
  triggerValue?: number; // e.g. Day ID
  action: 'send_whatsapp' | 'send_email' | 'system_notification';
  messageTemplate: string;
  active: boolean;
}

export interface ProgramSettings {
  title: string;
  description: string;
  isPublished: boolean;
}