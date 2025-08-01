import { useState, useEffect, useRef, useLayoutEffect } from "react";

export function useContainerWidth() {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => setWidth(containerRef.current.offsetWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return [containerRef, width];
}

export function useSliderValue(selectedTime) {
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (!selectedTime) return;
    const currentTime = new Date(selectedTime).getTime();
    setSliderValue(currentTime);
  }, [selectedTime]);

  return [sliderValue, setSliderValue];
}

export function useThumbLeft(sliderValue, minTime, maxTime, containerWidth) {
  const [thumbLeft, setThumbLeft] = useState(0);

  useLayoutEffect(() => {
    if (!containerWidth) return;
    const percent = (sliderValue - minTime) / (maxTime - minTime);
    const left = percent * containerWidth;
    setThumbLeft(left);
  }, [sliderValue, minTime, maxTime, containerWidth]);

  return thumbLeft;
}

export function useSnapToNearest(times) {
  return (time) => {
    let closest = times[0];
    let minDiff = Math.abs(time - closest);
    for (let i = 1; i < times.length; i++) {
      const diff = Math.abs(time - times[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = times[i];
      }
    }
    return closest;
  };
}
