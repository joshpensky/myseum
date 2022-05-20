import { createContext, PropsWithChildren, useContext } from 'react';
import { GalleryColor } from '@prisma/client';

export interface ThemeContextValue {
  color: GalleryColor;
}

export const ThemeContext = createContext<ThemeContextValue>({ color: 'paper' });

interface ThemeProviderProps {
  theme: ThemeContextValue;
}

export const ThemeProvider = ({ children, theme }: PropsWithChildren<ThemeProviderProps>) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
