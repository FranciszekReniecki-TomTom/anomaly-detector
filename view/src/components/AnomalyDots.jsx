import { useMemo } from "react";

const anomalyDotsContainerStyle = (width, height, padding) => ({
  position: "relative",
  width,
  height,
  background: "#eee",
  borderRadius: 6,
  border: "1px solid #ccc",
  marginBottom: 16,
  paddingLeft: padding,
  paddingRight: padding,
  boxSizing: "border-box",
});

export default function AnomalyDots({
  timestamps,
  minTime,
  maxTime,
  selectedTime,
  width = 250,
  baseLaneHeight = 8,
  padding = 0,
}) {
  const anomalyIds = useMemo(
    () => [...new Set(timestamps.map((t) => t.anomaly_id))],
    [timestamps]
  );
  const laneCount = anomalyIds.length;
  const height = laneCount * baseLaneHeight;
  const totalDuration = maxTime - minTime;

  const getColor = (index) =>
    `hsl(${(index * 360) / anomalyIds.length}, 70%, 50%)`;

  const getLeftPercent = (time) =>
    ((time - minTime) / totalDuration) *
      (100 - (padding * 2 * 100) / width) +
    (padding * 100) / width;

  const selectedLeft = getLeftPercent(selectedTime);

  return (
    <div style={anomalyDotsContainerStyle(width, height, padding)}>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${selectedLeft}%`,
          width: 1,
          backgroundColor: "#000",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />
      {timestamps.map(({ time, anomaly_id }, i) => {
        const laneIndex = anomalyIds.indexOf(anomaly_id);
        const laneCenter = baseLaneHeight * laneIndex + baseLaneHeight / 2;
        const leftPercent = getLeftPercent(time);

        return (
          <div
            key={i}
            title={`${anomaly_id} - ${new Date(time).toLocaleString()}`}
            style={{
              position: "absolute",
              left: `${leftPercent}%`,
              top: laneCenter,
              transform: "translate(-50%, -50%)",
              width: 2,
              height: 5,
              borderRadius: "50%",
              backgroundColor: getColor(laneIndex),
              cursor: "default",
            }}
          />
        );
      })}
    </div>
  );
}
