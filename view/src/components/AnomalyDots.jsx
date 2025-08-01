import { useMemo } from "react";

const anomalyDotsWrapperStyle = (width, height) => ({
  position: "relative",
  width,
  height,
  display: "flex",
  marginBottom: 16,
});

const labelsColumnStyle = (labelWidth, height) => ({
  width: labelWidth,
  height,
  boxSizing: "border-box",
  paddingRight: 4,
  fontSize: 10,
  lineHeight: 1,
  color: "#333",
  overflow: "hidden",
});

const anomalyDotsContainerStyle = (width, height, padding) => ({
  position: "relative",
  width,
  height,
  background: "#eee",
  borderRadius: 6,
  border: "1px solid #ccc",
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
  const labelWidth = 40;

  const anomalyIds = useMemo(
    () => [...new Set(timestamps.map((t) => t.anomaly_id))],
    [timestamps]
  );
  const laneCount = anomalyIds.length;
  const height = laneCount * baseLaneHeight;
  const totalDuration = maxTime - minTime;

  const getLeftPercent = (time) =>
    ((time - minTime) / totalDuration) * (100 - (padding * 2 * 100) / width) +
    (padding * 100) / width;

  const selectedLeft = getLeftPercent(selectedTime);

  return (
    <div style={anomalyDotsWrapperStyle(width + labelWidth, height)}>
      <div style={labelsColumnStyle(labelWidth, height)}>
        {anomalyIds.map((id, i) => (
          <div
            key={id}
            style={{
              height: baseLaneHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 4,
            }}
          >
            {id}
          </div>
        ))}
      </div>

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
                backgroundColor: "#de1c12",
                cursor: "default",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
