import Link from 'next/link';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchNotes, deleteNote } from '../../services/notes-api';

const Notes: React.FC = () => {
  const queryClient = useQueryClient();
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const { data: notes, isLoading, error } = useQuery('notes', fetchNotes);

  const { mutate: removeNote, isLoading: isDeleteLoading } = useMutation(deleteNote, {
    onMutate: async (id: string) => {
      setDeletingNoteId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries('notes');
      setDeletingNoteId(null);
    },
    onError: () => {
      setDeletingNoteId(null);
    },
  });

  const handleDelete = (id: string) => {
    removeNote(id);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  if (error instanceof Error)
    return (
      <div className="flex items-center justify-center h-screen">
        <div>An error occurred: {error.message}</div>
      </div>
    );

  return (
    <div className="m-20">
      <Link href="/notes/new" passHref>
        <button className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">Add Note</button>
      </Link>
      <div className="flex flex-col gap-4">
        {notes?.map((note) => (
          <div key={note.id} className="border p-4 rounded-lg">
            <h2 className="text-xl font-bold">{note.description}</h2>
            <p>{note.text}</p>
            <div className="mt-2 flex gap-2">
              <Link href={`/notes/${note.id}`} passHref>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Edit</button>
              </Link>
              <button
                disabled={deletingNoteId === note.id}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 disabled:bg-red-300"
                onClick={() => handleDelete(note.id!)}
              >
                {deletingNoteId === note.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
