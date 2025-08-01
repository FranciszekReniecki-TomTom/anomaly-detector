import { Label, Slider } from "tombac";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useAppContext } from "../AppContext";

export default function TimeSlider() {
  const { timestampValues, selectedTime, setSelectedTime } = useAppContext();

  const formatTimestamp = (ts) => new Date(ts).toLocaleString();
  const containerRef = useRef(null);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);

  const times = timestampValues.map((t) => new Date(t).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  useEffect(() => {
    if (!selectedTime) return;
    const currentTime = new Date(selectedTime).getTime();
    setSliderValue(currentTime);
  }, [selectedTime]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const percent = (sliderValue - minTime) / (maxTime - minTime);
    const left = percent * containerWidth;
    setThumbLeft(left);
  }, [sliderValue, minTime, maxTime]);

  const snapToNearest = (time) => {
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

  const onSliderChange = (t) => {
    const snapped = snapToNearest(t);
    setSliderValue(snapped);
    setSelectedTime(snapped);
  };

  if (timestampValues.length === 0) return null;

  return (
    <>
      <Label style={{ display: "block", marginBottom: 18 }}>Select time:</Label>

      <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
        <div
          style={{
            position: "absolute",
            left: thumbLeft,
            bottom: 24,
            transform: "translateX(-50%)",
            color: "white",
            padding: "2px 6px",
            borderRadius: 4,
            fontSize: 12,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <Label>{formatTimestamp(selectedTime)}</Label>
        </div>
        <div style={{ top: 0 }}>
          <Slider
            min={minTime}
            max={maxTime}
            step={1}
            value={sliderValue}
            onChange={onSliderChange}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </>
  );
}
