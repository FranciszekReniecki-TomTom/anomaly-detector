export async function fetchAnomalyData({
  startDay,
  endDay,
  coordinates,
  dataType,
}) {
  //todo change endpoint
  const response = await fetch("/your-api-endpoint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ startDay, endDay, coordinates, dataType }),
  });

  if (!response.ok) {
    throw new Error(`Error fetching anomaly data: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
