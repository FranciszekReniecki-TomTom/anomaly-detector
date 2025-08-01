import { Label, Slider } from "tombac";
import { useState, useEffect } from "react";

export default function TimeSlider({ timestamps, value, setValue }) {
  const formatTimestamp = (ts) => new Date(ts).toLocaleString();

  const [sliderIndex, setSliderIndex] = useState(0);

  useEffect(() => {
    const index = timestamps.indexOf(value);
    setSliderIndex(index === -1 ? 0 : index);
  }, [value, timestamps]);

  const onChange = (index) => {
    setSliderIndex(index);
    setValue(timestamps[index]);
  };

  if (timestamps.length === 0) return null;

  return (
    <>
      <Label style={{ display: "block", marginBottom: 18 }}>Select time:</Label>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div>{formatTimestamp(timestamps[0])}</div>
        <div>{formatTimestamp(timestamps[sliderIndex])}</div>
        <div>{formatTimestamp(timestamps[timestamps.length - 1])}</div>
      </div>
      <Slider
        min={0}
        max={timestamps.length - 1}
        step={1}
        value={sliderIndex}
        onChange={onChange}
        style={{ width: "100%", marginBottom: 12 }}
      />
    </>
  );
}
