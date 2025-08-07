import React, { useState } from "react";
import { useAppContext } from "../AppContext";
import { Checkbox, Label, Box } from "tombac";
import AnomalyModal from "./AnomalyModal";

function AnomalyList() {
  const { anomalyIds, anomalyGeoJson, selectedAnomalies, toggleAnomaly } =
    useAppContext();

  const [selectedAnomalyForModal, setSelectedAnomalyForModal] = useState<
    string | null
  >(null);

  if (!anomalyGeoJson) return null;

  return (
    <div>
      {anomalyIds.map((id: string) => (
        <Box
          key={id}
          style={{ display: "flex", alignItems: "center", marginBottom: 4 }}
        >
          <Label
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              cursor: "pointer",
            }}
          >
            <Checkbox
              checked={selectedAnomalies.has(id)}
              onChange={() => toggleAnomaly(id)}
              style={{ marginRight: 8 }}
            />
            <span
              onClick={() => setSelectedAnomalyForModal(id)}
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              {id}
            </span>
          </Label>
        </Box>
      ))}

      <AnomalyModal
        selectedAnomalyId={selectedAnomalyForModal}
        onClose={() => setSelectedAnomalyForModal(null)}
      />
    </div>
  );
}

export default React.memo(AnomalyList);
