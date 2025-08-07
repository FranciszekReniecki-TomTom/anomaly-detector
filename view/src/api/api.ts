export interface FetchAnomalyDataParams {
  startDay: string;
  endDay: string;
  coordinates: any;
  dataType: string;
}

export interface FetchAnomalyInfoParams {
  anomalyId: string;
  features: any[];
}

export async function fetchAnomalyData({
  startDay,
  endDay,
  coordinates,
  dataType,
}: FetchAnomalyDataParams): Promise<any> {
  // Return anomalies.json for now
  const response = await fetch("/mock-data/anomalies.json");
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

export async function fetchAnomalyInfo({
  anomalyId,
  features,
}: FetchAnomalyInfoParams): Promise<string> {
  try {
    // mock the response with a delayed Promise
    const mockApiResponse = await new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        );
      }, 1500);
    });

    return mockApiResponse;
  } catch (error) {
    console.error("Error fetching anomaly info:", error);
    return "Failed to retrieve anomaly information. Please try again later.";
  }
}
