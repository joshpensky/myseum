import { createContext, PropsWithChildren, useContext } from 'react';
import { GalleryColor } from '@src/types';

export type ThemeContextValue = {
  color: GalleryColor;
};
export const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  color: GalleryColor;
};
export const ThemeProvider = ({ children, color }: PropsWithChildren<ThemeProviderProps>) => (
  <ThemeContext.Provider value={{ color }}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
