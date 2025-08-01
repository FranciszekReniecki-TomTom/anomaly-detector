import { createContext, useContext, useState, useEffect, useMemo } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [selectedAnomalies, setSelectedAnomalies] = useState(new Set(["all"]));
  const [anomalyGeoJson, setAnomalyGeoJson] = useState(null);
  const [selectedTime, setSelectedTime] = useState(0);
  const [mode, setMode] = useState("drawing");

  useEffect(() => {
    fetch("/.env/anomalies.json")
      .then((res) => res.json())
      .then(setAnomalyGeoJson)
      .catch(console.error);
  }, []);

  const timestamps = useMemo(() => {
    if (!anomalyGeoJson) return [];
    return anomalyGeoJson.features
      .map((f) => ({
        time: new Date(f.properties.timestamp).getTime(),
        anomaly_id: f.properties.anomaly_id,
      }))
      .sort((a, b) => a.time - b.time);
  }, [anomalyGeoJson]);

  const timestampValues = useMemo(() => timestamps.map((t) => t.time), [timestamps]);

  useEffect(() => {
    if (timestampValues.length) setSelectedTime(timestampValues[0]);
  }, [timestampValues]);

  const anomalyIds = useMemo(() => {
    if (!anomalyGeoJson) return [];
    return [...new Set(anomalyGeoJson.features.map((f) => f.properties.anomaly_id))];
  }, [anomalyGeoJson]);

  const toggleAnomaly = (id) => {
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

  const filteredFeatures = useMemo(() => {
    if (!anomalyGeoJson) return [];
    return anomalyGeoJson.features.filter((f) => {
      const ts = new Date(f.properties.timestamp).getTime();
      const matchesAnomaly = selectedAnomalies.has("all") || selectedAnomalies.has(f.properties.anomaly_id);
      return ts === selectedTime && matchesAnomaly;
    });
  }, [selectedTime, selectedAnomalies, anomalyGeoJson]);

  return (
    <AppContext.Provider
      value={{
        selectedAnomalies,
        toggleAnomaly,
        anomalyIds,
        anomalyGeoJson,
        filteredFeatures,
        timestamps,
        timestampValues,
        selectedTime,
        setSelectedTime,
        mode,
        setMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
