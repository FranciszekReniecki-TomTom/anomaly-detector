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
  try {
    const response = await fetch("http://localhost:8080/anomaly", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDay,
        endDay,
        polygon: coordinates,
        dataType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching anomaly data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching anomaly data:", error);
    throw error;
  }
}

export async function fetchAnomalyInfo({
  anomalyId,
  features,
}: FetchAnomalyInfoParams): Promise<string> {
  try {
    const featureCollection = {
      type: "FeatureCollection",
      features: features,
    };

    const response = await fetch("http://localhost:8080/anomaly/label", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(featureCollection),
    });

    if (!response.ok) {
      throw new Error(`Error fetching anomaly info: ${response.statusText}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error fetching anomaly info:", error);
    return "Failed to retrieve anomaly information. Please try again later.";
  }
}
