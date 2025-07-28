package com.tomtom.anomalydetector.repository

import com.tomtom.anomalydetector.model.Cluster
import java.util.UUID
import org.springframework.data.jpa.repository.JpaRepository

interface ClusterRepository : JpaRepository<Cluster, UUID>
