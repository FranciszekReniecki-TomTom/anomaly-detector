package com.tomtom.anomalydetector.repository

import com.tomtom.anomalydetector.model.Report
import java.util.UUID
import org.springframework.data.jpa.repository.JpaRepository

interface RaportRepository : JpaRepository<Report, UUID>
