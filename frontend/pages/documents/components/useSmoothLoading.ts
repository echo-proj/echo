import { useEffect, useRef, useState } from 'react';

export function useSmoothLoading(isLoading: boolean, minDuration = 350) {
  const [show, setShow] = useState(isLoading);
  const lastActiveRef = useRef(0);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    if (isLoading) {
      lastActiveRef.current = Date.now();
      timeoutRef.current = window.setTimeout(() => setShow(true), 0);
    } else {
      const elapsed = Date.now() - lastActiveRef.current;
      const remaining = Math.max(0, minDuration - elapsed);
      timeoutRef.current = window.setTimeout(() => setShow(false), remaining);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [isLoading, minDuration]);

  return show;
}

