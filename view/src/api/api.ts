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

// Simple cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(params: FetchAnomalyDataParams): string {
  return JSON.stringify({
    startDay: params.startDay,
    endDay: params.endDay,
    coordinates: params.coordinates,
    dataType: params.dataType,
  });
}

export async function fetchAnomalyData({
  startDay,
  endDay,
  coordinates,
  dataType,
}: FetchAnomalyDataParams): Promise<any> {
  const cacheKey = getCacheKey({ startDay, endDay, coordinates, dataType });
  const cached = cache.get(cacheKey);
  
  // Check if we have valid cached data
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("Returning cached data");
    return cached.data;
  }

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
    
    // Cache the response
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
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
