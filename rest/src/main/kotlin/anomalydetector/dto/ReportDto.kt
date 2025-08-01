package anomalydetector.dto

import java.time.LocalDateTime
import org.locationtech.jts.geom.Polygon

data class ReportDto(
    val name: String,
    val hourToClassIdToPolygon: Map<LocalDateTime, List<Pair<Int, Polygon>>> = emptyMap(),
)
