// Custom hook for fetching and managing battery data
'use client';

import { useState, useEffect } from 'react';
import type { BatteryData } from '@/types';
import { fetchBatteryData } from '@/lib/data';

export function useBatteryData() {
  const [data, setData] = useState<BatteryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const batteryData = await fetchBatteryData();
        setData(batteryData);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error('Error loading battery data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
