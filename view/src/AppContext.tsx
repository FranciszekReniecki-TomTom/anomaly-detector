import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";
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
  selectedPolygon: any;
  setSelectedPolygon: (polygon: any) => void;
  drawnRegions: any[];
  setDrawnRegions: (regions: any[]) => void;
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

  const [selectedPolygon, setSelectedPolygon] = useState<any>(null);
  const [drawnRegions, setDrawnRegions] = useState<any[]>([]);

  const handleSetSelectedPolygon = useCallback((polygon: any) => {
    setSelectedPolygon(polygon);
  }, []);

  const handleSetDrawnRegions = useCallback((regions: any[]) => {
    setDrawnRegions(regions);
  }, []);

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
        selectedPolygon,
        setSelectedPolygon: handleSetSelectedPolygon,
        drawnRegions,
        setDrawnRegions: handleSetDrawnRegions,
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
