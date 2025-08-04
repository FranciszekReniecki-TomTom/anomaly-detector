import { useState } from "react";
import { useDrawingTools } from "legoland-shared";

export function useMapView(filteredFeatures: any[]) {
  const [mapModel, setMapModel] = useState<string>("Orbis");
  const [drawingOption, setDrawingOption] = useState<any>();
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedPolygon, setSelectedRegion] = useState<any>(null);

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
