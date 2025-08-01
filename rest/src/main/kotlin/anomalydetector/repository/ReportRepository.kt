package anomalydetector.repository

import anomalydetector.repository.model.Report
import java.util.UUID
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository interface ReportRepository : JpaRepository<Report, UUID>
