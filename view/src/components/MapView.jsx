import { useState } from "react";
import { GlMap, Layers, MapMenuToggle } from "legoland-shared";

export default function MapView({ filteredFeatures }) {
  const [mapModel, setMapModel] = useState("Orbis");

  return (
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
    </GlMap>
  );
}
