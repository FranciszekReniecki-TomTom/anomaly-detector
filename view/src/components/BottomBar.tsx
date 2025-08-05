import { Box } from "tombac";
import TimeSlider from "./TimeSlider";
import AnomalyDots from "./AnomalyDots";
import DateTimeLabels from "./DateTimeLabels";
import { useAppContext } from "../AppContext";

const bottomBarStyle = {
  position: "absolute" as const,
  bottom: 0,
  left: 0,
  right: 0,
  borderTop: "1px solid #ccc",
  padding: 8,
  background: "#f8f8f8",
  boxSizing: "border-box" as const,
};

export default function BottomBar() {
  const { timestampValues, selectedTime, timestamps, selectedAnomalies } =
    useAppContext();

  if (timestampValues.length === 0) return null;

  return (
    <Box style={bottomBarStyle}>
      <Box
        style={{
          overflowY: "hidden",
          height: "60px",
          paddingLeft: "80px",
          paddingRight: "40px",
        }}
      >
        <TimeSlider />
      </Box>
      <Box
        style={{
          height: "160px",
          overflowY: "auto",
          marginTop: 8,
          paddingLeft: "80px",
          paddingRight: "40px",
        }}
      >
        <AnomalyDots
          timestamps={timestamps}
          minTime={timestampValues[0]}
          maxTime={timestampValues[timestampValues.length - 1]}
          selectedTime={selectedTime}
          baseLaneHeight={10}
          padding={9}
          selectedAnomalies={selectedAnomalies}
        />
      </Box>
      <Box style={{ paddingLeft: "80px", paddingRight: "40px" }}>
        <DateTimeLabels
          minTime={timestampValues[0]}
          maxTime={timestampValues[timestampValues.length - 1]}
          padding={9}
        />
      </Box>
    </Box>
  );
}
