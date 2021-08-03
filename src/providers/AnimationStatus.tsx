import { createContext, PropsWithChildren, useContext } from 'react';

export interface AnimationStatusContextValue {
  isAnimating: boolean;
}

export const AnimationStatusContext = createContext<AnimationStatusContextValue>({
  isAnimating: false,
});

export const useAnimationStatus = () => useContext(AnimationStatusContext).isAnimating;

export interface AnimationStatusProps {
  value: boolean;
}
export const AnimationStatus = ({ children, value }: PropsWithChildren<AnimationStatusProps>) => {
  const parentStatus = useAnimationStatus();
  const isAnimating = value || parentStatus;

  return (
    <AnimationStatusContext.Provider value={{ isAnimating }}>
      {children}
    </AnimationStatusContext.Provider>
  );
};
