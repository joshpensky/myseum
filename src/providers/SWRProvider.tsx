import { createContext, ReactNode, useContext } from 'react';
import { SWRConfig, ConfigInterface } from 'swr';

type BaseSWRConfig = ConfigInterface<any, any, (request: RequestInfo, init?: RequestInit) => any>;

export type SWRConfigContextValue = Omit<BaseSWRConfig, 'fetcher'> &
  Required<Pick<BaseSWRConfig, 'fetcher'>>;
export const SWRConfigContext = createContext<SWRConfigContextValue | null>(null);

export type SWRProviderProps = {
  children: ReactNode;
};
export const SWRProvider = ({ children }: SWRProviderProps) => {
  /**
   * A wrapper for the fetch API that throws on error responses (4xx or 5xx).
   *
   * @param request the URL to request info from
   * @param init options for the request
   */
  const fetcher = async (request: RequestInfo, init?: RequestInit) => {
    // Fetch the response for the given request and init
    const res = await fetch(request, init);
    // If error response (4xx or 5xx), throw the JSON error
    if (!res.ok) {
      const error = await res.json();
      throw error;
    }
    // Otherwise, return the successful JSON data
    const data = await res.json();
    return data;
  };

  const config: SWRConfigContextValue = {
    fetcher,
    revalidateOnFocus: false,
  };

  return (
    <SWRConfigContext.Provider value={config}>
      <SWRConfig value={config}>{children}</SWRConfig>
    </SWRConfigContext.Provider>
  );
};

export const useSWRConfig = () => {
  const value = useContext(SWRConfigContext);
  if (!value) {
    throw new Error('Cannot call useSWRConfig outside of SWRProvider context.');
  }
  return value;
};
