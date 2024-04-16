import { defaultParams } from './auth';

export interface ChatMessage {
  id?: string;
  timestamp?: number;
  text: string;
  from: string;

  isLoading?: boolean;
}

export const listModels = async (): Promise<{ id: string }[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/openai/models`, defaultParams);
  return res.json();
};

export const submitPrompt = async (params: {
  text: string;
  model: string;
}): Promise<{ text: string; model: string }> => {
  const { text, model } = params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/openai/submit`, {
    ...defaultParams,
    method: 'POST',
    body: JSON.stringify({ text, model }),
  });
  const result = (await res.json()).text;
  return { text: result, model };
};

export const getMessages = async (): Promise<ChatMessage[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/openai/messages`, defaultParams);
  return res.json();
};

export const clearMessages = async (): Promise<void> => {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/openai/messages`, {
    ...defaultParams,
    method: 'DELETE',
  });
}