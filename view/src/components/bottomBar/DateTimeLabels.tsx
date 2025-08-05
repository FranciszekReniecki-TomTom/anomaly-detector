import React from "react";
import { Box, Label, Text } from "tombac";
import { useContainerWidth, useLeftPercent } from "../../hooks/useAnomalyDots";

export interface DateTimeLabelsProps {
  minTime: number;
  maxTime: number;
  padding: number;
}

export default function DateTimeLabels({
  minTime,
  maxTime,
  padding,
}: DateTimeLabelsProps) {
  const [containerRef, width] = useContainerWidth();
  const getLeftPercentRaw = useLeftPercent(minTime, maxTime);

  const getLeftPercent = (time: number) =>
    getLeftPercentRaw(time) * (1 - (padding * 2) / width) +
    (padding / width) * 100;

  if (!width) {
    return <Box ref={containerRef} style={{ width: "100%" }} />;
  }

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
          <Box
            key={`date-${index}`}
            style={{
              position: "absolute",
              left: `${leftPercent}%`,
              top: 0,
              transform: "translateX(-50%)",
              color: "#666",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 2,
              textAlign: "center",
              lineHeight: "1.2",
              backgroundColor: "rgba(248, 248, 248, 0.9)",
              padding: "2px 4px",
              borderRadius: "2px",
            }}
          >
            <Text style={{ fontSize: 11 }}>{dateLabel}</Text>
            <Text style={{ fontSize: 11 }}>{timeLabel}</Text>
          </Box>
        );
      }

      currentHour.setHours(currentHour.getHours() + 1);
      index++;
    }

    return labels;
  };

  return (
    <Box
      ref={containerRef}
      style={{
        width: "100%",
        position: "relative",
        height: "35px",
        marginTop: "8px",
      }}
    >
      {generateDateLabels()}
    </Box>
  );
}
