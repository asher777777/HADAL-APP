import { DayContent, UserProfile } from './types';

export const INITIAL_USER_STATE: UserProfile = {
  name: '',
  email: '',
  phone: '',
  goals: [],
  ageRange: '',
  workplace: '',
  role: '',
  dailyScreenTime: '',
  reductionGoal: '',
  joinDate: new Date().toISOString(),
  systemRole: 'user',
  subscriptionPlanId: 1,
  progress: {
    currentDay: 1,
    completedDays: [],
    streak: 0
  }
};

export const MOCK_DAYS: Record<number, DayContent> = {
  1: {
    id: 1,
    title: "המעבר מרעש לשקט",
    description: "בשיעור הראשון נלמד לזהות את הרעשים הדיגיטליים.",
    htmlContent: `
      <h2>מהו רעש דיגיטלי?</h2>
      <p>בעולם המודרני, אנו מוקפים בגירויים בלתי פוסקים. ההתראות, הצלצולים והרטט בכיס - כולם נועדו למשוך את תשומת הלב שלנו.</p>
      <p><b>המטרה שלנו:</b> ללמוד ליצור "כיסים" של שקט בתוך היום יום.</p>
    `,
    videoUrl: "https://www.youtube.com/embed/5qap5aO4i9A", 
    writingPrompt: "כתבו 3 מקורות 'רעש' עיקריים בחייכם כרגע, וכיצד הם משפיעים על התחושה הפיזית שלכם.",
    guidedImageryAudioUrl: "https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg",
    resources: [
      { id: '1', title: 'דף עבודה - זיהוי רעשים', type: 'pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }
    ]
  },
  2: {
    id: 2,
    title: "ניקוי רעלים דיגיטלי",
    description: "טכניקות מעשיות לצמצום צריכת מסכים.",
    htmlContent: `
      <h2>כיצד מתחילים?</h2>
      <p>ניקוי רעלים דיגיטלי לא חייב להיות קיצוני. הוא מתחיל בצעדים קטנים:</p>
      <ul>
        <li>ביטול התראות לא חשובות</li>
        <li>קביעת שעות ללא מסך</li>
        <li>השארת הטלפון מחוץ לחדר השינה</li>
      </ul>
    `,
    videoUrl: "https://www.youtube.com/embed/jfKfPfyJRdk", 
    writingPrompt: "תארו רגע אחד מהיום האחרון בו הרגשתם נוכחות מלאה ללא טלפון. מה הרגשתם? מה ראיתם?",
    guidedImageryAudioUrl: "https://actions.google.com/sounds/v1/nature/forest_morning.ogg",
    resources: []
  }
};