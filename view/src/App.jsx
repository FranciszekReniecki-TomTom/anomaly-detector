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

  if (!anomalyGeoJson) return <div>Loading anomalies...</div>;

  return (
    <TombacApp
      defineCssVariables
      theme={{ baseUnit: "px", settings: { modalZIndex: 20 } }}
    >
      <div style={containerStyle}>
        {(mode === "viewing" || mode === "drawing") && (
          <aside style={sidebarStyle}>
            {mode === "viewing" ? (
              <>
                <AnomalyList />
                <Button
                  onClick={() => setMode("drawing")}
                  style={{ marginTop: 16 }}
                >
                  Back to Drawing
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setMode("viewing")}
                style={{ marginTop: 16 }}
              >
                Generate Report
              </Button>
            )}
          </aside>
        )}

        <main style={{ flex: 1, position: "relative" }}>
          <MapView
            filteredFeatures={filteredFeatures}
            drawingEnabled={mode === "drawing"}
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
