import { useState, useEffect } from "react";
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

interface SidebarProps {
  selectedPolygon: any;
}

function Sidebar({ selectedPolygon }: SidebarProps) {
  const { mode, setMode } = useAppContext();

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

  const handleGenerateReport = async () => {
    if (!selectedPolygon) {
      alert("Please select a polygon to generate the report.");
      return;
    }
    try {
      await fetchAnomalyData({
        startDay: startDay.toISOString().slice(0, 19),
        endDay: endDay.toISOString().slice(0, 19),
        coordinates: selectedPolygon.geometry.coordinates[0],
        dataType: "TOTAL_DISTANCE_M",
      });
      setMode("viewing");
    } catch (error: any) {
      alert("Failed to generate report: " + error.message);
    }
  };

  if (mode !== "viewing" && mode !== "drawing") {
    return null;
  }

  return (
    <aside style={sidebarStyle}>
      {mode === "drawing" && (
        <Box
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
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
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
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
          <Button onClick={handleGenerateReport}>
            <Label>Generate Report</Label>
          </Button>
        </Box>
      )}
      {mode === "viewing" && (
        <>
          <Box style={{ padding: 16, borderBottom: "1px solid #eee" }}>
            <Button onClick={() => setMode("drawing")}>
              <Label>Back to Drawing</Label>
            </Button>
          </Box>
          <Box style={{ flex: 1, overflow: "auto", padding: 16 }}>
            <AnomalyList />
          </Box>
        </>
      )}
    </aside>
  );
}

export default Sidebar;
