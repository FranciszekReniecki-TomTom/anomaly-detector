export default function AnomalyList({ filteredFeatures }) {
  return (
    <div>
      {filteredFeatures.map((f, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <strong>{f.properties.anomaly_id}</strong> <br />
          {f.properties.timestamp}
        </div>
      ))}
    </div>
  );
}
