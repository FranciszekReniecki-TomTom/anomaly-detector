package anomalydetector.repository.model

import jakarta.persistence.*
import java.util.*

@Entity
data class Cluster(
    @Id
    @GeneratedValue
    val id: UUID? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    val report: Report,
    @OneToMany(
        mappedBy = "cluster",
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        fetch = FetchType.LAZY)
    val geomHours: List<GeomHour> = emptyList()
)
