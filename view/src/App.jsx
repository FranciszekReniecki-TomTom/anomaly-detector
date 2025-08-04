import { useState, useEffect } from "react";
import { TombacApp, Button, DatePicker } from "tombac";
import AnomalyList from "./components/AnomalyList";
import MapView from "./components/MapView";
import BottomBar from "./components/BottomBar";
import { AppProvider, useAppContext } from "./AppContext";
import { fetchAnomalyData } from "./api/Api";

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
  overflowY: "auto",
};

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function subtractMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function AppContent() {
  const {
    mode,
    setMode,
    anomalyIds,
    anomalyGeoJson,
    selectedAnomalies,
    toggleAnomaly,
    filteredFeatures,
  } = useAppContext();

  const [startDay, setStartDay] = useState(new Date("2025-01-01T00:00"));
  const [endDay, setEndDay] = useState(new Date("2025-02-01T00:00"));
  const [selectedPolygon, setSelectedPolygon] = useState(null);

  useEffect(() => {
    const minEnd = addMonths(startDay, 1);
    if (endDay < minEnd) setEndDay(minEnd);
  }, [startDay]);

  useEffect(() => {
    const minStart = subtractMonths(endDay, 1);
    if (startDay > minStart) setStartDay(minStart);
  }, [endDay]);

  if (!anomalyGeoJson) return <div>Loading anomalies...</div>;

  const handleGenerateReport = async () => {
    if (!selectedPolygon) {
      alert("Please select a polygon to generate the report.");
      return;
    }
    try {
      await fetchAnomalyData({
        startDay: startDay.toISOString().slice(0, 19),
        endDay: endDay.toISOString().slice(0, 19),
        coordinates: selectedPolygon.geometry.coordinates[0],
        dataType: "TOTAL_DISTANCE_M",
      });
      setMode("viewing");
    } catch (error) {
      alert("Failed to generate report: " + error.message);
    }
  };

  return (
    <TombacApp
      defineCssVariables
      theme={{ baseUnit: "px", settings: { modalZIndex: 20 } }}
    >
      <div style={containerStyle}>
        {(mode === "viewing" || mode === "drawing") && (
          <aside style={sidebarStyle}>
            {mode === "drawing" && (
              <>
                <DatePicker
                  value={startDay}
                  onChange={(date) => setStartDay(date)}
                  maxDate={subtractMonths(endDay, 0)}
                />
                <DatePicker
                  value={endDay}
                  onChange={(date) => setEndDay(date)}
                  minDate={addMonths(startDay, 1)}
                />
                <Button
                  onClick={handleGenerateReport}
                  style={{ marginTop: 16 }}
                >
                  Generate Report
                </Button>
              </>
            )}
            {mode === "viewing" && (
              <>
                <AnomalyList />
                <Button
                  onClick={() => setMode("drawing")}
                  style={{ marginTop: 16 }}
                >
                  Back to Drawing
                </Button>
              </>
            )}
          </aside>
        )}

        <main style={{ flex: 1, position: "relative" }}>
          <MapView
            filteredFeatures={filteredFeatures}
            drawingEnabled={mode === "drawing"}
            startDay={startDay + ":00"}
            endDay={endDay + ":59"}
            onPolygonSelect={setSelectedPolygon}
          />
          {mode === "viewing" && <BottomBar />}
        </main>
      </div>
    </TombacApp>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
