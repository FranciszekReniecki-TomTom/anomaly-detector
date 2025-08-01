import { useAppContext } from "../AppContext";

export default function AnomalyFilter() {
  const { anomalyIds, anomalyGeoJson, selectedAnomalies, toggleAnomaly } =
    useAppContext();

  if (!anomalyGeoJson) return null;

  return (
    <div>
      {anomalyIds.map((id) => (
        <label key={id} style={{ display: "block", marginBottom: 4 }}>
          <input
            type="checkbox"
            checked={selectedAnomalies.has(id)}
            onChange={() => toggleAnomaly(id)}
          />
          {id}
        </label>
      ))}
    </div>
  );
}
