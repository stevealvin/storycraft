import OpenAI from 'openai';
import { getActiveApiConfig } from './db.js';

export function getLLMClient(overrideConfig?: { baseUrl?: string; apiKey?: string }) {
  const activeApi = getActiveApiConfig();
  const baseUrl = overrideConfig?.baseUrl || activeApi.baseUrl;
  const apiKey = overrideConfig?.apiKey || activeApi.apiKey;

  return new OpenAI({
    baseURL: baseUrl,
    apiKey: apiKey,
  });
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    baseUrl?: string;
    apiKey?: string;
  }
): Promise<string> {
  const client = getLLMClient({
    baseUrl: options?.baseUrl,
    apiKey: options?.apiKey,
  });

  const activeApi = getActiveApiConfig();
  const model = options?.model || activeApi.model;

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 4000,
    });

    return response.choices[0]?.message?.content || '';
  } catch (err: any) {
    console.error('LLM API Error:', err?.message || err);
    throw new Error(`LLM Error: ${err?.message || err}`);
  }
}

export async function chatCompletionJson<T = any>(
  messages: ChatMessage[],
  options?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    baseUrl?: string;
    apiKey?: string;
  }
): Promise<T> {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: '??????????????????????????? JSON ????,?????? markdown ?????,??? JSON ???'
  };

  const responseText = await chatCompletion([systemMessage, ...messages], {
    ...options,
    temperature: options?.temperature ?? 0.5,
  });

  let cleanJson = responseText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    return JSON.parse(cleanJson) as T;
  } catch (err) {
    console.error('Failed to parse LLM JSON output:', cleanJson);
    throw new Error('LLM output was not valid JSON: ' + cleanJson.slice(0, 200));
  }
}
