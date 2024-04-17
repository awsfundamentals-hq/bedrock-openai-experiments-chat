// components/ChatComponent.js
import { ChatMessage, clearMessages, getMessages, listModels, submitPrompt } from '@/services/chat-api';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

function ChatComponent() {
  const [adapter, setAdapter] = useState<'openai' | 'bedrock' | undefined>(undefined);
  const [isClearPending, setIsClearPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo-0613');

  const { data: models = [], isLoading, isError } = useQuery(['models'], listModels.bind(null, 'openai'));

  useEffect(() => {
    if (!adapter) return; // Don't load messages if no adapter is selected
    const loadMessages = async () => {
      const existingMessages = await getMessages();
      // sort by timestamp ascending
      existingMessages.sort((a, b) => a.timestamp! - b.timestamp!);
      setMessages(existingMessages);
    };
    loadMessages();
  }, [adapter]);

  const {
    mutate,
    isLoading: isSubmitting,
    isError: submitError,
  } = useMutation(submitPrompt, {
    onSuccess: ({ content }) => {
      // Update messages by removing isLoading flag and adding response
      setMessages((currentMessages) =>
        currentMessages
          .map((msg) => (msg.isLoading ? { ...msg, isLoading: false } : msg))
          .concat([{ content, role: 'assistant', timestamp: Date.now() }]),
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

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          content: input,
          model: selectedModel,
          role: 'user',
          isLoading: true,
        },
      ]);
      mutate({ adapter: adapter!, content: input, model: selectedModel });
      setInput('');
    }
  };

  const handleClearChat = async () => {
    setIsClearPending(true);
    await clearMessages(); // Call to service method to clear messages on the backend
    setMessages([]); // Clear messages on the frontend
    setIsClearPending(false);
  };

  if (!adapter) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <h1 className="mb-4 text-lg font-bold">Select an Adapter</h1>
          <button
            onClick={() => setAdapter('openai')}
            className="mb-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <img src="/icon-openai.svg" alt="OpenAI Icon" className="w-6 h-6" /> OpenAI
          </button>
          <button
            onClick={() => setAdapter('bedrock')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <img src="/icon-bedrock.png" alt="Bedrock Icon" className="w-6 h-6" /> Amazon Bedrock
          </button>
        </div>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  if (isError)
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Error loading models</div>
      </div>
    );

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
        <button
          onClick={handleClearChat}
          disabled={isClearPending}
          className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 disabled:bg-red-300"
        >
          Clear Chat
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-xl mx-auto bg-gray-100 p-2 rounded ${message.role === 'user' ? 'bg-blue-100' : 'bg-green-100'}`}
          >
            {message.content}
            {message.isLoading && <span className="text-sm text-gray-500"> (sending...)</span>}
            <span className="text-sm">{message.role === 'user' ? ' (You)' : ' (AI)'}</span>
            {message.timestamp && (
              <div className="text-xs text-gray-500">{DateTime.fromMillis(message.timestamp).toRelative()}</div>
            )}
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
