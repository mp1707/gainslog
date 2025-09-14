import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

type NavigationTransitionContextValue = {
  isTransitioning: boolean;
  setTransitioning: (value: boolean) => void;
};

const NavigationTransitionContext = createContext<NavigationTransitionContextValue | undefined>(undefined);

export const NavigationTransitionProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const value = useMemo(
    () => ({
      isTransitioning,
      setTransitioning: setIsTransitioning,
    }),
    [isTransitioning]
  );

  return (
    <NavigationTransitionContext.Provider value={value}>
      {children}
    </NavigationTransitionContext.Provider>
  );
};

export function useNavigationTransition() {
  const ctx = useContext(NavigationTransitionContext);
  if (!ctx) throw new Error('useNavigationTransition must be used within NavigationTransitionProvider');
  return ctx;
}

