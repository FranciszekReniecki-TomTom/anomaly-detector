import { useState, Suspense } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import { GlMap, MapMenuToggle } from "legoland-shared";
import { Button } from "tombac";
import { TombacApp } from "tombac";

function App() {
  const [count, setCount] = useState(0);
  const [mapModel, setMapModel] = useState("Genesis");
  const [mapStyleSettings, setMapStyleSettings] = useState({
    style: "Street dark",
    languageGenesis: "ngt",
    languageOrbis: "ngt",
    latin: true,
    basicPOI: true,
    buildings3D: false,
    driving: false,
  });

  return (
    <>
      <TombacApp
        defineCssVariables
        theme={{ baseUnit: "px", settings: { modalZIndex: 20 } }}
      >
        <Button>Click me</Button>
        <div style={{ height: "600px", width: "900px", position: "relative" }}>
          <GlMap
            mapModel={mapModel}
            apiKey="1ncwaIygtJ0KrjH5ssohlEKUGFf7G5Dv"
            createMapOptions={{ center: [0, 0], zoom: 1 }}
            hideNavigationControls={false}
            controlLocation="top-right"
            mapControlsProps={{
              shouldCloseOnInteractOutside: (el) => {
                return true;
              },
              mapLayersMenuContent: (
                <>
                  <MapMenuToggle
                    label="Orbis"
                    checked={mapModel === "Orbis"}
                    onChange={() => {
                      setMapModel((prev) =>
                        prev === "Genesis" ? "Orbis" : "Genesis"
                      );
                    }}
                  />
                </>
              ),
              styleOptions: [
                "Street light",
                "Street dark",
                "Mono light",
                "Mono dark",
                "Satellite",
              ],
            }}
          ></GlMap>
        </div>
      </TombacApp>
    </>
  );
}

export default App;
