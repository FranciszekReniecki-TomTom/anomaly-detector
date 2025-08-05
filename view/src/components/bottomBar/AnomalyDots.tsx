import React from "react";
import { Box, Text } from "tombac";
import { useContainerWidth, useLeftPercent } from "../../hooks/useAnomalyDots";
import { useAppContext } from "../../AppContext";

export interface AnomalyDotTimestamp {
  time: number;
  anomaly_id: string;
}

export interface AnomalyDotsProps {
  baseLaneHeight: number;
  padding: number;
}

export default function AnomalyDots({
  baseLaneHeight,
  padding,
}: AnomalyDotsProps) {
  const [containerRef, width] = useContainerWidth();
  const {
    anomalyIds,
    timestamps,
    timestampValues,
    selectedTime,
    selectedAnomalies,
  } = useAppContext();

  const minTime = timestampValues[0];
  const maxTime = timestampValues[timestampValues.length - 1];
  const getLeftPercentRaw = useLeftPercent(minTime, maxTime);

  const height = anomalyIds.length * baseLaneHeight;

  const getLeftPercent = (time: number) =>
    getLeftPercentRaw(time) * (1 - (padding * 2) / width) +
    (padding / width) * 100;

  if (!width || timestamps.length === 0) {
    return <Box ref={containerRef} style={{ width: "100%" }} />;
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
          <Box
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

  const generateAnomalyLabels = () => {
    const labels: React.ReactElement[] = [];

    anomalyIds.forEach((anomalyId, index) => {
      const laneIndex = index;
      const topPos = baseLaneHeight * laneIndex + baseLaneHeight / 2;

      const isSelected =
        selectedAnomalies.has("all") || selectedAnomalies.has(anomalyId);
      const labelColor = isSelected ? "#de1c12" : "#666";

      labels.push(
        <Box
          key={`label-${anomalyId}`}
          style={{
            position: "absolute",
            left: -5,
            top: topPos,
            transform: "translate(-100%, -50%)",
            fontWeight: isSelected ? "600" : "400",
            color: labelColor,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10,
            textAlign: "right",
            paddingRight: 8,
          }}
        >
          <Text style={{ fontSize: 9 }}>{anomalyId}</Text>
        </Box>
      );
    });

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
          <Box
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
    <Box
      ref={containerRef}
      style={{ width: "100%", position: "relative", height, paddingBottom: 10 }}
    >
      {generateTimeGridLines()}

      {generateAnomalyLabels()}

      {generateConnectingLines()}

      <Box
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
          <Box
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
    </Box>
  );
}
