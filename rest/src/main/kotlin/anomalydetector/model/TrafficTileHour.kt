package anomalydetector.model

import com.tomtom.tti.area.analytics.model.traffic.Traffic
import com.tomtom.tti.nida.morton.geom.MortonTileLevel
import java.time.LocalDateTime

/**
 * Representation of a space-time object: Morton tile in given day and hour
 *
 * @property datetime The date and time of the tile hour.
 * @property id The Morton Tile identifier for the tile hour.
 * @property level The Morton tile level of the tile hour.
 * @property traffic Traffic data associated with the tile hour.
 */
data class TrafficTileHour(
  val datetime: LocalDateTime,
  val id: Long,
  val level: MortonTileLevel<*>,
  val traffic: Traffic
) {
  fun geoTime(): DoubleArray {
    val tile = level.getTile(id)
    val hour = datetime.dayOfYear * 24 + datetime.hour
    return doubleArrayOf(tile.lat, tile.lon, hour.toDouble())
  }

  fun stringify(): String {
    val tile = level.getTile(id)
    return "TTH: $datetime [$id (${tile.lat}, ${tile.lon})], traffic=$traffic"
  }
}