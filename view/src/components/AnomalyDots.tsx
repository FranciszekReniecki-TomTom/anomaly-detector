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
  selectedAnomalies: Set<string>;
}

export default function AnomalyDots({
  timestamps,
  minTime,
  maxTime,
  selectedTime,
  baseLaneHeight,
  padding,
  selectedAnomalies,
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

    const startHour = new Date(minTime);
    startHour.setMinutes(0, 0, 0);
    const endHour = new Date(maxTime);
    endHour.setMinutes(59, 59, 999);

    const currentHour = new Date(startHour);
    let index = 0;

    while (currentHour <= endHour) {
      const hourTime = currentHour.getTime();
      if (hourTime >= minTime && hourTime <= maxTime) {
        const leftPercent = getLeftPercent(hourTime);

        gridLines.push(
          <div
            key={`vgrid-${index}`}
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

      currentHour.setHours(currentHour.getHours() + 1);
      index++;
    }

    return gridLines;
  };

  const generateDateLabels = () => {
    const labels: React.ReactElement[] = [];

    const startHour = new Date(minTime);
    startHour.setMinutes(0, 0, 0);
    const endHour = new Date(maxTime);
    endHour.setMinutes(59, 59, 999);

    const currentHour = new Date(startHour);
    let index = 0;

    while (currentHour <= endHour) {
      const hourTime = currentHour.getTime();
      if (hourTime >= minTime && hourTime <= maxTime) {
        const leftPercent = getLeftPercent(hourTime);
        const date = new Date(hourTime);

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
            key={`date-${index}`}
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

      currentHour.setHours(currentHour.getHours() + 1);
      index++;
    }

    return labels;
  };

  const generateConnectingLines = () => {
    const lines: React.ReactElement[] = [];

    anomalyIds.forEach((anomalyId) => {
      const anomalyTimestamps = timestamps
        .filter((t) => t.anomaly_id === anomalyId)
        .sort((a, b) => a.time - b.time);

      if (anomalyTimestamps.length < 2) return;

      const isSelected =
        selectedAnomalies.has("all") || selectedAnomalies.has(anomalyId);
      const lineColor = isSelected ? "#de1c12" : "#ccc";
      const laneIndex = anomalyIds.indexOf(anomalyId);
      const topPos = baseLaneHeight * laneIndex + baseLaneHeight / 2;

      for (let i = 0; i < anomalyTimestamps.length - 1; i++) {
        const currentTime = anomalyTimestamps[i].time;
        const nextTime = anomalyTimestamps[i + 1].time;

        const startPercent = getLeftPercent(currentTime);
        const endPercent = getLeftPercent(nextTime);
        const width = endPercent - startPercent;

        lines.push(
          <div
            key={`line-${anomalyId}-${i}`}
            style={{
              position: "absolute",
              left: `${startPercent}%`,
              top: topPos - 0.5,
              width: `${width}%`,
              height: 1,
              backgroundColor: lineColor,
              pointerEvents: "none",
              zIndex: 50,
            }}
          />
        );
      }
    });

    return lines;
  };

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", position: "relative", height, paddingBottom: 40 }}
    >
      {generateTimeGridLines()}

      {generateDateLabels()}

      {generateConnectingLines()}

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

        const isSelected =
          selectedAnomalies.has("all") || selectedAnomalies.has(anomaly_id);
        const dotColor = isSelected ? "#de1c12" : "#ccc";

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
              backgroundColor: dotColor,
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
