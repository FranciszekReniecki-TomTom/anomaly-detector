package anomalydetector.dto

import java.time.LocalDate
import org.locationtech.jts.geom.Geometry

/**
 * Data Transfer Object for Anomaly Detection Request
 *
 * @param level The Morton tile level representing resolution of calculations. Accepted values: M12
 *   to M19
 */
data class AnomalyRequestDto(
    val days: Int,
    val startDay: LocalDate,
    val tile: Long,
    val level: String,
    val geometry: Geometry,
)
