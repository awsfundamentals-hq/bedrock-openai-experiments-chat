import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  createNote,
  fetchNoteById,
  updateNote,
} from '../../../services/notes-api';

const Note: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Access `id` from the URL
  const [desc, setDesc] = useState('');
  const [txt, setTxt] = useState('');

  useEffect(() => {
    // Reset form when id changes to 'new'
    if (id === 'new') {
      setDesc('');
      setTxt('');
    }
  }, [id]);

  // Fetch note details if `id` is available and not 'new'
  const { isLoading: isFetching } = useQuery(
    ['note', id],
    () => fetchNoteById(id as string),
    {
      enabled: !!id && id !== 'new', // Only run the query if `id` is not null and not 'new'
      onSuccess: (data) => {
        setDesc(data.description);
        setTxt(data.text);
      },
    },
  );

  const mutation = useMutation(id && id !== 'new' ? updateNote : createNote, {
    onSuccess: () => {
      // Ensure navigation occurs after successful save
      router.push('/notes');
    },
  });

  const handleSave = () => {
    const noteData = {
      id: (id === 'new' ? undefined : id) as string,
      description: desc,
      text: txt,
    };
    mutation.mutate(noteData);
  };

  if (isFetching) return <div>Loading...</div>;

  return (
    <div className="mt-40 p-4 mt-4 max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
      <input
        className="mb-2 w-full p-2 text-lg font-bold text-gray-900 bg-white border border-gray-300 rounded dark:text-white dark:bg-gray-800 dark:border-gray-700"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Description"
      />
      <textarea
        className="w-full p-2 text-base font-normal text-gray-700 bg-white border border-gray-300 rounded dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700"
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
        placeholder="Text"
        rows={10}
      />
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 flex items-center"
        onClick={handleSave}
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Saving...
          </>
        ) : (
          'Save'
        )}
      </button>
    </div>
  );
};

export default Note;
