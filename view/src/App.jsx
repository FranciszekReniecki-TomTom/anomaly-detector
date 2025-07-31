import { useState, useMemo, useEffect } from "react";
import "./App.css";
import { GlMap, Layers, MapMenuToggle } from "legoland-shared";
import { Box, Label, Slider } from "tombac";
import { TombacApp } from "tombac";

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

function AnomalyDots({
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

function App() {
  const ONE_HOUR_MS = 3600000;
  const [mapModel, setMapModel] = useState("Orbis");
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

  const formatTimestamp = (ts) => new Date(ts).toLocaleString();

  if (!anomalyGeoJson) return <div>Loading anomalies...</div>;

  return (
    <TombacApp
      defineCssVariables
      theme={{ baseUnit: "px", settings: { modalZIndex: 20 } }}
    >
      <Box style={containerStyle}>
        <Box style={sidebarStyle}>
          <h3>Anomaly Report</h3>

          <Label style={{ display: "block", marginBottom: 8 }}>
            Filter by anomaly:
          </Label>
          <div style={{ marginBottom: 16, maxHeight: 300, overflowY: "auto" }}>
            <label>
              <input
                type="checkbox"
                checked={selectedAnomalies.has("all")}
                onChange={() => toggleAnomaly("all")}
              />
              <strong>All</strong>
            </label>

            {anomalyIds.map((id) => {
              const timestampsForId = anomalyGeoJson.features
                .filter((f) => f.properties.anomaly_id === id)
                .map((f) => f.properties.timestamp)
                .sort();

              return (
                <div
                  key={id}
                  style={{
                    marginLeft: 12,
                    marginBottom: 8,
                    userSelect: "none",
                  }}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedAnomalies.has(id)}
                      onChange={() => toggleAnomaly(id)}
                    />
                    {id}
                  </label>
                  <ul
                    style={{
                      marginTop: 4,
                      marginLeft: 20,
                      fontSize: 12,
                      maxHeight: 100,
                      overflowY: "auto",
                    }}
                  >
                    {timestampsForId.map((ts, i) => (
                      <li key={i}>{new Date(ts).toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <Label style={{ display: "block", marginBottom: 18 }}>
            Time range:
          </Label>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div>{formatTimestamp(minTime)}</div>
            <div>{formatTimestamp(range[0])}</div>
            <div>{formatTimestamp(maxTime)}</div>
          </div>
          <Slider
            min={minTime}
            max={maxTime}
            step={ONE_HOUR_MS}
            value={range[0]}
            onChange={(val) => setRange([Math.min(val, range[1]), range[1]])}
            style={{ width: "100%", marginBottom: 4 }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div>{formatTimestamp(minTime)}</div>
            <div>{formatTimestamp(range[1])}</div>
            <div>{formatTimestamp(maxTime)}</div>
          </div>
          <Slider
            min={minTime}
            max={maxTime}
            step={ONE_HOUR_MS}
            value={range[1]}
            onChange={(val) => setRange([range[0], Math.max(val, range[0])])}
            style={{ width: "100%", marginBottom: 12 }}
          />

          <AnomalyDots
            timestamps={timestamps}
            minTime={minTime}
            maxTime={maxTime}
            width={280}
            height={30}
          />

          <div>
            {filteredFeatures.map((f, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <strong>{f.properties.anomaly_id}</strong> <br />
                {f.properties.timestamp}
              </div>
            ))}
          </div>
        </Box>

        <Box style={{ flex: 1, position: "relative" }}>
          <GlMap
            mapModel={mapModel}
            apiKey="1ncwaIygtJ0KrjH5ssohlEKUGFf7G5Dv"
            createMapOptions={{ center: [15, 15], zoom: 3 }}
            hideNavigationControls={false}
            controlLocation="top-right"
            map
            mapControlsProps={{
              shouldCloseOnInteractOutside: () => true,
              mapLayersMenuContent: (
                <MapMenuToggle
                  label="Orbis"
                  checked={mapModel === "Orbis"}
                  onChange={() =>
                    setMapModel((prev) =>
                      prev === "Genesis" ? "Orbis" : "Genesis"
                    )
                  }
                />
              ),
              styleOptions: [
                "Street light",
                "Street dark",
                "Mono light",
                "Mono dark",
                "Satellite",
              ],
            }}
          >
            <Layers
              sourceId="anomalies"
              layers={[
                {
                  id: "anomalies",
                  type: "fill",
                  paint: { "fill-color": "#cc0000", "fill-opacity": 0.4 },
                },
              ]}
              data={{ type: "FeatureCollection", features: filteredFeatures }}
            />
          </GlMap>
        </Box>
      </Box>
    </TombacApp>
  );
}

export default App;
