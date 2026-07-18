import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef(null);

  const startNavigation = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsNavigating(true);
  }, []);

  const endNavigation = useCallback(() => {
    // Small delay so the progress bar can animate to 100%
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, 100);
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      startNavigation();
      // Navigation will complete when the next page's useEffect calls endNavigation()
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [startNavigation]);

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation, endNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    return { isNavigating: false, startNavigation: () => {}, endNavigation: () => {} };
  }
  return context;
}
