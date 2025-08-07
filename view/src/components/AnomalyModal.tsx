import React, { useState } from "react";
import { Modal, Button, Box, Label, Text } from "tombac";
import { useAppContext } from "../AppContext";
import { fetchAnomalyInfo } from "../api/api";

interface AnomalyModalProps {
  selectedAnomalyId: string | null;
  onClose: () => void;
}

function AnomalyModal({ selectedAnomalyId, onClose }: AnomalyModalProps) {
  const { anomalyGeoJson } = useAppContext();
  const [anomalyInfo, setAnomalyInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleFindInformation = async () => {
    if (!selectedAnomalyDetails) return;

    setIsLoading(true);
    try {
      const anomalyFeatures = anomalyGeoJson.features.filter(
        (feature: any) => feature.properties.anomaly_id === selectedAnomalyId
      );

      const info = await fetchAnomalyInfo({
        anomalyId: selectedAnomalyId,
        features: anomalyFeatures,
      });

      setAnomalyInfo(info);
    } catch (error) {
      console.error("Error fetching anomaly info:", error);
      setAnomalyInfo(
        "Failed to retrieve anomaly information. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={true}>
      <Box style={{ padding: 16 }}>
        <Label
          style={{ marginBottom: 16, fontSize: "18px", fontWeight: "bold" }}
        >
          Anomaly Details: {selectedAnomalyDetails.anomalyId}
        </Label>
        <Text style={{ marginBottom: 12 }}>
          <strong>Anomaly ID:</strong> {selectedAnomalyDetails.anomalyId}
        </Text>
        <Text style={{ marginBottom: 12 }}>
          <strong>Report ID:</strong> {selectedAnomalyDetails.reportId}
        </Text>
        <Text style={{ marginBottom: 12 }}>
          <strong>Number of features:</strong>{" "}
          {selectedAnomalyDetails.featureCount}
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

        <Box style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <Button onClick={handleFindInformation} disabled={isLoading}>
            {isLoading ? "Loading..." : "Find Information"}
          </Button>
          <Button onClick={onClose}>Close</Button>
        </Box>

        {anomalyInfo && (
          <Box
            style={{
              marginTop: 20,
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 4,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Label style={{ marginBottom: 8, fontWeight: "bold" }}>
              Analysis Results
            </Label>
            <Text style={{ whiteSpace: "pre-line" }}>{anomalyInfo}</Text>
          </Box>
        )}
      </Box>
    </Modal>
  );
}

export default React.memo(AnomalyModal);
