import { TombacApp, Box } from "tombac";
import { useCallback, useMemo } from "react";
import MapView from "./components/MapView";
import BottomBar from "./components/bottomBar/BottomBar";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import NoDataModal from "./components/NoDataModal";
import { AppProvider, useAppContext } from "./AppContext";

function AppContent() {
  const {
    mode,
    setSelectedPolygon,
    setDrawnRegions,
    showNoDataModal,
    closeNoDataModal,
  } = useAppContext();

  const handlePolygonSelect = useCallback(
    (polygon: any) => {
      setSelectedPolygon(polygon);
      setDrawnRegions([polygon]);
    },
    [setSelectedPolygon, setDrawnRegions]
  );

  const containerStyle = useMemo(
    () => ({
      display: "flex",
      flexDirection: "column" as const,
      height: "100vh",
      width: "100vw",
      margin: 0,
      padding: 0,
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }),
    []
  );

  const contentStyle = useMemo(
    () => ({
      display: "flex",
      flex: 1,
      overflow: "hidden" as const,
    }),
    []
  );

  const mainStyle = useMemo(
    () => ({
      flex: 1,
      position: "relative" as const,
    }),
    []
  );

  return (
    <TombacApp
      defineCssVariables
      theme={{ baseUnit: "px", settings: { modalZIndex: 20 } }}
    >
      <Box style={containerStyle}>
        <TopBar />

        <Box style={contentStyle}>
          <Sidebar />

          <Box as="main" style={mainStyle}>
            <MapView
              drawingEnabled={mode === "drawing"}
              onPolygonSelect={handlePolygonSelect}
            />
            {mode === "viewing" && <BottomBar />}
          </Box>
        </Box>

        <NoDataModal isOpen={showNoDataModal} onClose={closeNoDataModal} />
      </Box>
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
