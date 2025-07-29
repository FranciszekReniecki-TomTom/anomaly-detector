package anomalydetector.repository

import anomalydetector.repository.model.Report
import java.util.UUID
import org.springframework.data.jpa.repository.JpaRepository

interface ReportRepository : JpaRepository<Report, UUID>
