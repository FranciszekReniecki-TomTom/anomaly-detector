import { useState, useMemo, useEffect } from "react";
import "./App.css";
import {
  DrawingLayers,
  DrawingOption,
  DrawingTools,
  GlMap,
  Layers,
  MapMenuToggle,
} from "legoland-shared";
import { Box, Button, Input, Label, Select, Slider } from "tombac";
import { TombacApp } from "tombac";

function AnomalyDots({
  timestamps,
  minTime,
  maxTime,
  width = 280,
  baseLaneHeight = 20,
  padding = 12,
}) {
  const anomalyIds = [...new Set(timestamps.map((t) => t.anomaly_id))];
  const laneCount = anomalyIds.length;
  const height = laneCount * baseLaneHeight;
  const totalDuration = maxTime - minTime;

  const getColor = (index) => {
    const hue = (index * 360) / anomalyIds.length;
    return `hsl(${hue}, 70%, 50%)`;
  };

  return (
    <div
      style={{
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
      }}
    >
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
  const [drawingOption, setDrawingOption] = useState();
  const [regions, setRegions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState("all");
  const [anomalyGeoJson, setAnomalyGeoJson] = useState(null);

  useEffect(() => {
    fetch("/.env/anomalies.json")
      .then((res) => res.json())
      .then((data) => setAnomalyGeoJson(data))
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

  const minTime = timestamps.length > 0 ? timestamps[0].time : 0;
  const maxTime =
    timestamps.length > 0 ? timestamps[timestamps.length - 1].time : 0;

  const [range, setRange] = useState([minTime, maxTime]);

  useEffect(() => {
    setRange([minTime, maxTime]);
  }, [minTime, maxTime]);

  const onChangeStart = (val) => {
    const newVal = Math.min(val, range[1]);
    setRange([newVal, range[1]]);
  };

  const onChangeEnd = (val) => {
    const newVal = Math.max(val, range[0]);
    setRange([range[0], newVal]);
  };

  const filteredFeatures = useMemo(() => {
    if (!anomalyGeoJson) return [];
    return anomalyGeoJson.features.filter((f) => {
      const ts = new Date(f.properties.timestamp).getTime();
      const matchTime = ts >= range[0] && ts <= range[1];
      const matchAnomaly =
        selectedAnomaly === "all" ||
        f.properties.anomaly_id === selectedAnomaly;
      return matchTime && matchAnomaly;
    });
  }, [range, selectedAnomaly, anomalyGeoJson]);

  const anomalyIds = anomalyGeoJson
    ? [...new Set(anomalyGeoJson.features.map((f) => f.properties.anomaly_id))]
    : [];

  function formatTimestamp(ts) {
    return new Date(ts).toLocaleString();
  }

  if (!anomalyGeoJson) {
    return <div>Loading anomalies...</div>;
  }

  return (
    <TombacApp
      defineCssVariables
      theme={{ baseUnit: "px", settings: { modalZIndex: 20 } }}
    >
      <Box
        style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          margin: 0,
          padding: 0,
        }}
      >
        <Box
          style={{
            width: "280px",
            borderRight: "1px solid #ccc",
            padding: 16,
            boxSizing: "border-box",
          }}
        >
          <h3>Anomaly Report</h3>

          <Label style={{ display: "block", marginBottom: 8 }}>
            Filter by anomaly:
          </Label>
          <Select
            value={selectedAnomaly}
            onChange={(e) => setSelectedAnomaly(e.target.value)}
            style={{ width: "100%", marginBottom: 16 }}
          >
            <option value="all">All</option>
            {anomalyIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </Select>

          <Label style={{ display: "block", marginBottom: 18 }}>
            Time range:
          </Label>
          <>
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
              onChange={onChangeStart}
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
              onChange={onChangeEnd}
              style={{ width: "100%", marginBottom: 12 }}
            />
          </>

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
            mapOverlayElements={null}
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
                  paint: {
                    "fill-color": "#cc0000",
                    "fill-opacity": 0.4,
                  },
                },
              ]}
              data={{
                type: "FeatureCollection",
                features: filteredFeatures,
              }}
            />
          </GlMap>
        </Box>
      </Box>
    </TombacApp>
  );
}

export default App;
