package com.tomtom.anomalydetector.model

import jakarta.persistence.*
import java.util.*

@Entity
data class Cluster(
        @Id @GeneratedValue val id: UUID? = null,
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "report_id")
        val report: Report? = null,
        @OneToMany(mappedBy = "cluster", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
        val tileHours: List<TileHour> = emptyList()
)
