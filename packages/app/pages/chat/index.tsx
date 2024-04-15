// components/ChatComponent.js
import { DateTime } from 'luxon';
import { ChatMessage, getMessages, listModels, submitPrompt } from '@/services/openai-api';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

function ChatComponent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo-0613');

  const { data: models = [], isLoading, isError } = useQuery(['models'], listModels);

  useEffect(() => {
    const loadMessages = async () => {
      const existingMessages = await getMessages();
      // sort by timestamp ascending
      existingMessages.sort((a, b) => a.timestamp! - b.timestamp!);
      setMessages(existingMessages);
    };
    loadMessages();
  }, []);

  const {
    mutate,
    isLoading: isSubmitting,
    isError: submitError,
  } = useMutation(submitPrompt, {
    onSuccess: ({ text }) => {
      // Update messages by removing isLoading flag and adding response
      setMessages((currentMessages) =>
        currentMessages
          .map((msg) => (msg.isLoading ? { ...msg, isLoading: false } : msg))
          .concat([{ text, from: 'response', timestamp: Date.now() }]),
      );
    },
    onError: (error) => {
      console.error('Message sending failed:', error);
      // Remove loading indicator if error occurs
      setMessages((currentMessages) =>
        currentMessages.map((msg) => (msg.isLoading ? { ...msg, isLoading: false } : msg)),
      );
    },
  });

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          text: input,
          model: selectedModel,
          from: 'user',
          isLoading: true
        }
      ]);
      mutate({ text: input, model: selectedModel });
      setInput('');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading models</div>;

  return (
    <div className="flex flex-col h-screen">
      <div className="pt-20 p-4">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="p-2 border rounded focus:outline-none focus:border-blue-500"
          disabled={isSubmitting}
        >
          <option value="">Select a model</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.id}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <div key={index} className={`max-w-xl mx-auto bg-gray-100 p-2 rounded ${message.from === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}>
            {message.text}
            {message.isLoading && <span className="text-sm text-gray-500"> (sending...)</span>}
            <span className="text-sm">{message.from === 'user' ? ' (You)' : ' (AI)'}</span>
            {message.timestamp && <div className="text-xs text-gray-500">{DateTime.fromMillis(message.timestamp).toRelative()}</div>}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border rounded focus:outline-none focus:border-blue-500"
          placeholder="Type your message..."
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 text-white p-2 rounded"
          disabled={isSubmitting || input.trim() === ''}
        >
          Send
        </button>
      </form>
      {submitError && <div className="text-red-500">Failed to send message. Please try again.</div>}
    </div>
  );
}

export default ChatComponent;
