package anomalydetector.model

import com.tomtom.tti.area.analytics.model.traffic.Traffic
import java.time.LocalDateTime

/**
 * Representation of a space-time object given Morton tile in given day and hour
 *
 * @property trafficMeasurementDateTime date and time of the traffic measurement.
 * @property mortonTileId The Morton Tile identifier for the tile hour.
 * @property traffic Traffic data associated with the tile hour.
 */
data class TrafficTileHour(
    val trafficMeasurementDateTime: LocalDateTime,
    val mortonTileId: Long,
    val traffic: Traffic,
) {
    fun congestion(): Double =
        ((traffic.freeFlowSpeedKmH - traffic.speedKmH) / traffic.freeFlowSpeedKmH)
            .takeIf { traffic.freeFlowSpeedKmH > 0 } ?: 0.0
}