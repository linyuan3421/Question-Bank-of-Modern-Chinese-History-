import { GoogleGenAI } from "@google/genai";
import { Question } from "../types";

// 延迟初始化客户端，避免在没有配置 process 的环境中导致应用启动崩溃
let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI | null => {
  if (ai) return ai;

  let apiKey = '';
  try {
    // 安全地检查 process 是否存在
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("无法访问环境变量");
  }

  if (!apiKey) {
    console.warn("API_KEY 未找到");
    return null;
  }

  ai = new GoogleGenAI({ apiKey });
  return ai;
}

export const getQuestionExplanation = async (question: Question): Promise<string> => {
  const prompt = `
    你是一位专业的中国近代史历史老师。请针对以下题目提供详细的解析。
    
    题目：${question.question}
    选项：
    ${question.options.join('\n')}
    正确答案：${question.answer.join(', ')}
    
    请按以下结构回答：
    1. 【核心考点】：一句话概括这道题考查的历史知识点。
    2. 【解析】：详细解释为什么正确答案是正确的，涉及的历史事件背景、原因或意义。
    3. 【易错分析】：简要分析干扰项为什么是错的（如果有明显的干扰项）。
    
    语气要生动、通俗易懂，帮助学生记忆。
  `;

  try {
    const client = getAiClient();
    if (!client) {
      return "系统未配置 API Key，无法使用 AI 解析功能。";
    }

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "抱歉，暂时无法获取解析。";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "获取 AI 解析失败，请检查网络或稍后重试。";
  }
};
