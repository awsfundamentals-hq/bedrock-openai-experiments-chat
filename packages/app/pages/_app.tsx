import Header from '@/components/Header'; // If you want the Header to be global
import '@/styles/globals.css';
import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Header /> {/* If you want the Header to be part of every page */}
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default MyApp;
