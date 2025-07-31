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
  width = 280,
  baseLaneHeight = 20,
  padding = 12,
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

  return (
    <div style={anomalyDotsContainerStyle(width, height, padding)}>
      {timestamps.map(({ time, anomaly_id }, i) => {
        const laneIndex = anomalyIds.indexOf(anomaly_id);
        const laneCenter = baseLaneHeight * laneIndex + baseLaneHeight / 2;

        const leftPercent =
          ((time - minTime) / totalDuration) *
            (100 - (padding * 2 * 100) / width) +
          (padding * 100) / width;

        return (
          <div
            key={i}
            title={`${anomaly_id} - ${new Date(time).toLocaleString()}`}
            style={{
              position: "absolute",
              left: `${leftPercent}%`,
              top: laneCenter,
              transform: "translate(-50%, -50%)",
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: getColor(laneIndex),
              border: "1.5px solid #00000050",
              cursor: "default",
            }}
          />
        );
      })}
    </div>
  );
}
