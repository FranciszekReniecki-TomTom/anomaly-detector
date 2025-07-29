package anomalydetector.dto

import org.locationtech.jts.geom.Geometry
import java.time.LocalDate

data class AnomalyRequestDto(
  val days: Int,
  val startDay: LocalDate,
  val tile: Long,
  val geometry: Geometry
)