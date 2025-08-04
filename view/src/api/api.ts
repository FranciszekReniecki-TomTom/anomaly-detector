export interface FetchAnomalyDataParams {
  startDay: string;
  endDay: string;
  coordinates: any;
  dataType: string;
}

export async function fetchAnomalyData({
  startDay,
  endDay,
  coordinates,
  dataType,
}: FetchAnomalyDataParams): Promise<any> {
  // Return anomalies.json for now
  const response = await fetch("/.env/anomalies.json");
  if (!response.ok) {
    throw new Error(`Error fetching anomaly data: ${response.statusText}`);
  }
  const data = await response.json();
  return data;

  //   const response = await fetch("/your-api-endpoint", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ startDay, endDay, coordinates, dataType }),
  //   });
  //   if (!response.ok) {
  //     throw new Error(`Error fetching anomaly data: ${response.statusText}`);
  //   }
  //   const data = await response.json();
  //   return data;
}
