package anomalydetector.model

import com.tomtom.tti.area.analytics.model.traffic.Traffic
import java.time.LocalDateTime

/**
 * Representation of a space-time object given Morton tile in given day and hour
 *
 * @property date The date of the tile hour.
 * @property hourOfTheDay The hour of the day (0-23).
 * @property mortonTileId The Morton Tile identifier for the tile hour.
 * @property traffic Traffic data associated with the tile hour.
 */
data class TrafficTileHour(
    val hourOfTheDay: LocalDateTime,
    val mortonTileId: Long,
    val traffic: Traffic)
