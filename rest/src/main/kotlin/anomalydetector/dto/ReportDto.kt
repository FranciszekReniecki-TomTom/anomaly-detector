package anomalydetector.dto

import org.locationtech.jts.geom.Polygon
import java.time.LocalDateTime

data class ReportDto(
  val name: String,
  val hourToClassIdToPolygon: Map<LocalDateTime, Map<Int, Polygon>> = emptyMap()
)