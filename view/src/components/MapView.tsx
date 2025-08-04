import {
  DrawingOption,
  DrawingTools,
  GlMap,
  Layers,
  MapMenuToggle,
  PolygonSelector,
} from "legoland-shared";
import { useMapView } from "../hooks/useMapView";

export interface MapViewProps {
  filteredFeatures: any[];
  drawingEnabled: boolean;
  onPolygonSelect?: (feature: any) => void;
}

export default function MapView({
  filteredFeatures,
  drawingEnabled,
  onPolygonSelect,
}: MapViewProps) {
  const {
    mapModel,
    setMapModel,
    drawingOption,
    setDrawingOption,
    regions,
    handleSelect,
    anomalyLayer,
    regionLayer,
  } = useMapView(filteredFeatures);

  function handlePolygonSelect(features: any[]) {
    if (features && features.length > 0) {
      handleSelect(features[0]);
      if (onPolygonSelect) onPolygonSelect(features[0]);
    }
  }

  return (
    <GlMap
      mapModel={mapModel}
      apiKey="1ncwaIygtJ0KrjH5ssohlEKUGFf7G5Dv"
      createMapOptions={{ center: [15, 15], zoom: 3 }}
      hideNavigationControls={false}
      controlLocation="top-right"
      mapOverlayElements={
        drawingEnabled && (
          <DrawingTools
            $position="absolute"
            $left="0"
            $top="0"
            $margin="15px"
            enabledDrawingOptions={[DrawingOption.POLYGON]}
            drawingOption={drawingOption}
            onDrawingOptionChange={setDrawingOption}
          />
        )
      }
      mapControlsProps={{
        shouldCloseOnInteractOutside: () => true,
        mapLayersMenuContent: (
          <MapMenuToggle
            label="Orbis"
            checked={mapModel === "Orbis"}
            onChange={() =>
              setMapModel((prev: string) => (prev === "Genesis" ? "Orbis" : "Genesis"))
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
      {!drawingEnabled && (
        <Layers
          sourceId="anomalies"
          layers={[anomalyLayer]}
          data={{ type: "FeatureCollection", features: filteredFeatures }}
        />
      )}
      <Layers sourceId="regions" layers={[regionLayer]} data={regions} />
      {drawingEnabled && drawingOption === DrawingOption.POLYGON && (
        <PolygonSelector onSelect={handlePolygonSelect} />
      )}
    </GlMap>
  );
}
