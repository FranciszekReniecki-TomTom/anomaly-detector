import { useState, useEffect, useMemo, useCallback } from "react";

export function useAnomalyData(): any {
  const [anomalyGeoJson, setAnomalyGeoJson] = useState<any>(null);
  const [processedData, setProcessedData] = useState<any>(null);
  
  const updateAnomalyData = useCallback((newData: any) => {
    setAnomalyGeoJson(newData);
    
    // Pre-process data for better performance
    if (newData?.features) {
      const processed = {
        ...newData,
        features: newData.features.map((feature: any) => ({
          ...feature,
          properties: {
            ...feature.properties,
            timeMs: new Date(feature.properties.time).getTime(), // Pre-calculate timestamp
            classIdStr: feature.properties.classId.toString() // Pre-calculate string version
          }
        }))
      };
      setProcessedData(processed);
    } else {
      setProcessedData(null);
    }
  }, []);

  return { anomalyGeoJson: processedData || anomalyGeoJson, updateAnomalyData };
}

export interface AnomalyGeoJson {
  features: Array<{
    properties: {
      time: string;
      classId: number;
      timeMs?: number; // Pre-calculated timestamp
      classIdStr?: string; // Pre-calculated string version
    };
  }>;
}

export interface Timestamp {
  time: number;
  classId: string;
}

export function useTimestamps(anomalyGeoJson: AnomalyGeoJson | null) {
  const timestamps = useMemo(() => {
    if (!anomalyGeoJson) return [];
    return anomalyGeoJson.features
      .map((f) => ({
        time: f.properties.timeMs || new Date(f.properties.time).getTime(), // Use pre-calculated if available
        classId: f.properties.classIdStr || f.properties.classId.toString(),
      }))
      .sort((a, b) => a.time - b.time);
  }, [anomalyGeoJson]);

  const timestampValues = useMemo(
    () => timestamps.map((t) => t.time),
    [timestamps]
  );

  return { timestamps, timestampValues };
}

export function useSelectedTime(
  timestampValues: number[]
): [number, (t: number) => void] {
  const [selectedTime, setSelectedTime] = useState(0);

  useEffect(() => {
    if (timestampValues.length) setSelectedTime(timestampValues[0]);
  }, [timestampValues]);

  return [selectedTime, setSelectedTime];
}

export function useAnomalyIds(anomalyGeoJson: AnomalyGeoJson | null): string[] {
  return useMemo(() => {
    if (!anomalyGeoJson) return [];
    return [
      ...new Set(
        anomalyGeoJson.features.map((f) => f.properties.classId.toString())
      ),
    ];
  }, [anomalyGeoJson]);
}

export function useSelectedAnomalies() {
  const [selectedAnomalies, setSelectedAnomalies] = useState<Set<string>>(
    new Set(["all"])
  );

  const toggleAnomaly = useCallback((id: string) => {
    setSelectedAnomalies((prev) => {
      if (id === "all") return new Set(["all"]);

      const newSet = new Set(prev);
      newSet.delete("all");

      if (newSet.has(id)) {
        newSet.delete(id);
        if (newSet.size === 0) newSet.add("all");
      } else {
        newSet.add(id);
      }

      return newSet;
    });
  }, []);

  return { selectedAnomalies, toggleAnomaly };
}

export function useFilteredAnomalyData(
  anomalyGeoJson: AnomalyGeoJson | null,
  selectedTime: number,
  selectedAnomalies: Set<string>
) {
  const filteredFeatures = useMemo(() => {
    if (!anomalyGeoJson || !selectedTime) return [];

    const showAll = selectedAnomalies.has("all");
    
    return anomalyGeoJson.features.filter((f) => {
      // Use pre-calculated timestamp if available
      const ts = f.properties.timeMs || new Date(f.properties.time).getTime();
      const timeDiff = Math.abs(ts - selectedTime);
      const isTimeMatch = timeDiff <= 3600000; // 1 hour
      
      if (!isTimeMatch) return false;
      
      if (showAll) return true;
      
      // Use pre-calculated string if available
      const classIdStr = f.properties.classIdStr || f.properties.classId.toString();
      return selectedAnomalies.has(classIdStr);
    });
  }, [anomalyGeoJson, selectedTime, selectedAnomalies]);

  return {
    type: "FeatureCollection",
    features: filteredFeatures,
  };
}

export function useMode(
  anomalyGeoJson: any
): [string, (mode: string) => void, boolean, () => void] {
  const [mode, setMode] = useState("drawing");
  const [showNoDataModal, setShowNoDataModal] = useState(false);

  const closeModal = () => setShowNoDataModal(false);

  const setModeWithValidation = useCallback(
    (newMode: string) => {
      if (
        newMode === "viewing" &&
        (!anomalyGeoJson ||
          !anomalyGeoJson.features ||
          anomalyGeoJson.features.length === 0)
      ) {
        console.log("Cannot switch to viewing mode: no data available", {
          anomalyGeoJson,
        });
        setShowNoDataModal(true);
        return;
      }
      setMode(newMode);
    },
    [anomalyGeoJson]
  );

  useEffect(() => {
    if (
      mode === "viewing" &&
      (!anomalyGeoJson ||
        !anomalyGeoJson.features ||
        anomalyGeoJson.features.length === 0)
    ) {
      setMode("drawing");
    }
  }, [anomalyGeoJson, mode]);

  return [mode, setModeWithValidation, showNoDataModal, closeModal];
}
