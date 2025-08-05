import { useState } from "react";
import { TombacApp } from "tombac";
import MapView from "./components/MapView";
import BottomBar from "./components/BottomBar";
import Sidebar from "./components/Sidebar";
import { AppProvider, useAppContext } from "./AppContext";

const containerStyle = {
  display: "flex",
  height: "100vh",
  width: "100vw",
  margin: 0,
  padding: 0,
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

function AppContent() {
  const { mode, anomalyGeoJson, filteredFeatures } = useAppContext();

  const [selectedPolygon, setSelectedPolygon] = useState<any>(null);

  return (
    <TombacApp
      defineCssVariables
      theme={{ baseUnit: "px", settings: { modalZIndex: 20 } }}
    >
      <div style={containerStyle}>
        <Sidebar selectedPolygon={selectedPolygon} />

        <main style={{ flex: 1, position: "relative" }}>
          <MapView
            filteredFeatures={filteredFeatures}
            drawingEnabled={mode === "drawing"}
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
