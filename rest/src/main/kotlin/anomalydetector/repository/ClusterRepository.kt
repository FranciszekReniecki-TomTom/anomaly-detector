package anomalydetector.repository

import anomalydetector.repository.model.Cluster
import java.util.UUID
import org.springframework.data.jpa.repository.JpaRepository

interface ClusterRepository : JpaRepository<Cluster, UUID>
