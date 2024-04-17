import { randomBytes } from 'crypto';
import { NotesEntity } from '../adapter/database/model/notes';

export const notesPrompt = (notes: NotesEntity[]) =>
  `These are some relevant notes I have taken. ` +
  `Please only consider using this information if it ` +
  `seems useful for the questions that I ask you.` +
  `DO NOT CONFIRM THAT you understood this. ` +
  `Continue with our chat as if ` +
  `I never provided any additional information ` +
  `in the first place: \n${notes.map(({ description, text }) => `* ${description}: ${text}`).join('\n')}`;

export function generateUUID(): string {
  return (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
    (c ^ (randomBytes(1)[0] & (15 >> (c / 4)))).toString(16),
  );
}

export function checkApiKey(_evt: any) {
  const apiKey = process.env.API_KEY!;
  if (_evt.headers['x-api-key'] !== apiKey) {
    throw new Error('Unauthorized');
  }
}

export const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Content-Type': 'application/json',
};
