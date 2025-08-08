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
      (feature: any) => feature.properties.classId.toString() === anomalyId
    );

    if (anomalyFeatures.length === 0) return null;

    const firstFeature = anomalyFeatures[0];
    const reportId = "N/A"; // JSON doesn't contain report_id

    const timestamps = anomalyFeatures
      .map((f: any) => f.properties.time)
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
        (feature: any) =>
          feature.properties.classId.toString() === selectedAnomalyId
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
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
    >
      <Box $padding="24px" $width="500px">
        <Label
          $marginBottom="16px"
          style={{ fontSize: "18px", fontWeight: "bold" }}
        >
          Anomaly Details: {selectedAnomalyDetails.anomalyId}
        </Label>
        <Text $marginBottom="12px">
          <strong>Anomaly ID:</strong> {selectedAnomalyDetails.anomalyId}
        </Text>
        <Text $marginBottom="12px">
          <strong>Report ID:</strong> {selectedAnomalyDetails.reportId}
        </Text>
        <Text $marginBottom="12px">
          <strong>Number of features:</strong>{" "}
          {selectedAnomalyDetails.featureCount}
        </Text>
        <Text $marginBottom="12px">
          <strong>Time range:</strong>
          <br />
          From:{" "}
          {new Date(selectedAnomalyDetails.firstTimestamp).toLocaleString()}
          <br />
          To: {new Date(selectedAnomalyDetails.lastTimestamp).toLocaleString()}
        </Text>
        <Text $marginBottom="12px">
          <strong>All timestamps:</strong>
          <Box
            $maxHeight="200px"
            $overflowY="auto"
            $border="1px solid #ccc"
            $padding="8px"
            $marginTop="4px"
          >
            {selectedAnomalyDetails.timestamps.map(
              (timestamp: string, index: number) => (
                <Text
                  key={index}
                  $marginBottom="2px"
                  style={{ fontSize: "12px" }}
                >
                  {new Date(timestamp).toLocaleString()}
                </Text>
              )
            )}
          </Box>
        </Text>

        <Button onClick={handleFindInformation} disabled={isLoading}>
          {isLoading ? "Loading..." : "Find Information"}
        </Button>

        {anomalyInfo && (
          <Box
            $marginTop="20px"
            $padding="12px"
            $border="1px solid #ddd"
            $borderRadius="4px"
            $backgroundColor="#f9f9f9"
            $maxHeight="180px"
            $overflowY="auto"
          >
            <Label $marginBottom="8px" style={{ fontWeight: "bold" }}>
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
