package anomalydetector.model.detection

import anomalydetector.model.TrafficTileHour
import java.time.DayOfWeek
import kotlin.math.abs

fun findOutliers(
  data: List<TrafficTileHour>,
  threshold: Double = 2.0
): List<TrafficTileHour> {

  val averages: Map<Triple<DayOfWeek, Byte, Long>, AverageTraffic> = getAverages(data)

  return data.filter { trafficTileHour ->
    val key = Triple(trafficTileHour.date.dayOfWeek, trafficTileHour.hour, trafficTileHour.id)
    val (avgSpeed, avgDistance, avgFreeFlow) = averages[key] ?: throw IllegalArgumentException(
      "No average found for key: $key"
    )

    // find residuals for speed, distance, and free flow speed
    val speedResidual = abs(trafficTileHour.traffic.speedKmH - avgSpeed) * 100 / avgSpeed
    val distanceResidual =
      abs(trafficTileHour.traffic.totalDistanceM - avgDistance) * 100 / avgDistance
    val freeFlowResidual =
      abs(trafficTileHour.traffic.freeFlowSpeedKmH - avgFreeFlow) * 100 / avgFreeFlow

    // if any residual is greater than the threshold, mark as anomaly
    speedResidual > threshold || distanceResidual > threshold || freeFlowResidual > threshold
  }
}

private fun getAverages(data: List<TrafficTileHour>) = data
  .groupBy { Triple(it.date.dayOfWeek, it.hour, it.id) }
  .mapValues {
    val avgSpeed = it.value.map { tileHour -> tileHour.traffic.speedKmH }.average()
    val avgDistance =
      it.value.map { tileHour -> tileHour.traffic.totalDistanceM }.average().toLong()
    val avgFreeFlowSpeed = it.value.map { tileHour -> tileHour.traffic.freeFlowSpeedKmH }.average()

    AverageTraffic(
      avgSpeed = avgSpeed,
      avgDistance = avgDistance,
      avgFreeFlowSpeed = avgFreeFlowSpeed
    )
  }

private data class AverageTraffic(
  val avgSpeed: Double,
  val avgDistance: Long,
  val avgFreeFlowSpeed: Double
)