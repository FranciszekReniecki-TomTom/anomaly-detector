package anomalydetector.service.labeling

import java.time.LocalDateTime

data class GeoTime(
    val lat: Double,
    val lon: Double,
    val time: LocalDateTime
)