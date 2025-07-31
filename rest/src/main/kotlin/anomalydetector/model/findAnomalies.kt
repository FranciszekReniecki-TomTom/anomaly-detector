package anomalydetector.model

import anomalydetector.model.ingest.getData
import anomalydetector.model.detection.findOutliers
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import org.locationtech.jts.geom.Geometry
import java.time.LocalDate

fun findAnomalies(
  startDay: LocalDate,
  days: Int,
  tile: Long,
  level: String,
  geometry: Geometry
): List<TrafficTileHour> {

  val anomalies: List<TrafficTileHour> = findOutliers(
    getData(
      startDay = startDay,
      days = days,
      tile = tile,
      level = levelFromString(level),
      geometry = geometry
    )
  )



  return anomalies.sortedBy { it.date }
}

private fun levelFromString(level: String): MortonTileLevel<*> {
  return when (level) {
    "M12" -> MortonTileLevel.M12
    "M13" -> MortonTileLevel.M13
    "M14" -> MortonTileLevel.M14
    "M15" -> MortonTileLevel.M15
    "M16" -> MortonTileLevel.M16
    "M17" -> MortonTileLevel.M17
    "M18" -> MortonTileLevel.M18
    "M19" -> MortonTileLevel.M19
    else -> throw IllegalArgumentException("Unsupported tile level: $level")
  }
}