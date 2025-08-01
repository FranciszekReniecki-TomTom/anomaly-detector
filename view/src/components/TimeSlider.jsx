import { Label, Slider } from "tombac";
import { useAppContext } from "../AppContext";
import {
  useContainerWidth,
  useSliderValue,
  useThumbLeft,
  useSnapToNearest,
} from "../hooks/useTimeSlider";

export default function TimeSlider() {
  const { timestampValues, selectedTime, setSelectedTime } = useAppContext();

  if (timestampValues.length === 0) return null;

  const times = timestampValues.map((t) => new Date(t).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  const [containerRef, containerWidth] = useContainerWidth();
  const [sliderValue, setSliderValue] = useSliderValue(selectedTime);
  const thumbLeft = useThumbLeft(sliderValue, minTime, maxTime, containerWidth);
  const snapToNearest = useSnapToNearest(times);

  const formatTimestamp = (ts) => new Date(ts).toLocaleString();

  const onSliderChange = (t) => {
    const snapped = snapToNearest(t);
    setSliderValue(snapped);
    setSelectedTime(snapped);
  };

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
