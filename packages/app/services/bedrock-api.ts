import { defaultParams } from './auth';

export interface ChatMessage {
  id?: string;
  timestamp?: number;
  content: string;
  role: string;

  isLoading?: boolean;
}

export const listModels = async (): Promise<{ id: string }[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bedrock/models`, defaultParams);
  return res.json();
};
