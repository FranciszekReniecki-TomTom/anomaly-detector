import React from "react";
import { Modal, Button, Box, Label, Text, Heading } from "tombac";
import { useAppContext } from "../AppContext";

interface AnomalyModalProps {
  selectedAnomalyId: string | null;
  onClose: () => void;
}

function AnomalyModal({ selectedAnomalyId, onClose }: AnomalyModalProps) {
  const { anomalyGeoJson } = useAppContext();

  const getAnomalyDetails = (anomalyId: string) => {
    if (!anomalyGeoJson?.features) return null;

    const anomalyFeatures = anomalyGeoJson.features.filter(
      (feature: any) => feature.properties.anomaly_id === anomalyId
    );

    if (anomalyFeatures.length === 0) return null;

    const firstFeature = anomalyFeatures[0];
    const reportId = firstFeature.properties.report_id;

    const timestamps = anomalyFeatures
      .map((f: any) => f.properties.timestamp)
      .sort();

    return {
      anomalyId,
      reportId,
      featureCount: anomalyFeatures.length,
      timestamps,
      firstTimestamp: timestamps[0],
      lastTimestamp: timestamps[timestamps.length - 1],
    };
  };

  const selectedAnomalyDetails = selectedAnomalyId
    ? getAnomalyDetails(selectedAnomalyId)
    : null;

  if (!selectedAnomalyId || !selectedAnomalyDetails) {
    return null;
  }

  return (
    <Modal isOpen={true}>
      <Box style={{ padding: 16 }}>
        <Heading style={{ marginBottom: 16 }}>
          Anomaly Details: {selectedAnomalyDetails.anomalyId}
        </Heading>
        <Text style={{ marginBottom: 12 }}>
          <strong>Anomaly ID:</strong> {selectedAnomalyDetails.anomalyId}
        </Text>
        <Text style={{ marginBottom: 12 }}>
          <strong>Report ID:</strong> {selectedAnomalyDetails.reportId}
        </Text>
        <Text style={{ marginBottom: 12 }}>
          <strong>Time range:</strong>
          <br />
          From:{" "}
          {new Date(selectedAnomalyDetails.firstTimestamp).toLocaleString()}
          <br />
          To: {new Date(selectedAnomalyDetails.lastTimestamp).toLocaleString()}
        </Text>
        <Text style={{ marginBottom: 12 }}>
          <strong>All timestamps:</strong>
          <Box
            style={{
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid #ccc",
              padding: 8,
              marginTop: 4,
            }}
          >
            {selectedAnomalyDetails.timestamps.map(
              (timestamp: string, index: number) => (
                <Text key={index} style={{ fontSize: "12px", marginBottom: 2 }}>
                  {new Date(timestamp).toLocaleString()}
                </Text>
              )
            )}
          </Box>
        </Text>
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Modal>
  );
}

export default React.memo(AnomalyModal);
