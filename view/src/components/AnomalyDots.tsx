import React from "react";
import {
  useContainerWidth,
  useAnomalyIds,
  useLeftPercent,
} from "../hooks/useAnomalyDots";

export interface AnomalyDotTimestamp {
  time: number;
  anomaly_id: string;
}

export interface AnomalyDotsProps {
  timestamps: AnomalyDotTimestamp[];
  minTime: number;
  maxTime: number;
  selectedTime: number;
  baseLaneHeight: number;
  padding: number;
}

export default function AnomalyDots({
  timestamps,
  minTime,
  maxTime,
  selectedTime,
  baseLaneHeight,
  padding,
}: AnomalyDotsProps) {
  const [containerRef, width] = useContainerWidth();
  const anomalyIds = useAnomalyIds(timestamps);
  const getLeftPercentRaw = useLeftPercent(minTime, maxTime);

  const height = anomalyIds.length * baseLaneHeight;

  const getLeftPercent = (time: number) =>
    getLeftPercentRaw(time) * (1 - (padding * 2) / width) +
    (padding / width) * 100;

  if (!width || timestamps.length === 0) {
    return <div ref={containerRef} style={{ width: "100%" }} />;
  }

  const generateTimeGridLines = () => {
    const gridLines: React.ReactElement[] = [];
    const totalDuration = maxTime - minTime;
    const timeStep = totalDuration / 10;

    for (let i = 0; i <= 10; i++) {
      const time = minTime + timeStep * i;
      const leftPercent = getLeftPercent(time);

      gridLines.push(
        <div
          key={`vgrid-${i}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${leftPercent}%`,
            width: 1,
            backgroundColor: "#e0e0e0",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      );
    }
    return gridLines;
  };

  const generateLaneGridLines = () => {
    const gridLines: React.ReactElement[] = [];

    for (let i = 0; i < anomalyIds.length; i++) {
      const topPos = baseLaneHeight * i;

      gridLines.push(
        <div
          key={`hgrid-${i}`}
          style={{
            position: "absolute",
            top: topPos,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "#e0e0e0",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      );
    }

    gridLines.push(
      <div
        key="hgrid-bottom"
        style={{
          position: "absolute",
          top: height,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: "#e0e0e0",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
    );

    return gridLines;
  };

  const generateDateLabels = () => {
    const labels: React.ReactElement[] = [];
    const totalDuration = maxTime - minTime;
    const timeStep = totalDuration / 10;

    for (let i = 0; i <= 10; i++) {
      const time = minTime + timeStep * i;
      const leftPercent = getLeftPercent(time);
      const date = new Date(time);

      const dateLabel = date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      const timeLabel = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      labels.push(
        <div
          key={`date-${i}`}
          style={{
            position: "absolute",
            left: `${leftPercent}%`,
            bottom: -35,
            transform: "translateX(-50%)",
            fontSize: 9,
            color: "#666",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 2,
            textAlign: "center",
            lineHeight: "1.2",
          }}
        >
          <div>{dateLabel}</div>
          <div>{timeLabel}</div>
        </div>
      );
    }
    return labels;
  };

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", position: "relative", height, paddingBottom: 40 }}
    >
      {generateTimeGridLines()}
      {generateLaneGridLines()}

      {generateDateLabels()}

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
              zIndex: 100,
            }}
          />
        );
      })}
    </div>
  );
}
