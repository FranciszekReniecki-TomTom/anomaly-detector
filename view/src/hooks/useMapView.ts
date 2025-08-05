import { useState, useEffect } from "react";
import { DrawingOption, MapModel, useDrawingTools } from "legoland-shared";

export function useMapView(filteredFeatures: any[], initialRegions: any[] = []) {
  const [mapModel, setMapModel] = useState<MapModel>("Orbis");
  const [drawingOption, setDrawingOption] = useState<DrawingOption>();
  const [regions, setRegions] = useState<any[]>(initialRegions);
  const [selectedPolygon, setSelectedRegion] = useState<any>(null);

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

  const anomalyLayer = {
    id: "anomalies",
    type: "fill",
    paint: { "fill-color": "#cc0000", "fill-opacity": 0.4 },
  };

  const regionLayer = {
    id: "regions",
    type: "fill",
    paint: {
      "fill-color": "green",
      "fill-outline-color": "green",
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
  };
}
