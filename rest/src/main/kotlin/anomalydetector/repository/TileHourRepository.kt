package anomalydetector.repository

import anomalydetector.repository.model.TileHour
import anomalydetector.repository.model.TileHourId
import org.springframework.data.jpa.repository.JpaRepository

interface TileHourRepository : JpaRepository<TileHour, TileHourId>
