package anomalydetector.repository.model

import jakarta.persistence.*
import java.util.*

@Entity
data class Cluster(
    @Id
    val id: UUID? = null,
    @OneToMany(
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @JoinColumn(name = "cluster_id")
    val geomHours: List<GeomHour> = emptyList()
)
