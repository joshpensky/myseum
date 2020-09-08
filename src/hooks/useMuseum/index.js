import useSWR from 'swr';

const useMuseum = museumId => {
  const { data, error } = useSWR(() => `/api/museums/${museumId}`);

  return {
    museum: data,
    error,
    isLoading: !error && !data,
  };
};

export default useMuseum;
