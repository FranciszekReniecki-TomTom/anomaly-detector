import React from "react";
import { Box, Text, TomTomLogo } from "tombac";

const topBarStyle = {
  height: "80px",
  background: "#ffffff",
  borderBottom: "1px solid #e0e0e0",
  display: "flex",
  alignItems: "center",
  padding: "0 20px",
  boxSizing: "border-box" as const,
  zIndex: 1000,
};

function TopBar() {
  return (
    <Box style={topBarStyle}>
      <Box $width="200px" $height="40px" $padding="20px">
        <TomTomLogo scale={1} />
      </Box>
      <Box />
      <Text>Anomaly Detection</Text>
    </Box>
  );
}

export default React.memo(TopBar);
