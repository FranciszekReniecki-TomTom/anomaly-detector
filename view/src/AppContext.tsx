import { createContext, useContext, ReactNode } from "react";
import {
  useAnomalyData,
  useTimestamps,
  useSelectedTime,
  useAnomalyIds,
  useSelectedAnomalies,
  useFilteredFeatures,
  useMode,
} from "./hooks/useApp";

interface AppContextType {
  selectedAnomalies: Set<string>;
  toggleAnomaly: (id: string) => void;
  anomalyIds: string[];
  anomalyGeoJson: any;
  filteredFeatures: any[];
  timestamps: any[];
  timestampValues: number[];
  selectedTime: number;
  setSelectedTime: (t: number) => void;
  mode: string;
  setMode: (mode: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
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

  const [mode, setMode] = useMode(anomalyGeoJson);

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
