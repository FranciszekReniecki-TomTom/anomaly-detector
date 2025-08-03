import { useState, useEffect } from "react";
import { TombacApp, Button } from "tombac";
import AnomalyList from "./components/AnomalyList";
import MapView from "./components/MapView";
import BottomBar from "./components/BottomBar";
import { AppProvider, useAppContext } from "./AppContext";

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

function addMonths(dateString, months) {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 16);
}

function subtractMonths(dateString, months) {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 16);
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

  const [startDay, setStartDay] = useState("2025-01-01T00:00");
  const [endDay, setEndDay] = useState("2025-02-01T00:00");

  useEffect(() => {
    const minEnd = addMonths(startDay, 1);
    if (endDay < minEnd) setEndDay(minEnd);
  }, [startDay]);

  useEffect(() => {
    const minStart = subtractMonths(endDay, 1);
    if (startDay > minStart) setStartDay(minStart);
  }, [endDay]);

  if (!anomalyGeoJson) return <div>Loading anomalies...</div>;

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
                <label>
                  Start Day:
                  <input
                    type="datetime-local"
                    value={startDay}
                    onChange={(e) => setStartDay(e.target.value)}
                    max={subtractMonths(endDay, 0)}
                  />
                </label>
                <label style={{ marginLeft: 12 }}>
                  End Day:
                  <input
                    type="datetime-local"
                    value={endDay}
                    onChange={(e) => setEndDay(e.target.value)}
                    min={addMonths(startDay, 1)}
                  />
                </label>
                <Button
                  onClick={() => setMode("viewing")}
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
