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
          $border="1u solid --neutral"
          $padding="10px"
          key={id}
          $display="flex"
          $alignItems="center"
          $marginBottom="4px"
          style={{ cursor: "pointer" }}
          onClick={() => setSelectedAnomalyForModal(id)}
        >
          <Box onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={selectedAnomalies.has(id)}
              onChange={() => toggleAnomaly(id)}
              $marginRight="8px"
            />
          </Box>
          <Box>
            <Label>{id}</Label>
          </Box>
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
