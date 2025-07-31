package anomalydetector.model

import anomalydetector.model.engine.findClusters
import anomalydetector.model.engine.findWeeklyOutliers

enum class TrafficType {
  SPEED, FLOW
}

fun findAnomalies(
  tiles: List<TrafficTileHour>,
  trafficType: TrafficType
): List<List<TrafficTileHour>> {
  val outliers: List<TrafficTileHour> = extractOutliers(tiles, trafficType)

  val outliersPlain = outliers
    .map { it.geoTime() }
    .toTypedArray()

  val clusters = findClusters(outliersPlain, 6, 0.25)

  return clusters
    .map { cluster ->
      cluster.map { outliers[it] }
    }.toList()
}

internal fun extractOutliers(
  tiles: List<TrafficTileHour>,
  trafficType: TrafficType
): List<TrafficTileHour> = tiles
  .groupBy { it.id }
  .map { (_, tileTraffic) ->
    val values: DoubleArray = when (trafficType) {
      TrafficType.SPEED -> tileTraffic.map { it.traffic.speedKmH }.toDoubleArray()
      TrafficType.FLOW -> tileTraffic.map { it.traffic.freeFlowSpeedKmH }.toDoubleArray()
    }
    val outlierIndexes = findWeeklyOutliers(values, 2.0)
    tileTraffic.filterIndexed { index, _ -> index in outlierIndexes }
  }.toList().flatten().toList()
