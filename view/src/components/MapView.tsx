import React from "react";
import {
  DrawingOption,
  DrawingTools,
  GlMap,
  Layers,
  MapMenuToggle,
  PolygonSelector,
} from "legoland-shared";
import { Label, Box } from "tombac";
import { useMapView } from "../hooks/useMapView";
import { useAppContext } from "../AppContext";

export interface MapViewProps {
  drawingEnabled: boolean;
  onPolygonSelect?: (feature: any) => void;
}

function MapView({ drawingEnabled, onPolygonSelect }: MapViewProps) {
  const { filteredFeatures, drawnRegions } = useAppContext();
  const {
    mapModel,
    setMapModel,
    drawingOption,
    setDrawingOption,
    regions,
    handleSelect,
    anomalyLayer,
    regionLayer,
    tilesReady,
    geojsonData,
  } = useMapView(filteredFeatures, drawnRegions);

  function handlePolygonSelect(features: any[]) {
    if (features && features.length > 0) {
      const selectedFeature = features[0];
      handleSelect(selectedFeature);
      if (onPolygonSelect) onPolygonSelect(selectedFeature);
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
        <>
          {drawingEnabled && (
            <DrawingTools
              $position="absolute"
              $left="0"
              $top="0"
              $margin="15px"
              enabledDrawingOptions={[DrawingOption.POLYGON]}
              drawingOption={drawingOption}
              onDrawingOptionChange={setDrawingOption}
            />
          )}
          {!drawingEnabled && filteredFeatures.length > 0 && !tilesReady && (
            <Box
              $position="absolute"
              $top="50%"
              $left="50%"
              $transform="translate(-50%, -50%)"
              $background="rgba(255, 255, 255, 0.9)"
              $padding="16px"
              $borderRadius="8px"
              $boxShadow="0 2px 8px rgba(0,0,0,0.1)"
            >
              <Label>Optimizing map data...</Label>
            </Box>
          )}
        </>
      }
      mapControlsProps={{
        shouldCloseOnInteractOutside: () => true,
        mapLayersMenuContent: (
          <MapMenuToggle
            label="Orbis"
            checked={mapModel === "Orbis"}
            onChange={() =>
              setMapModel((prev: string) =>
                prev === "Genesis" ? "Orbis" : "Genesis"
              )
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
      {!drawingEnabled && tilesReady && (
        <Layers
          sourceId="anomalies"
          layers={[anomalyLayer]}
          data={geojsonData}
        />
      )}
      {!drawingEnabled && !tilesReady && filteredFeatures.length > 0 && (
        <Layers
          sourceId="anomalies-fallback"
          layers={[anomalyLayer]}
          data={{ type: "FeatureCollection", features: filteredFeatures }}
        />
      )}
      {drawingEnabled && (
        <Layers sourceId="regions" layers={[regionLayer]} data={regions} />
      )}
      {drawingEnabled && drawingOption === DrawingOption.POLYGON && (
        <PolygonSelector onSelect={handlePolygonSelect} />
      )}
    </GlMap>
  );
}

export default React.memo(MapView);
