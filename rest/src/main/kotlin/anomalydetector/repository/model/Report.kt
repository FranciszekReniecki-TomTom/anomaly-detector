package anomalydetector.repository.model

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.*
import org.locationtech.jts.geom.Polygon

@Entity
data class Report(
        @Id
        val id: UUID? = null,
        val name: String,
        @Column(name = "creation_date")
        val creationDate: LocalDateTime,
        @Column(columnDefinition = "geometry(Polygon,4326)")
        val geometry: Polygon? = null,
        @OneToMany(
                cascade = [CascadeType.ALL],
                orphanRemoval = true,
                fetch = FetchType.LAZY
        )
        @JoinColumn(name = "report_id")
        val clusters: List<Cluster> = emptyList()
)
