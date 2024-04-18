// Home.tsx
import Header from '@/components/Header';
import router from 'next/router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export default function Home() {
  // by default, redirect to /notes
  useEffect(() => {
    router.replace('/notes');
  });

  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <Header />
      </main>
    </QueryClientProvider>
  );
}
