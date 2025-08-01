import { Label } from "tombac";
import { useState } from "react";

export default function AnomalyFilter({
  anomalyIds,
  anomalyGeoJson,
  selectedAnomalies,
  toggleAnomaly,
}) {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <Label>Anomaly Report</Label>

      <Label style={{ display: "block", marginBottom: 8 }}>
        Filter by anomaly:
      </Label>
      <div style={{ marginBottom: 16, maxHeight: 300, overflowY: "auto" }}>
        <Label style={{ display: "block", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={selectedAnomalies.has("all")}
            onChange={() => toggleAnomaly("all")}
          />
          <strong>All</strong>
        </Label>

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
              <Label
                onClick={() => toggleExpand(id)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedAnomalies.has(id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleAnomaly(id);
                  }}
                  style={{ marginRight: 6 }}
                />
                <span>{id}</span>
                <span style={{ marginLeft: "auto", fontSize: 10 }}>
                  {expanded[id] ? "▼" : "▶"}
                </span>
              </Label>

              {expanded[id] && (
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
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
