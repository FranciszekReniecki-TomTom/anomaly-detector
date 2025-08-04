import { useAppContext } from "../AppContext";
import { Checkbox, Label } from "tombac";

export default function AnomalyList() {
  const { anomalyIds, anomalyGeoJson, selectedAnomalies, toggleAnomaly } =
    useAppContext();

  if (!anomalyGeoJson) return null;

  return (
    <div>
      {anomalyIds.map((id: string) => (
        <Label key={id} style={{ display: "block", marginBottom: 4 }}>
          <Checkbox
            checked={selectedAnomalies.has(id)}
            onChange={() => toggleAnomaly(id)}
            style={{ padding: 10 }}
          />
          {id}
        </Label>
      ))}
    </div>
  );
}
