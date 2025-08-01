import React from "react";
import {
  useContainerWidth,
  useAnomalyIds,
  useLeftPercent,
} from "../hooks/useAnomalyDots";

export default function AnomalyDots({
  timestamps,
  minTime,
  maxTime,
  selectedTime,
  baseLaneHeight,
  padding,
}) {
  const [containerRef, width] = useContainerWidth();
  const anomalyIds = useAnomalyIds(timestamps);
  const getLeftPercentRaw = useLeftPercent(minTime, maxTime);

  const height = anomalyIds.length * baseLaneHeight;

  const getLeftPercent = (time) =>
    getLeftPercentRaw(time) * (1 - (padding * 2) / width) +
    (padding / width) * 100;

  if (!width || timestamps.length === 0) {
    return <div ref={containerRef} style={{ width: "100%" }} />;
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", position: "relative", height }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${getLeftPercent(selectedTime)}%`,
          width: 2,
          backgroundColor: "#f0faff",
          pointerEvents: "none",
          borderRadius: 1,
          boxShadow: "0 0 4px 2px hsla(200, 100%, 68%, 0.6)",
          zIndex: 9999,
        }}
      />
      {timestamps.map(({ time, anomaly_id }, i) => {
        const laneIndex = anomalyIds.indexOf(anomaly_id);
        const leftPercent = getLeftPercent(time);
        const topPos = baseLaneHeight * laneIndex + baseLaneHeight / 2;

        return (
          <div
            key={i}
            title={`${anomaly_id} - ${new Date(time).toLocaleString()}`}
            style={{
              position: "absolute",
              left: `${leftPercent}%`,
              top: topPos,
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: "#de1c12",
              cursor: "default",
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
}
