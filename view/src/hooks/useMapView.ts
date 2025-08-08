import { useState, useEffect, useMemo } from "react";
import { DrawingOption, MapModel, useDrawingTools } from "legoland-shared";
import { useVectorTiles } from "./useVectorTiles";

export function useMapView(
  filteredFeatures: any[],
  initialRegions: any[] = []
) {
  const [mapModel, setMapModel] = useState<MapModel>("Orbis");
  const [drawingOption, setDrawingOption] = useState<DrawingOption>();
  const [regions, setRegions] = useState<any[]>(initialRegions);
  const [selectedPolygon, setSelectedRegion] = useState<any>(null);

  // Create GeoJSON data for vector tiles
  const geojsonData = useMemo(() => ({
    type: "FeatureCollection",
    features: filteredFeatures || []
  }), [filteredFeatures]);

  // Use vector tiles for performance optimization
  const { tileIndex, isReady: tilesReady } = useVectorTiles(geojsonData, {
    maxZoom: 16,
    tolerance: 2,
    buffer: 128
  });

  useEffect(() => {
    setRegions(initialRegions);
  }, [initialRegions]);

  const { handleSelect: originalHandleSelect } = useDrawingTools(
    regions,
    setRegions
  );

  async function handleSelect(polygon: any) {
    originalHandleSelect(polygon);
    setSelectedRegion(polygon);
  }

  const anomalyLayer = useMemo(() => ({
    id: "anomalies",
    type: "fill",
    paint: { 
      "fill-color": [
        "case",
        ["has", "classId"],
        [
          "case",
          ["==", ["get", "classId"], 0], "#ff4444",
          ["==", ["get", "classId"], 1], "#44ff44", 
          ["==", ["get", "classId"], 2], "#4444ff",
          "#cc0000"
        ],
        "#cc0000"
      ],
      "fill-opacity": 0.6 
    },
  }), []);

  const regionLayer = {
    id: "regions",
    type: "fill",
    paint: {
      "fill-color": "#00aaff",
      "fill-outline-color": "#2274aa",
      "fill-opacity": 0.4,
    },
  };

  return {
    mapModel,
    setMapModel,
    drawingOption,
    setDrawingOption,
    regions,
    setRegions,
    handleSelect,
    anomalyLayer,
    regionLayer,
    selectedPolygon,
    tileIndex,
    tilesReady,
    geojsonData,
  };
}
