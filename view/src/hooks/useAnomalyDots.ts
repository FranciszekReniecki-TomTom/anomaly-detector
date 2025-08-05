import { useState, useEffect, useRef } from "react";

export function useContainerWidth(): [React.RefObject<HTMLDivElement | null>, number] {
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

export function useLeftPercent(minTime: number, maxTime: number) {
  const totalDuration = maxTime - minTime;
  return (time: number) => ((time - minTime) / totalDuration) * 100;
}
