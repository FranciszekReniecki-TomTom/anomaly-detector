import { useState, useEffect, useRef, useMemo } from "react";

export default function AnomalyDots({
  timestamps,
  minTime,
  maxTime,
  selectedTime,
  baseLaneHeight,
  padding,
}) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    }
    updateWidth();

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

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

  if (width === 0) {
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

              width: 5,
              height: 5,
              borderRadius: "100%",
              backgroundColor: "#de1c12",
              cursor: "default",
            }}
          />
        );
      })}
    </div>
  );
}
