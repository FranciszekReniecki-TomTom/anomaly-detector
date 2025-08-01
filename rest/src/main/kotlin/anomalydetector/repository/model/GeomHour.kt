package anomalydetector.repository.model

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*
import org.locationtech.jts.geom.Polygon

@Entity
data class GeomHour(
    @Id
    val id: UUID? = null,
    val timestamp: LocalDateTime,
    @Column(columnDefinition = "geometry(Polygon,4326)")
    val geometry: Polygon
)
