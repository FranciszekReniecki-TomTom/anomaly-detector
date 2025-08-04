import { useState, useEffect, useRef, useMemo } from "react";

export function useContainerWidth(): [React.RefObject<HTMLDivElement>, number] {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () =>
      containerRef.current && setWidth(containerRef.current.offsetWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return [containerRef, width];
}

export interface AnomalyDotTimestamp {
  time: number;
  anomaly_id: string;
}

export function useAnomalyIds(timestamps: AnomalyDotTimestamp[]): string[] {
  return useMemo(
    () => [...new Set(timestamps.map((t) => t.anomaly_id))],
    [timestamps]
  );
}

export function useLeftPercent(minTime: number, maxTime: number) {
  const totalDuration = maxTime - minTime;
  return (time: number) => ((time - minTime) / totalDuration) * 100;
}
