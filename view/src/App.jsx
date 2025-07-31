import { useState, Suspense } from "react";
import "./App.css";
import {
  DrawingLayers,
  DrawingOption,
  DrawingTools,
  GlMap,
  Layers,
  MapMenuToggle,
} from "legoland-shared";
import { Button } from "tombac";
import { TombacApp } from "tombac";
import { setAppElement } from "react-modal";

function App() {
  const [count, setCount] = useState(0);
  const [mapModel, setMapModel] = useState("Orbis");
  const [drawingOption, setDrawingOption] = useState();
  const [regions, setRegions] = useState([]);

  const layers = [
    {
      id: "regions",
      type: "fill",
      paint: {
        "fill-color": "green",
        "fill-outline-color": "green",
        "fill-opacity": 0.4,
      },
    },
  ];

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
            mapOverlayElements={
              <DrawingTools
                $position="absolute"
                $left="0"
                $top="0"
                $margin="15px"
                drawingOption={drawingOption}
                onDrawingOptionChange={setDrawingOption}
              />
            }
            createMapOptions={{ center: [0, 0], zoom: 1 }}
            hideNavigationControls={false}
            controlLocation="top-right"
            map
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
          >
            <Layers sourceId="regiosn" layers={layers} data={regions} />
            <DrawingLayers
              drawingOption={drawingOption}
              units="KM"
              regions={regions}
              onAddRegions={(newRegions) => setRegions((prev) => prev.concat(newRegions))}
            />
          </GlMap>
        </div>
      </TombacApp>
    </>
  );
}

export default App;
