import { Box } from "tombac";
import TimeSlider from "./TimeSlider";
import AnomalyDots from "./AnomalyDots";
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
  const { timestampValues, selectedTime, timestamps } = useAppContext();

  if (timestampValues.length === 0) return null;

  return (
    <Box style={bottomBarStyle}>
      <div style={{ overflowY: "scroll", height: "60px" }}>
        <TimeSlider />
      </div>
      <div style={{ height: "180px", overflowY: "auto", marginTop: 8 }}>
        <AnomalyDots
          timestamps={timestamps}
          minTime={timestampValues[0]}
          maxTime={timestampValues[timestampValues.length - 1]}
          selectedTime={selectedTime}
          baseLaneHeight={10}
          padding={9}
        />
      </div>
    </Box>
  );
}
