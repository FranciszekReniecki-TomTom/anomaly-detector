import { Label, Slider } from "tombac";

export default function TimeRangeSlider({
  minTime,
  maxTime,
  range,
  setRange,
  step,
}) {
  const formatTimestamp = (ts) => new Date(ts).toLocaleString();

  return (
    <>
      <Label style={{ display: "block", marginBottom: 18 }}>Time range:</Label>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div>{formatTimestamp(minTime)}</div>
        <div>{formatTimestamp(range[0])}</div>
        <div>{formatTimestamp(maxTime)}</div>
      </div>
      <Slider
        min={minTime}
        max={maxTime}
        step={step}
        value={range[0]}
        onChange={(val) => setRange([Math.min(val, range[1]), range[1]])}
        style={{ width: "100%", marginBottom: 4 }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div>{formatTimestamp(minTime)}</div>
        <div>{formatTimestamp(range[1])}</div>
        <div>{formatTimestamp(maxTime)}</div>
      </div>
      <Slider
        min={minTime}
        max={maxTime}
        step={step}
        value={range[1]}
        onChange={(val) => setRange([range[0], Math.max(val, range[0])])}
        style={{ width: "100%", marginBottom: 12 }}
      />
    </>
  );
}
