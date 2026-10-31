'use client';
import { useEffect, useState } from 'react';

export function useLoadTime(): number | null {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const t = performance.now();
    setMs(Math.round(t));
  }, []);
  return ms;
}
