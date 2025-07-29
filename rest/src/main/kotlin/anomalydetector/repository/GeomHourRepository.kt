package anomalydetector.repository

import anomalydetector.repository.model.GeomHour
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface GeomHourRepository : JpaRepository<GeomHour, UUID>
