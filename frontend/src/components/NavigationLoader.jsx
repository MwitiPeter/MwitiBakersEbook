import { useState, useEffect, useRef, memo } from 'react';
import { useNavigation } from '../context/NavigationContext';

const NavigationLoader = memo(function NavigationLoader() {
  const { isNavigating } = useNavigation();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (isNavigating) {
      progressRef.current = 0;
      setVisible(true);
      setWidth(15); // Start at 15%

      // Gradually increase progress (but never reach 100%)
      timerRef.current = setInterval(() => {
        progressRef.current = Math.min(progressRef.current + (100 - progressRef.current) * 0.15, 85);
        setWidth(progressRef.current);
      }, 300);
    } else {
      // Complete the bar
      setWidth(100);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Hide after animation completes
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setWidth(0);
        progressRef.current = 0;
      }, 400);

      return () => clearTimeout(hideTimer);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isNavigating]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-0.5 z-[9999] bg-brand-gold/30"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s' }}
    >
      <div
        className="h-full bg-brand-gold transition-all duration-300 ease-out rounded-r-full shadow-lg shadow-brand-gold/50"
        style={{ width: `${width}%` }}
      />
    </div>
  );
});

export default NavigationLoader;
