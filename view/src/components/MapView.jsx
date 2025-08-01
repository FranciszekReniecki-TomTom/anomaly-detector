import { useState } from "react";
import {
  DrawingLayers,
  DrawingOption,
  DrawingTools,
  GlMap,
  Layers,
  MapMenuToggle,
  PolygonSelector,
  useDrawingTools,
} from "legoland-shared";

export default function MapView({ filteredFeatures }) {
  const [mapModel, setMapModel] = useState("Orbis");
  const [drawingOption, setDrawingOption] = useState();
  const [regions, setRegions] = useState([]);

  const { handleSelect } = useDrawingTools(regions, (newRegions) =>
    setRegions(newRegions)
  );

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

  return (
    <GlMap
      mapModel={mapModel}
      apiKey="1ncwaIygtJ0KrjH5ssohlEKUGFf7G5Dv"
      createMapOptions={{ center: [15, 15], zoom: 3 }}
      hideNavigationControls={false}
      controlLocation="top-right"
      mapOverlayElements={
        <DrawingTools
          $position="absolute"
          $left="0"
          $top="0"
          $margin="15px"
          enabledDrawingOptions={[DrawingOption.POLYGON]}
          drawingOption={drawingOption}
          onDrawingOptionChange={setDrawingOption}
        />
      }
      mapControlsProps={{
        shouldCloseOnInteractOutside: () => true,
        mapLayersMenuContent: (
          <MapMenuToggle
            label="Orbis"
            checked={mapModel === "Orbis"}
            onChange={() =>
              setMapModel((prev) => (prev === "Genesis" ? "Orbis" : "Genesis"))
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
      <Layers sourceId="regions" layers={layers} data={regions} />

      {drawingOption === DrawingOption.POLYGON && (
        <PolygonSelector onSelect={handleSelect} />
      )}
    </GlMap>
  );
}
