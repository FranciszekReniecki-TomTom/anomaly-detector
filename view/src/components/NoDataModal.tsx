import React from "react";
import { Modal, Button, Box, Label, Text } from "tombac";

interface NoDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function NoDataModal({ isOpen, onClose }: NoDataModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
    >
      <Box $padding="24px" $width="400px" style={{ textAlign: "center" }}>
        <Label>No Anomalies Detected</Label>

        <Button onClick={onClose} variant="primary">
          Got it
        </Button>
      </Box>
    </Modal>
  );
}

export default NoDataModal;
