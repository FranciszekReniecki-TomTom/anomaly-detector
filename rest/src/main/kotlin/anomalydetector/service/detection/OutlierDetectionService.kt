package anomalydetector.service.detection

import anomalydetector.model.TrafficTileHour

fun findAnomalies(
  data: List<TrafficTileHour>,
  threshold: Double = 50.0
): List<TrafficTileHour> {
  return data.filter { it.traffic.speedKmH > threshold }
}