
export type ViewState = 'loading' | 'landing' | 'onboarding' | 'info' | 'dashboard' | 'task' | 'admin';

// Extend Window interface for runtime environment variables
declare global {
  interface Window {
    __ENV__?: {
      FIREBASE_API_KEY?: string;
      FIREBASE_AUTH_DOMAIN?: string;
      FIREBASE_PROJECT_ID?: string;
      FIREBASE_STORAGE_BUCKET?: string;
      FIREBASE_MESSAGING_SENDER_ID?: string;
      FIREBASE_APP_ID?: string;
      API_KEY?: string; // For Gemini
    };
  }
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  durationDays: number;
  description: string;
}

export interface UserProfile {
  id?: number; // Database ID
  name: string;
  email: string;
  phone?: string;
  profileImage?: string; // Base64 or URL
  
  // Demographics & Onboarding Data (Now explicit in DB)
  ageRange?: string;
  gender?: 'male' | 'female' | 'other';
  workplace?: string;
  role?: string; // Profession role
  dailyScreenTime?: string;
  reductionGoal?: string;
  
  // System Roles & Subscription
  systemRole: 'user' | 'admin';
  subscriptionPlanId: number;
  subscriptionPlanName?: string; // For display
  
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
