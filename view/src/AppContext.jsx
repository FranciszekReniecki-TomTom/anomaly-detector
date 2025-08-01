import { createContext, useContext } from "react";
import {
  useAnomalyData,
  useTimestamps,
  useSelectedTime,
  useAnomalyIds,
  useSelectedAnomalies,
  useFilteredFeatures,
  useMode,
} from "./hooks/AppHooks";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const anomalyGeoJson = useAnomalyData();

  const { timestamps, timestampValues } = useTimestamps(anomalyGeoJson);

  const [selectedTime, setSelectedTime] = useSelectedTime(timestampValues);

  const anomalyIds = useAnomalyIds(anomalyGeoJson);

  const { selectedAnomalies, toggleAnomaly } = useSelectedAnomalies();

  const filteredFeatures = useFilteredFeatures(
    anomalyGeoJson,
    selectedTime,
    selectedAnomalies
  );

  const [mode, setMode] = useMode();

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
