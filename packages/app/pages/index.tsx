// Home.tsx
import Header from '@/components/Header';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <Header />
      </main>
    </QueryClientProvider>
  );
}
