import { Label, Slider } from "tombac";
import { useAppContext } from "../AppContext";
import {
  useContainerWidth,
  useSliderValue,
  useSnapToNearest,
} from "../hooks/useTimeSlider";

export default function TimeSlider() {
  const { timestampValues, selectedTime, setSelectedTime } = useAppContext();

  if (timestampValues.length === 0) return null;

  const times = timestampValues.map((t: number) => new Date(t).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  const [containerRef, containerWidth] = useContainerWidth();
  const [sliderValue, setSliderValue] = useSliderValue(selectedTime);
  const snapToNearest = useSnapToNearest(times);

  const formatTimestamp = (ts: number) => new Date(ts).toLocaleString();

  const snappedSelectedTime = snapToNearest(selectedTime);

  const getThumbLeftPercent = (time: number) => {
    if (!containerWidth) return 0;
    const totalDuration = maxTime - minTime;
    const rawPercent = ((time - minTime) / totalDuration) * 100;
    const padding = 9;
    return (
      rawPercent * (1 - (padding * 2) / containerWidth) +
      (padding / containerWidth) * 100
    );
  };

  const thumbLeftPercent = getThumbLeftPercent(snappedSelectedTime);

  const onSliderChange = (t: number) => {
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
            left: `${thumbLeftPercent}%`,
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
          <Label>{formatTimestamp(snappedSelectedTime)}</Label>
        </div>
        <div style={{ top: 0 }}>
          <div style={{ width: "100%" }}>
            <Slider
              min={minTime}
              max={maxTime}
              step={1}
              value={sliderValue}
              onChange={onSliderChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}
