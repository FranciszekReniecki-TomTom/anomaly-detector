import { useState, useEffect, useCallback } from "react";
import { Button, DatePicker, Label, Box } from "tombac";
import AnomalyList from "./AnomalyList";
import { useAppContext } from "../AppContext";
import { fetchAnomalyData } from "../api/api";
import { CSSProperties } from "react";

const sidebarStyle: CSSProperties = {
  width: 280,
  borderRight: "1px solid #ccc",
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function subtractMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

interface SidebarProps {}

function Sidebar({}: SidebarProps) {
  const { mode, setMode, selectedPolygon, updateAnomalyData } = useAppContext();

  const [startDay, setStartDay] = useState<Date>(new Date("2025-01-01T00:00"));
  const [endDay, setEndDay] = useState<Date>(new Date("2025-02-01T00:00"));

  useEffect(() => {
    const minEnd = addMonths(startDay, 1);
    if (endDay < minEnd) setEndDay(minEnd);
  }, [startDay]);

  useEffect(() => {
    const minStart = subtractMonths(endDay, 1);
    if (startDay > minStart) setStartDay(minStart);
  }, [endDay]);

  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = useCallback(async () => {
    if (!selectedPolygon) {
      alert("Please select a polygon to generate the report.");
      return;
    }
    
    setIsLoading(true);
    try {
      // Swap coordinates from [lon, lat] to [lat, lon] format expected by backend
      const swappedCoordinates = selectedPolygon.geometry.coordinates[0].map(
        ([lon, lat]: [number, number]) => [lat, lon]
      );

      const reportData = await fetchAnomalyData({
        startDay: startDay.toISOString().slice(0, 19),
        endDay: endDay.toISOString().slice(0, 19),
        coordinates: swappedCoordinates,
        dataType: "TOTAL_DISTANCE_M",
      });

      // Update the app with the new anomaly data
      updateAnomalyData(reportData);
      setMode("viewing");
    } catch (error: any) {
      alert("Failed to generate report: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPolygon, startDay, endDay, setMode, updateAnomalyData]);

  if (mode !== "viewing" && mode !== "drawing") {
    return null;
  }

  return (
    <aside style={sidebarStyle}>
      {mode === "drawing" && (
        <Box
          $padding="16px"
          $display="flex"
          $flexDirection="column"
          $alignItems="center"
          $gap="16px"
        >
          <Box
            $display="flex"
            $flexDirection="column"
            $alignItems="center"
            $gap="8px"
          >
            <Label>Start Date</Label>
            <DatePicker
              value={startDay}
              onChange={(date) => {
                if (date instanceof Date) setStartDay(date);
              }}
              maxDate={subtractMonths(endDay, 0)}
            />
          </Box>
          <Box
            $display="flex"
            $flexDirection="column"
            $alignItems="center"
            $gap="8px"
          >
            <Label>End Date</Label>
            <DatePicker
              value={endDay}
              onChange={(date) => {
                if (date instanceof Date) setEndDay(date);
              }}
              minDate={addMonths(startDay, 1)}
            />
          </Box>
          <Button onClick={handleGenerateReport} disabled={isLoading}>
            <Label>{isLoading ? "Generating..." : "Generate Report"}</Label>
          </Button>
        </Box>
      )}
      {mode === "viewing" && (
        <>
          <Box $padding="16px" $borderBottom="1px solid #eee">
            <Button onClick={() => setMode("drawing")}>
              <Label>Back to Drawing</Label>
            </Button>
          </Box>
          <Box $flex="1" $overflow="auto" $padding="16px">
            <AnomalyList />
          </Box>
        </>
      )}
    </aside>
  );
}

export default Sidebar;
