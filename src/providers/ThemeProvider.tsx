import { createContext, PropsWithChildren, useContext } from 'react';
import { GalleryColor } from '@prisma/client';

export type ThemeContextValue = {
  color: GalleryColor;
};
export const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  theme: ThemeContextValue;
};
export const ThemeProvider = ({ children, theme }: PropsWithChildren<ThemeProviderProps>) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used within context of ThemeProvider.');
  }
  return value;
};
