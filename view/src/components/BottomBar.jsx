import { Box } from "tombac";
import TimeSlider from "./TimeSlider";
import AnomalyDots from "./AnomalyDots";
import { useAppContext } from "../AppContext";

const bottomBarStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  borderTop: "1px solid #ccc",
  padding: 8,
  background: "#f8f8f8",
  boxSizing: "border-box",
};

export default function BottomBar() {
  const { timestampValues, selectedTime, setSelectedTime, timestamps } =
    useAppContext();

  if (timestampValues.length === 0) return null;

  return (
    <Box style={bottomBarStyle}>
      <TimeSlider
        timestamps={timestampValues}
        value={selectedTime}
        setValue={setSelectedTime}
      />
      <div style={{ height: "240px", overflowY: "auto" }}>
        <AnomalyDots
          timestamps={timestamps}
          minTime={timestampValues[0]}
          maxTime={timestampValues[timestampValues.length - 1]}
          selectedTime={selectedTime}
          width={100}
          baseLaneHeight={10}
          padding={9}
        />
      </div>
    </Box>
  );
}
