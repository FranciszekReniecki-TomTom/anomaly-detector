package anomalydetector.dto

import java.time.LocalDateTime
import org.locationtech.jts.geom.Polygon

enum class DataType {
    TOTAL_DISTANCE_M,
    SPEED_KHM,
    FREE_FLOW_SPEED_KHM,
}

data class AnomalyRequestDto(
    val startDay: LocalDateTime,
    val endDay: LocalDateTime,
    val polygon: Polygon,
    val dataType: DataType,
)
