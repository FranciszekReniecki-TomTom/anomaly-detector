import { Label, Slider } from "tombac";
import { useState, useEffect, useRef, useLayoutEffect } from "react";

export default function TimeSlider({ timestamps, value, setValue }) {
  const formatTimestamp = (ts) => new Date(ts).toLocaleString();

  const [sliderIndex, setSliderIndex] = useState(0);
  const containerRef = useRef(null);
  const [thumbLeft, setThumbLeft] = useState(0);

  useEffect(() => {
    const index = timestamps.indexOf(value);
    setSliderIndex(index === -1 ? 0 : index);
  }, [value, timestamps]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const maxIndex = timestamps.length - 1;
    const percent = sliderIndex / maxIndex;
    const left = percent * containerWidth;
    setThumbLeft(left);
  }, [sliderIndex, timestamps]);

  const onChange = (index) => {
    setSliderIndex(index);
    setValue(timestamps[index]);
  };

  if (timestamps.length === 0) return null;

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
          <Label>{formatTimestamp(timestamps[sliderIndex])}</Label>
        </div>
        <div style={{ top: 0 }}>
          <Slider
            min={0}
            max={timestamps.length - 1}
            step={1}
            value={sliderIndex}
            onChange={onChange}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 0,
          fontSize: 12,
          color: "#ccc",
        }}
      ></div>
    </>
  );
}
