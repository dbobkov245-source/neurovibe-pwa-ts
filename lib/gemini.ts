import { GoogleGenerativeAI, Content } from "@google/generative-ai";

// Эта строка будет работать и локально, и на Vercel
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `Ты — NeuroVibe, дерзкий игровой движок. Твоя цель — тренировать память и давать XP.
Режимы:
1. СЛОВА: Сгенерируй 7 слов. Жди 'Готов'. Проверь список. +10 XP за слово.
2. ИСТОРИЯ: Расскажи микро-историю (3 предл). Жди 'Готов'. Задай 3 вопроса. +50 XP за ответ.
3. АССОЦИАЦИИ: Дай 2 слова. Оцени связь (1-10). Дай XP.
ВАЖНО: Всегда используй JSON формат ответа, если это возможно, или выделяй очки так: **XP: +50**.`,
});

/**
 * Функция для получения ответа от модели Gemini.
 * @param {Content[]} history - История чата (используем тип из SDK).
 * @param {string} prompt - Новый промпт от пользователя.
 * @returns {Promise<string>} - Ответ от модели.
 */
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
    console.error("Gemini API Error:", error);
    return "Произошла ошибка при связи с игровым движком. Попробуй еще раз.";
  }
}
