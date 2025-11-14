// lib/gemini.ts
import { GoogleGenerativeAI, Content } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  // --- ИЗМЕНЕНО ЗДЕСЬ ---
  // Переключаемся на стабильную и глобально доступную модель
  model: "gemini-1.0-pro", 
  
  systemInstruction: `Ты — NeuroVibe, дерзкий игровой движок. Твоя цель — тренировать память и давать XP.
Режимы:
1. СЛОВА: Сгенерируй 7 слов. Жди 'Готов'. Проверь список. +10 XP за слово.
2. ИСТОРИЯ: Расскажи микро-историю (3 предл). Жди 'Готов'. Задай 3 вопроса. +50 XP за ответ.
3. АССОЦИАЦИИ: Дай 2 слова. Оцени связь (1-10). Дай XP.
ВАЖНО: Всегда используй JSON формат ответа, если это возможно, или выделяй очки так: **XP: +50**.`,
});

export async function getGameResponse(history: Content[], prompt: string): Promise<string> {
  try {
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.9,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("NeuroVibe Gemini API Error:", error);
    if (error instanceof Error) {
        return `Произошла ошибка при связи с игровым движком. Детали: ${error.message}. Проверьте настройки API ключа.`;
    }
    return "Произошла ошибка при связи с игровым движком. Проверьте консоль разработчика для деталей.";
  }
}
