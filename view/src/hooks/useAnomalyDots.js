import { useState, useEffect, useRef, useMemo } from "react";

export function useContainerWidth() {
  const containerRef = useRef(null);
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

export function useAnomalyIds(timestamps) {
  return useMemo(
    () => [...new Set(timestamps.map((t) => t.anomaly_id))],
    [timestamps]
  );
}

export function useLeftPercent(minTime, maxTime) {
  const totalDuration = maxTime - minTime;
  return (time) => ((time - minTime) / totalDuration) * 100;
}
