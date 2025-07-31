import { Label } from "tombac";

export default function AnomalyFilter({
  anomalyIds,
  anomalyGeoJson,
  selectedAnomalies,
  toggleAnomaly,
}) {
  return (
    <>
      <h3>Anomaly Report</h3>

      <Label style={{ display: "block", marginBottom: 8 }}>
        Filter by anomaly:
      </Label>
      <div style={{ marginBottom: 16, maxHeight: 300, overflowY: "auto" }}>
        <label>
          <input
            type="checkbox"
            checked={selectedAnomalies.has("all")}
            onChange={() => toggleAnomaly("all")}
          />
          <strong>All</strong>
        </label>

        {anomalyIds.map((id) => {
          const timestampsForId = anomalyGeoJson.features
            .filter((f) => f.properties.anomaly_id === id)
            .map((f) => f.properties.timestamp)
            .sort();

          return (
            <div
              key={id}
              style={{ marginLeft: 12, marginBottom: 8, userSelect: "none" }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={selectedAnomalies.has(id)}
                  onChange={() => toggleAnomaly(id)}
                />
                {id}
              </label>
              <ul
                style={{
                  marginTop: 4,
                  marginLeft: 20,
                  fontSize: 12,
                  maxHeight: 100,
                  overflowY: "auto",
                }}
              >
                {timestampsForId.map((ts, i) => (
                  <li key={i}>{new Date(ts).toLocaleString()}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}
