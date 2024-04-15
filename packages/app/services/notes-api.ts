import { apiKey, defaultParams } from './auth';

const notesUrl = (id?: string) =>
  `${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes${id ? `/${id}` : ''}`;

export interface NoteEntity {
  id?: string;
  description: string;
  text: string;
}

export const fetchNotes = async (): Promise<NoteEntity[]> => {
  const res = await fetch(notesUrl(), defaultParams);
  return res.json();
};

export const fetchNoteById = async (id: string): Promise<NoteEntity> => {
  const res = await fetch(notesUrl(id));
  return res.json();
};

export const updateNote = async (data: NoteEntity) => {
  const res = await fetch(notesUrl(data.id), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const createNote = async (data: NoteEntity) => {
  const res = await fetch(notesUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteNote = async (id: string): Promise<void> => {
  await fetch(notesUrl(id), {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    method: 'DELETE',
  });
};
