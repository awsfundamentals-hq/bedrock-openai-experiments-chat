import { defaultParams } from './auth';

export interface ChatMessage {
  id?: string;
  timestamp?: number;
  content: string;
  role: string;

  isLoading?: boolean;
}

export const listModels = async (adapter: string): Promise<{ id: string }[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/${adapter}/models`, defaultParams);
  return res.json();
};

export const submitPrompt = async (params: {
  adapter: string;
  content: string;
  model: string;
}): Promise<{ content: string; model: string }> => {
  const { content, model, adapter } = params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/${adapter}/submit`, {
    ...defaultParams,
    method: 'POST',
    body: JSON.stringify({ content, model }),
  });
  const result = (await res.json()).content;
  return { content: result, model };
};

export const getMessages = async (): Promise<ChatMessage[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/messages`, defaultParams);
  return res.json();
};

export const clearMessages = async (): Promise<void> => {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/messages`, {
    ...defaultParams,
    method: 'DELETE',
  });
};
