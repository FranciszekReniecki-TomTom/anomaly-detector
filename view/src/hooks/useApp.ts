import { useState, useEffect, useMemo } from "react";

export function useAnomalyData(): any {
  const [anomalyGeoJson, setAnomalyGeoJson] = useState<any>(null);

  useEffect(() => {
    fetch("/.env/anomalies.json")
      .then((res) => res.json())
      .then(setAnomalyGeoJson)
      .catch(console.error);
  }, []);

  return anomalyGeoJson;
}

export interface AnomalyGeoJson {
  features: Array<{
    properties: {
      timestamp: string;
      anomaly_id: string;
    };
  }>;
}

export interface Timestamp {
  time: number;
  anomaly_id: string;
}

export function useTimestamps(anomalyGeoJson: AnomalyGeoJson | null) {
  const timestamps = useMemo(() => {
    if (!anomalyGeoJson) return [];
    return anomalyGeoJson.features
      .map((f) => ({
        time: new Date(f.properties.timestamp).getTime(),
        anomaly_id: f.properties.anomaly_id,
      }))
      .sort((a, b) => a.time - b.time);
  }, [anomalyGeoJson]);

  const timestampValues = useMemo(
    () => timestamps.map((t) => t.time),
    [timestamps]
  );

  return { timestamps, timestampValues };
}

export function useSelectedTime(timestampValues: number[]): [number, (t: number) => void] {
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
      ...new Set(anomalyGeoJson.features.map((f) => f.properties.anomaly_id)),
    ];
  }, [anomalyGeoJson]);
}

export function useSelectedAnomalies() {
  const [selectedAnomalies, setSelectedAnomalies] = useState<Set<string>>(new Set(["all"]));

  const toggleAnomaly = (id: string) => {
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
  };

  return { selectedAnomalies, toggleAnomaly };
}

export function useFilteredFeatures(
  anomalyGeoJson: AnomalyGeoJson | null,
  selectedTime: number,
  selectedAnomalies: Set<string>
) {
  return useMemo(() => {
    if (!anomalyGeoJson) return [];
    return anomalyGeoJson.features.filter((f) => {
      const ts = new Date(f.properties.timestamp).getTime();
      const matchesAnomaly =
        selectedAnomalies.has("all") ||
        selectedAnomalies.has(f.properties.anomaly_id);
      return ts === selectedTime && matchesAnomaly;
    });
  }, [selectedTime, selectedAnomalies, anomalyGeoJson]);
}

export function useMode(): [string, (mode: string) => void] {
  const [mode, setMode] = useState("drawing");
  return [mode, setMode];
}
