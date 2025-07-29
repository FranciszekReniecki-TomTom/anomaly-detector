package anomalydetector.model.detection

import anomalydetector.model.TrafficTileHour
import org.slf4j.LoggerFactory
import java.time.DayOfWeek
import kotlin.math.abs
import kotlin.math.sqrt

private val log = LoggerFactory.getLogger("OutlierDetection")

private data class TrafficId(
  val day: DayOfWeek,
  val hour: Byte,
  val id: Long
)

private data class PlainTraffic(
  val speed: Double,
  val distance: Long,
  val freeFlowSpeed: Double
)

fun findOutliersInSpeed(
  data: List<TrafficTileHour>,
  threshold: Double = 1.0
): List<TrafficTileHour> {
  val trafficWeekly: Map<TrafficId, List<TrafficTileHour>> = data
    .groupBy { TrafficId(it.date.dayOfWeek, it.hour, it.id) }
  val averages: Map<TrafficId, Double> = trafficWeekly
    .mapValues { it.value.map { tileHour -> tileHour.traffic.speedKmH }.average() }
  val stds: Map<TrafficId, Double> = trafficWeekly
    .mapValues { (trafficId, tileHours) ->
      val avgSpeed = averages[trafficId]
        ?: throw IllegalArgumentException("No average for trafficId: $trafficId")
      sqrt(tileHours.map { (it.traffic.speedKmH - avgSpeed).let { d -> d * d } }.average())
    }

  return data.filter { trafficTileHour ->
    val trafficId =
      TrafficId(trafficTileHour.date.dayOfWeek, trafficTileHour.hour, trafficTileHour.id)
    val avgSpeed = averages[trafficId] ?: throw IllegalArgumentException(
      "No average speed found for key: $trafficId"
    )
    val std = stds[trafficId] ?: throw IllegalArgumentException(
      "No standard deviation found for key: $trafficId"
    )
    abs(trafficTileHour.traffic.speedKmH - avgSpeed) / std > threshold
  }
}