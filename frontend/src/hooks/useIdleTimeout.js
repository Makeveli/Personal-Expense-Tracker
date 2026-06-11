import { useState, useEffect, useRef } from 'react';

export const useIdleTimeout = (timeoutMinutes, warningMinutes, onTimeout) => {
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  const handleActivity = () => {
    if (!showWarning) {
      startTimers();
    }
  };

  const startTimers = () => {
    clearTimers();
    
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
    }, timeoutMs - warningMs);

    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, timeoutMs);
  };

  const clearTimers = () => {
    if (warningRef.current) clearTimeout(warningRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const extendSession = () => {
    setShowWarning(false);
    startTimers();
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    startTimers();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimers();
    };
  }, [showWarning]);

  return { showWarning, extendSession };
};
