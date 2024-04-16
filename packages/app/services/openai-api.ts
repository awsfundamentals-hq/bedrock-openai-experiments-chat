import { defaultParams } from './auth';

export interface ChatMessage {
  id?: string;
  timestamp?: number;
  content: string;
  role: string;

  isLoading?: boolean;
}

export const listModels = async (): Promise<{ id: string }[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/openai/models`, defaultParams);
  return res.json();
};

export const submitPrompt = async (params: {
  content: string;
  model: string;
}): Promise<{ content: string; model: string }> => {
  const { content, model } = params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/openai/submit`, {
    ...defaultParams,
    method: 'POST',
    body: JSON.stringify({ content, model }),
  });
  const result = (await res.json()).content;
  return { content: result, model };
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
};
