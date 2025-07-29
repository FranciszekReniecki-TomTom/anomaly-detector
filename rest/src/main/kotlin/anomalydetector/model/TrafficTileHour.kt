package anomalydetector.model

import com.tomtom.tti.area.analytics.model.traffic.Traffic
import java.time.LocalDate

/**
 * Representation of a space-time object given Morton tile in given day and hour
 *
 * @property date The date of the tile hour.
 * @property hour The hour of the day (0-23).
 * @property id The Morton Tile identifier for the tile hour.
 * @property traffic Traffic data associated with the tile hour.
 */
data class TrafficTileHour(val date: LocalDate, val hour: Byte, val id: Long, val traffic: Traffic)

fun TrafficTileHour.stringify(): String {
    return "TTH: $date ${hour.hourToClock()} [$id], traffic=$traffic)"
}

private fun Byte.hourToClock(): String {
  val hourString = if (this < 10) "0$this" else this.toString()
  return "$hourString:00"
}