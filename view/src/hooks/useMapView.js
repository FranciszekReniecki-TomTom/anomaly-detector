import { useState } from "react";
import { useDrawingTools } from "legoland-shared";

export function useMapView(filteredFeatures) {
  const [mapModel, setMapModel] = useState("Orbis");
  const [drawingOption, setDrawingOption] = useState();
  const [regions, setRegions] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);

  const { handleSelect: originalHandleSelect } = useDrawingTools(
    regions,
    setRegions
  );

  async function handleSelect(polygon) {
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
