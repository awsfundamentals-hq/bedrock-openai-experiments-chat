export const apiKey = process.env.NEXT_PUBLIC_API_KEY!;
export const defaultParams = {
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  },
};
