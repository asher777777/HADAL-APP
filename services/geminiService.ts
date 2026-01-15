import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

export const initializeChat = (userName: string) => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing");
    return;
  }

  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    אתה עוזר וירטואלי חכם ואמפתי באפליקציית "חדל קשקשת ברשת", חלק ממיזם "מטמורפוזה יהודית".
    שמו של המשתמש הוא ${userName}.
    מטרתך היא ללוות את המשתמש בתהליך הצמיחה האישית, לעזור לו להתנתק מרעש דיגיטלי ולהתחבר פנימה.
    התשובות שלך צריכות להיות קצרות, מעודדות, בעברית, ורוחניות אך מעשיות.
    אל תיתן תשובות ארוכות מדי. תהיה כמו מאמן אישי רגוע.
  `;

  chatSession = genAI.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    // Attempt to re-init if session is lost, default to 'User'
    initializeChat('User'); 
    if (!chatSession) return "שגיאה בחיבור ל-AI. אנא בדוק את הגדרות המערכת.";
  }

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "לא התקבלה תשובה.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "מצטער, נתקלתי בבעיה בעיבוד הבקשה שלך. אנא נסה שוב מאוחר יותר.";
  }
};