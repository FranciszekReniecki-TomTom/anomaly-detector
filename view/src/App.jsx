import { useState, useMemo, useEffect } from "react";
import "./App.css";
import { Box, TombacApp } from "tombac";

import AnomalyFilter from "./components/AnomalyFilter";
import TimeRangeSlider from "./components/TimeRangeSlider";
import AnomalyDots from "./components/AnomalyDots";
import AnomalyList from "./components/AnomalyList";
import MapView from "./components/MapView";

const containerStyle = {
  display: "flex",
  height: "100vh",
  width: "100vw",
  margin: 0,
  padding: 0,
};

const sidebarStyle = {
  width: 280,
  borderRight: "1px solid #ccc",
  padding: 16,
  boxSizing: "border-box",
  overflowY: "auto",
};

function App() {
  const ONE_HOUR_MS = 3600000;
  const [selectedAnomalies, setSelectedAnomalies] = useState(new Set(["all"]));
  const [anomalyGeoJson, setAnomalyGeoJson] = useState(null);
  const [range, setRange] = useState([0, 0]);

  useEffect(() => {
    fetch("/.env/anomalies.json")
      .then((res) => res.json())
      .then(setAnomalyGeoJson)
      .catch(console.error);
  }, []);

  const timestamps = useMemo(() => {
    if (!anomalyGeoJson) return [];
    return anomalyGeoJson.features
      .map((f) => ({
        time: new Date(f.properties.timestamp).getTime(),
        anomaly_id: f.properties.anomaly_id,
      }))
      .sort((a, b) => a.time - b.time);
  }, [anomalyGeoJson]);

  const minTime = timestamps.length ? timestamps[0].time : 0;
  const maxTime = timestamps.length
    ? timestamps[timestamps.length - 1].time
    : 0;

  useEffect(() => {
    setRange([minTime, maxTime]);
  }, [minTime, maxTime]);

  const anomalyIds = useMemo(() => {
    if (!anomalyGeoJson) return [];
    return [
      ...new Set(anomalyGeoJson.features.map((f) => f.properties.anomaly_id)),
    ];
  }, [anomalyGeoJson]);

  const toggleAnomaly = (id) => {
    setSelectedAnomalies((prev) => {
      if (id === "all") return new Set(["all"]);

      const newSet = new Set(prev);
      newSet.delete("all");

      if (newSet.has(id)) {
        newSet.delete(id);
        if (newSet.size === 0) newSet.add("all");
      } else {
        newSet.add(id);
      }

      return newSet;
    });
  };

  const filteredFeatures = useMemo(() => {
    if (!anomalyGeoJson) return [];
    return anomalyGeoJson.features.filter((f) => {
      const ts = new Date(f.properties.timestamp).getTime();
      const withinRange = ts >= range[0] && ts <= range[1];
      const matchesAnomaly =
        selectedAnomalies.has("all") ||
        selectedAnomalies.has(f.properties.anomaly_id);
      return withinRange && matchesAnomaly;
    });
  }, [range, selectedAnomalies, anomalyGeoJson]);

  if (!anomalyGeoJson) return <div>Loading anomalies...</div>;

  return (
    <TombacApp
      defineCssVariables
      theme={{ baseUnit: "px", settings: { modalZIndex: 20 } }}
    >
      <Box style={containerStyle}>
        <Box style={sidebarStyle}>
          <AnomalyFilter
            anomalyIds={anomalyIds}
            anomalyGeoJson={anomalyGeoJson}
            selectedAnomalies={selectedAnomalies}
            toggleAnomaly={toggleAnomaly}
          />

          <TimeRangeSlider
            minTime={minTime}
            maxTime={maxTime}
            range={range}
            setRange={setRange}
            step={ONE_HOUR_MS}
          />

          <AnomalyDots
            timestamps={timestamps}
            minTime={minTime}
            maxTime={maxTime}
            width={280}
            height={30}
          />

          <AnomalyList filteredFeatures={filteredFeatures} />
        </Box>

        <Box style={{ flex: 1, position: "relative" }}>
          <MapView filteredFeatures={filteredFeatures} />
        </Box>
      </Box>
    </TombacApp>
  );
}

export default App;
